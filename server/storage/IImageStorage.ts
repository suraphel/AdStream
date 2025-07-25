export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface ImageMetadata {
  originalName: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface IImageStorage {
  /**
   * Upload a single image
   */
  uploadImage(
    buffer: Buffer,
    metadata: ImageMetadata,
    folder?: string
  ): Promise<UploadResult>;

  /**
   * Upload multiple images
   */
  uploadImages(
    files: Array<{ buffer: Buffer; metadata: ImageMetadata }>,
    folder?: string
  ): Promise<UploadResult[]>;

  /**
   * Delete an image by key
   */
  deleteImage(key: string): Promise<void>;

  /**
   * Delete multiple images by keys
   */
  deleteImages(keys: string[]): Promise<void>;

  /**
   * Get a signed URL for accessing an image (for private storage)
   */
  getImageUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Check if an image exists
   */
  imageExists(key: string): Promise<boolean>;

  /**
   * Get image metadata
   */
  getImageMetadata(key: string): Promise<ImageMetadata | null>;
}

export interface ImageUploadConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  maxImagesPerListing: number;
  resizeOptions?: {
    thumbnail: { width: number; height: number };
    medium: { width: number; height: number };
    large: { width: number; height: number };
  };
}