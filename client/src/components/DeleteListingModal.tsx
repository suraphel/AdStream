import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trash2, AlertTriangle } from 'lucide-react';
import type { ListingWithDetails } from '@shared/schema';

interface DeleteListingModalProps {
  listing: ListingWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteListingModal({
  listing,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteListingModalProps) {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Delete Listing',
      description: 'Are you sure you want to delete this listing? This action cannot be undone.',
      listingTitle: 'Listing:',
      cancel: 'Cancel',
      delete: 'Delete',
      deleting: 'Deleting...',
      warning: 'Warning',
      permanentAction: 'This will permanently remove your listing from the marketplace.',
    },
    am: {
      title: 'ዕቃ ደምስስ',
      description: 'እርግጠኛ ነዎት ይህን ዕቃ መደምሰስ ይፈልጋሉ? ይህ እርምጃ መቀልበስ አይቻልም።',
      listingTitle: 'ዕቃ:',
      cancel: 'ይቅር',
      delete: 'ደምስስ',
      deleting: 'እየተደመሰሰ...',
      warning: 'ማስጠንቀቂያ',
      permanentAction: 'ይህ ዕቃዎን ከገበያው ላይ በቋሚነት ያስወግዳል።',
    },
  };

  const t = translations[language];

  if (!listing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>{t.description}</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {t.listingTitle}
              </p>
              <p className="text-sm text-gray-900 font-semibold">
                {listing.title}
              </p>
            </div>
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{t.permanentAction}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? t.deleting : t.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}