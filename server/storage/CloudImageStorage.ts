import { IImageStorage, UploadResult, ImageMetadata, ImageUploadConfig } from './IImageStorage';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

/**
 * Cloud storage implementation for Azure Blob Storage or AWS S3
 * This is a template that can be extended for specific cloud providers
 */
export abstract class CloudImageStorage implements IImageStorage {
  protected readonly config: ImageUploadConfig;
  protected readonly containerName: string;

  constructor(
    containerName: string = 'images',
    config?: Partial<ImageUploadConfig>
  ) {
    this.containerName = containerName;
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
    
    // Generate unique key
    const ext = this.getFileExtension(metadata.mimeType);
    const key = `${folder}/${nanoid()}.${ext}`;

    // Process image
    const processedBuffer = await this.processImage(buffer, metadata.mimeType);
    
    // Upload to cloud storage
    const url = await this.uploadToCloud(key, processedBuffer, metadata.mimeType);

    // Generate and upload thumbnails
    if (this.config.resizeOptions) {
      await this.generateAndUploadThumbnails(processedBuffer, key, metadata.mimeType);
    }

    return {
      url,
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
    await this.deleteFromCloud(key);
    
    // Delete thumbnails
    if (this.config.resizeOptions) {
      await this.deleteThumbnailsFromCloud(key);
    }
  }

  async deleteImages(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.deleteImage(key)));
  }

  // Abstract methods to be implemented by specific cloud providers
  protected abstract uploadToCloud(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  protected abstract deleteFromCloud(key: string): Promise<void>;
  protected abstract getCloudImageUrl(key: string, expiresIn?: number): Promise<string>;
  protected abstract cloudImageExists(key: string): Promise<boolean>;
  protected abstract getCloudImageMetadata(key: string): Promise<ImageMetadata | null>;

  async getImageUrl(key: string, expiresIn?: number): Promise<string> {
    return this.getCloudImageUrl(key, expiresIn);
  }

  async imageExists(key: string): Promise<boolean> {
    return this.cloudImageExists(key);
  }

  async getImageMetadata(key: string): Promise<ImageMetadata | null> {
    return this.getCloudImageMetadata(key);
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

  private async generateAndUploadThumbnails(
    buffer: Buffer,
    originalKey: string,
    mimeType: string
  ): Promise<void> {
    if (!this.config.resizeOptions) return;

    const image = sharp(buffer);
    const { resizeOptions } = this.config;
    
    const baseKey = originalKey.replace(/\.[^/.]+$/, '');
    
    // Generate and upload thumbnail
    const thumbnailBuffer = await image
      .clone()
      .resize(resizeOptions.thumbnail.width, resizeOptions.thumbnail.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    await this.uploadToCloud(`${baseKey}_thumb.jpg`, thumbnailBuffer, 'image/jpeg');

    // Generate and upload medium size
    const mediumBuffer = await image
      .clone()
      .resize(resizeOptions.medium.width, resizeOptions.medium.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    await this.uploadToCloud(`${baseKey}_medium.jpg`, mediumBuffer, 'image/jpeg');
  }

  private async deleteThumbnailsFromCloud(key: string): Promise<void> {
    const baseKey = key.replace(/\.[^/.]+$/, '');
    const thumbnailKeys = [
      `${baseKey}_thumb.jpg`,
      `${baseKey}_medium.jpg`
    ];

    await Promise.all(
      thumbnailKeys.map(thumbKey => this.deleteFromCloud(thumbKey))
    );
  }

  protected getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    return extensions[mimeType] || 'jpg';
  }
}

/**
 * Example Azure Blob Storage implementation
 */
export class AzureBlobImageStorage extends CloudImageStorage {
  private blobServiceClient: any; // @azure/storage-blob BlobServiceClient

  constructor(
    connectionString: string,
    containerName: string = 'images',
    config?: Partial<ImageUploadConfig>
  ) {
    super(containerName, config);
    // Initialize Azure Blob Service Client
    // this.blobServiceClient = new BlobServiceClient(connectionString);
  }

  protected async uploadToCloud(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    // Implementation for Azure Blob Storage
    // const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    // const blockBlobClient = containerClient.getBlockBlobClient(key);
    // await blockBlobClient.upload(buffer, buffer.length, { blobHTTPHeaders: { blobContentType: mimeType } });
    // return blockBlobClient.url;
    
    // Placeholder for now
    return `https://your-storage-account.blob.core.windows.net/${this.containerName}/${key}`;
  }

  protected async deleteFromCloud(key: string): Promise<void> {
    // Implementation for Azure Blob Storage
    // const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    // const blockBlobClient = containerClient.getBlockBlobClient(key);
    // await blockBlobClient.deleteIfExists();
  }

  protected async getCloudImageUrl(key: string, expiresIn?: number): Promise<string> {
    // Implementation for Azure Blob Storage with SAS token if needed
    return `https://your-storage-account.blob.core.windows.net/${this.containerName}/${key}`;
  }

  protected async cloudImageExists(key: string): Promise<boolean> {
    // Implementation for Azure Blob Storage
    // const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    // const blockBlobClient = containerClient.getBlockBlobClient(key);
    // return await blockBlobClient.exists();
    return false;
  }

  protected async getCloudImageMetadata(key: string): Promise<ImageMetadata | null> {
    // Implementation for Azure Blob Storage
    return null;
  }
}