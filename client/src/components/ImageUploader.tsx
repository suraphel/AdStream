import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface UploadedImage {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  originalName: string;
  variants: {
    thumbnail: string;
    medium: string;
    original: string;
  };
}

interface ImageUploaderProps {
  onImagesChange: (images: UploadedImage[]) => void;
  initialImages?: UploadedImage[];
  maxImages?: number;
  disabled?: boolean;
  listingId?: number;
  language?: 'en' | 'am';
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesChange,
  initialImages = [],
  maxImages = 10,
  disabled = false,
  listingId,
  language = 'en',
  className = ''
}) => {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const translations = {
    en: {
      dragDropText: 'Drag and drop images here or click to select',
      uploadButton: 'Select Images',
      uploadingSingle: 'Uploading image...',
      uploadingMultiple: 'Uploading images...',
      removeImage: 'Remove image',
      addMore: 'Add more images',
      maxImagesReached: `Maximum ${maxImages} images allowed`,
      uploadSuccess: 'Images uploaded successfully',
      uploadError: 'Failed to upload images',
      deleteError: 'Failed to delete image',
      fileTypeError: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      fileSizeError: 'File size exceeds 10MB limit',
      primaryImage: 'Primary image',
      setPrimary: 'Set as primary'
    },
    am: {
      dragDropText: 'ምስሎችን እዚህ ይጎትቱ እና ይጣሉ ወይም ለመምረጥ ይጫኑ',
      uploadButton: 'ምስሎች ይምረጡ',
      uploadingSingle: 'ምስል እየተሰቀለ...',
      uploadingMultiple: 'ምስሎች እየተሰቀሉ...',
      removeImage: 'ምስል አስወግድ',
      addMore: 'ተጨማሪ ምስሎች ጨምር',
      maxImagesReached: `ከፍተኛው ${maxImages} ምስሎች ተፈቅደዋል`,
      uploadSuccess: 'ምስሎች በተሳካ ሁኔታ ተሰቀሉ',
      uploadError: 'ምስሎችን መስቀል አልተሳካም',
      deleteError: 'ምስልን መሰረዝ አልተሳካም',
      fileTypeError: 'ትክክል ያልሆነ የፋይል አይነት። JPEG, PNG እና WebP ብቻ ተፈቅደዋል።',
      fileSizeError: 'የፋይል መጠን ከ10MB ገደብ በላይ ነው',
      primaryImage: 'ዋና ምስል',
      setPrimary: 'እንደ ዋና ያስቀምጡ'
    }
  };

  const t = translations[language];

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      if (listingId) {
        formData.append('listingId', listingId.toString());
      }

      const response = await apiRequest('POST', '/api/images/upload', formData);
      return response.data;
    },
    onSuccess: (data) => {
      const newImages = [...images, ...data.images];
      setImages(newImages);
      onImagesChange(newImages);
      
      toast({
        title: t.uploadSuccess,
        description: data.messageAm && language === 'am' ? data.messageAm : data.message,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || t.uploadError;
      toast({
        title: t.uploadError,
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest('DELETE', `/api/images/${encodeURIComponent(key)}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
    },
    onError: (error: any) => {
      toast({
        title: t.deleteError,
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const validateFiles = (files: File[]): boolean => {
    for (const file of files) {
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({
          title: t.fileTypeError,
          variant: 'destructive',
        });
        return false;
      }

      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t.fileSizeError,
          variant: 'destructive',
        });
        return false;
      }
    }

    // Check total image count
    if (images.length + files.length > maxImages) {
      toast({
        title: t.maxImagesReached,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((files: File[]) => {
    if (!validateFiles(files)) return;
    uploadMutation.mutate(files);
  }, [images.length, maxImages]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleFileSelect(imageFiles);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    
    deleteMutation.mutate(imageToRemove.key, {
      onSuccess: () => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages);
      }
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {images.length < maxImages && (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            {uploadMutation.isPending ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                  {images.length === 0 ? t.uploadingSingle : t.uploadingMultiple}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  {t.dragDropText}
                </p>
                <Button variant="outline" size="sm" disabled={disabled}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.uploadButton}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={image.key} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <img
                    src={image.variants?.thumbnail || image.url}
                    alt={image.originalName}
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                  
                  {/* Primary Image Badge */}
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      {t.primaryImage}
                    </div>
                  )}

                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    disabled={disabled || deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </Button>

                  {/* Set Primary Button */}
                  {index !== 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-1 left-1 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(index, 0);
                      }}
                      disabled={disabled}
                    >
                      {t.setPrimary}
                    </Button>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-2 truncate" title={image.originalName}>
                  {image.originalName}
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Add More Button */}
          {images.length < maxImages && (
            <Card 
              className="border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center justify-center aspect-square p-2">
                <Plus className="h-8 w-8 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground text-center">
                  {t.addMore}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Image Count */}
      {images.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {images.length} / {maxImages} {language === 'am' ? 'ምስሎች' : 'images'}
        </p>
      )}
    </div>
  );
};