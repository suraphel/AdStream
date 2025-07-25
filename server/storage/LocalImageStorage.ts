import { IImageStorage, UploadResult, ImageMetadata, ImageUploadConfig } from './IImageStorage';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

export class LocalImageStorage implements IImageStorage {
  private readonly baseDir: string;
  private readonly baseUrl: string;
  private readonly config: ImageUploadConfig;

  constructor(
    baseDir: string = './uploads',
    baseUrl: string = '/uploads',
    config?: Partial<ImageUploadConfig>
  ) {
    this.baseDir = baseDir;
    this.baseUrl = baseUrl;
    this.config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxImagesPerListing: 10,
      resizeOptions: {
        thumbnail: { width: 150, height: 150 },
        medium: { width: 500, height: 500 },
        large: { width: 1200, height: 1200 }
      },
      ...config
    };
  }

  async uploadImage(
    buffer: Buffer,
    metadata: ImageMetadata,
    folder: string = 'listings'
  ): Promise<UploadResult> {
    await this.validateImage(buffer, metadata);
    
    // Create directory if it doesn't exist
    const uploadDir = path.join(this.baseDir, folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = this.getFileExtension(metadata.mimeType);
    const key = `${folder}/${nanoid()}.${ext}`;
    const filePath = path.join(this.baseDir, key);

    // Process and save image
    const processedBuffer = await this.processImage(buffer, metadata.mimeType);
    await fs.writeFile(filePath, processedBuffer);

    // Generate thumbnails if resize options are configured
    if (this.config.resizeOptions) {
      await this.generateThumbnails(processedBuffer, key);
    }

    return {
      url: `${this.baseUrl}/${key}`,
      key,
      size: processedBuffer.length,
      mimeType: metadata.mimeType
    };
  }

  async uploadImages(
    files: Array<{ buffer: Buffer; metadata: ImageMetadata }>,
    folder: string = 'listings'
  ): Promise<UploadResult[]> {
    if (files.length > this.config.maxImagesPerListing) {
      throw new Error(`Maximum ${this.config.maxImagesPerListing} images allowed per listing`);
    }

    const results: UploadResult[] = [];
    for (const file of files) {
      const result = await this.uploadImage(file.buffer, file.metadata, folder);
      results.push(result);
    }
    return results;
  }

  async deleteImage(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    
    try {
      await fs.unlink(filePath);
      
      // Delete thumbnails if they exist
      if (this.config.resizeOptions) {
        await this.deleteThumbnails(key);
      }
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async deleteImages(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.deleteImage(key)));
  }

  async getImageUrl(key: string, expiresIn?: number): Promise<string> {
    // For local storage, return the public URL directly
    return `${this.baseUrl}/${key}`;
  }

  async imageExists(key: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getImageMetadata(key: string): Promise<ImageMetadata | null> {
    const filePath = path.join(this.baseDir, key);
    
    try {
      const stats = await fs.stat(filePath);
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      return {
        originalName: path.basename(key),
        size: stats.size,
        mimeType: `image/${metadata.format}`,
        width: metadata.width,
        height: metadata.height
      };
    } catch {
      return null;
    }
  }

  private async validateImage(buffer: Buffer, metadata: ImageMetadata): Promise<void> {
    // Check file size
    if (buffer.length > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.config.maxFileSize} bytes`);
    }

    // Check mime type
    if (!this.config.allowedMimeTypes.includes(metadata.mimeType)) {
      throw new Error(`File type ${metadata.mimeType} is not allowed`);
    }

    // Validate that the buffer is actually an image
    try {
      const image = sharp(buffer);
      await image.metadata();
    } catch {
      throw new Error('Invalid image file');
    }
  }

  private async processImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    const image = sharp(buffer);
    
    // Auto-rotate based on EXIF data and remove metadata
    return await image
      .rotate()
      .jpeg({ quality: 90, progressive: true })
      .toBuffer();
  }

  private async generateThumbnails(buffer: Buffer, originalKey: string): Promise<void> {
    if (!this.config.resizeOptions) return;

    const image = sharp(buffer);
    const { resizeOptions } = this.config;
    
    const baseKey = originalKey.replace(/\.[^/.]+$/, '');
    
    // Generate thumbnail
    const thumbnailBuffer = await image
      .clone()
      .resize(resizeOptions.thumbnail.width, resizeOptions.thumbnail.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    const thumbnailPath = path.join(this.baseDir, `${baseKey}_thumb.jpg`);
    await fs.writeFile(thumbnailPath, thumbnailBuffer);

    // Generate medium size
    const mediumBuffer = await image
      .clone()
      .resize(resizeOptions.medium.width, resizeOptions.medium.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    const mediumPath = path.join(this.baseDir, `${baseKey}_medium.jpg`);
    await fs.writeFile(mediumPath, mediumBuffer);
  }

  private async deleteThumbnails(key: string): Promise<void> {
    const baseKey = key.replace(/\.[^/.]+$/, '');
    const thumbnailKeys = [
      `${baseKey}_thumb.jpg`,
      `${baseKey}_medium.jpg`
    ];

    await Promise.all(
      thumbnailKeys.map(async (thumbKey) => {
        const thumbPath = path.join(this.baseDir, thumbKey);
        try {
          await fs.unlink(thumbPath);
        } catch (error) {
          if ((error as any).code !== 'ENOENT') {
            console.warn(`Failed to delete thumbnail ${thumbKey}:`, error);
          }
        }
      })
    );
  }

  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    return extensions[mimeType] || 'jpg';
  }
}