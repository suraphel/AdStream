import { IImageStorage, ImageUploadConfig } from './IImageStorage';
import { LocalImageStorage } from './LocalImageStorage';
import { AzureBlobImageStorage } from './CloudImageStorage';

export type StorageType = 'local' | 'azure' | 'aws';

export interface StorageConfig {
  type: StorageType;
  local?: {
    baseDir?: string;
    baseUrl?: string;
  };
  azure?: {
    connectionString: string;
    containerName?: string;
  };
  aws?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
  };
  uploadConfig?: Partial<ImageUploadConfig>;
}

export class ImageStorageFactory {
  static create(config: StorageConfig): IImageStorage {
    switch (config.type) {
      case 'local':
        return new LocalImageStorage(
          config.local?.baseDir,
          config.local?.baseUrl,
          config.uploadConfig
        );
      
      case 'azure':
        if (!config.azure?.connectionString) {
          throw new Error('Azure connection string is required');
        }
        return new AzureBlobImageStorage(
          config.azure.connectionString,
          config.azure.containerName,
          config.uploadConfig
        );
      
      case 'aws':
        // AWS S3 implementation would go here
        throw new Error('AWS S3 storage not yet implemented');
      
      default:
        throw new Error(`Unsupported storage type: ${config.type}`);
    }
  }

  static createFromEnvironment(): IImageStorage {
    const storageType = (process.env.IMAGE_STORAGE_TYPE as StorageType) || 'local';
    
    const config: StorageConfig = {
      type: storageType,
      uploadConfig: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
        maxImagesPerListing: parseInt(process.env.MAX_IMAGES_PER_LISTING || '10'),
        allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(',')
      }
    };

    switch (storageType) {
      case 'local':
        config.local = {
          baseDir: process.env.UPLOAD_DIR || './uploads',
          baseUrl: process.env.UPLOAD_URL || '/uploads'
        };
        break;
      
      case 'azure':
        config.azure = {
          connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING!,
          containerName: process.env.AZURE_CONTAINER_NAME || 'images'
        };
        break;
      
      case 'aws':
        config.aws = {
          region: process.env.AWS_REGION!,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          bucketName: process.env.AWS_S3_BUCKET_NAME!
        };
        break;
    }

    return this.create(config);
  }
}