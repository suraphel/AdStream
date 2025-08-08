import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Download, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

export interface ImageData {
  url: string;
  key: string;
  originalName: string;
  variants?: {
    thumbnail: string;
    medium: string;
    original: string;
  };
}

interface ImageGalleryProps {
  images: ImageData[];
  className?: string;
  language?: 'en' | 'am';
  showThumbnails?: boolean;
  allowDownload?: boolean;
  maxThumbnails?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = '',
  language = 'en',
  showThumbnails = true,
  allowDownload = false,
  maxThumbnails = 5
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const translations = {
    en: {
      previousImage: 'Previous image',
      nextImage: 'Next image',
      closeGallery: 'Close gallery',
      downloadImage: 'Download image',
      zoomImage: 'Zoom image',
      imageOf: 'Image {current} of {total}',
      noImages: 'No images available'
    },
    am: {
      previousImage: 'ቀዳሚ ምስል',
      nextImage: 'ቀጣይ ምስል',
      closeGallery: 'ክፍተት ዝጋ',
      downloadImage: 'ምስል አውርድ',
      zoomImage: 'ምስል አሳድግ',
      imageOf: 'ምስል {current} ከ {total}',
      noImages: 'ምንም ምስሎች የሉም'
    }
  };

  const t = translations[language];

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 text-muted-foreground ${className}`}>
        <p>{t.noImages}</p>
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const openDialog = (index: number) => {
    setSelectedIndex(index);
    setIsDialogOpen(true);
  };

  const handleDownload = async (image: ImageData) => {
    try {
      const response = await fetch(image.variants?.original || image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.originalName || `image-${image.key}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <div className={className}>
      {/* Main Image */}
      <Card className="mb-4">
        <CardContent className="p-0">
          <div className="relative group aspect-[4/3] bg-muted">
            <img
              src={currentImage.variants?.medium || currentImage.url}
              alt={currentImage.originalName}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openDialog(selectedIndex)}
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={goToPrevious}
                  aria-label={t.previousImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={goToNext}
                  aria-label={t.nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Zoom Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => openDialog(selectedIndex)}
              aria-label={t.zoomImage}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {/* Download Button */}
            {allowDownload && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDownload(currentImage)}
                aria-label={t.downloadImage}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {t.imageOf.replace('{current}', (selectedIndex + 1).toString()).replace('{total}', images.length.toString())}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.slice(0, maxThumbnails).map((image, index) => (
            <button
              key={image.key}
              className={`flex-shrink-0 relative w-16 h-16 rounded border-2 transition-colors ${
                index === selectedIndex 
                  ? 'border-primary' 
                  : 'border-transparent hover:border-muted-foreground'
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={image.variants?.thumbnail || image.url}
                alt={image.originalName}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
          
          {/* More indicator */}
          {images.length > maxThumbnails && (
            <div className="flex-shrink-0 w-16 h-16 rounded border-2 border-dashed border-muted-foreground flex items-center justify-center text-xs text-muted-foreground">
              +{images.length - maxThumbnails}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-7xl w-full h-full max-h-screen p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsDialogOpen(false)}
              aria-label={t.closeGallery}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                  aria-label={t.previousImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={goToNext}
                  aria-label={t.nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Download Button */}
            {allowDownload && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 left-4 z-10 text-white hover:bg-white/20"
                onClick={() => handleDownload(currentImage)}
                aria-label={t.downloadImage}
              >
                <Download className="h-6 w-6" />
              </Button>
            )}

            {/* Main Image */}
            <img
              src={currentImage.variants?.original || currentImage.url}
              alt={currentImage.originalName}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-2 rounded">
              {currentImage.originalName}
              {images.length > 1 && (
                <span className="ml-2">
                  ({selectedIndex + 1} / {images.length})
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded">
                {images.map((image, index) => (
                  <button
                    key={image.key}
                    className={`w-12 h-12 rounded border-2 transition-colors ${
                      index === selectedIndex 
                        ? 'border-white' 
                        : 'border-transparent hover:border-white/50'
                    }`}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <img
                      src={image.variants?.thumbnail || image.url}
                      alt={image.originalName}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};