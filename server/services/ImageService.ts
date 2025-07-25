import { IImageStorage, UploadResult, ImageMetadata } from '../storage/IImageStorage';
import { ImageStorageFactory } from '../storage/ImageStorageFactory';

export interface ImageUploadRequest {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  listingId?: number;
  userId: string;
}

export class ImageService {
  private storage: IImageStorage;

  constructor(storage?: IImageStorage) {
    this.storage = storage || ImageStorageFactory.createFromEnvironment();
  }

  async uploadImages(
    requests: ImageUploadRequest[],
    folder: string = 'listings'
  ): Promise<UploadResult[]> {
    const files = requests.map(req => ({
      buffer: req.buffer,
      metadata: {
        originalName: req.originalName,
        size: req.size,
        mimeType: req.mimeType
      } as ImageMetadata
    }));

    return await this.storage.uploadImages(files, folder);
  }

  async uploadSingleImage(
    request: ImageUploadRequest,
    folder: string = 'listings'
  ): Promise<UploadResult> {
    const metadata: ImageMetadata = {
      originalName: request.originalName,
      size: request.size,
      mimeType: request.mimeType
    };

    return await this.storage.uploadImage(request.buffer, metadata, folder);
  }

  async deleteImage(storageKey: string): Promise<void> {
    await this.storage.deleteImage(storageKey);
  }

  async deleteImages(storageKeys: string[]): Promise<void> {
    await this.storage.deleteImages(storageKeys);
  }

  async getImageUrl(storageKey: string, expiresIn?: number): Promise<string> {
    return await this.storage.getImageUrl(storageKey, expiresIn);
  }

  async imageExists(storageKey: string): Promise<boolean> {
    return await this.storage.imageExists(storageKey);
  }

  async getImageMetadata(storageKey: string): Promise<ImageMetadata | null> {
    return await this.storage.getImageMetadata(storageKey);
  }

  validateImageFile(buffer: Buffer, mimeType: string, size: number): { isValid: boolean; error?: string } {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    // Check mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      return { isValid: false, error: 'File type not supported. Only JPEG, PNG, and WebP are allowed' };
    }

    return { isValid: true };
  }

  getImageVariants(storageKey: string): { thumbnail: string; medium: string; original: string } {
    const baseKey = storageKey.replace(/\.[^/.]+$/, '');
    const baseUrl = '/uploads';

    return {
      thumbnail: `${baseUrl}/${baseKey}_thumb.jpg`,
      medium: `${baseUrl}/${baseKey}_medium.jpg`,
      original: `${baseUrl}/${storageKey}`
    };
  }
}