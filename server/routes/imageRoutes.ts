import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ImageService } from '../services/ImageService';
import { imageModerationService } from '../services/ImageModerationService';
import { isAuthenticated } from '../replitAuth';
import { db } from '../db';
import { listingImages } from '@shared/schema';
import { count } from 'drizzle-orm';

const router = Router();
const imageService = new ImageService();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Upload multiple images
router.post('/upload', isAuthenticated, upload.array('images', 10), async (req: any, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { listingId, folder = 'listings' } = req.body;
    const userId = req.user.claims.sub;

    if (!files || files.length === 0) {
      return res.status(400).json({ 
        message: 'No images provided',
        messageAm: 'ምንም ምስሎች አልቀረቡም'
      });
    }

    // Validate each file
    for (const file of files) {
      const validation = imageService.validateImageFile(file.buffer, file.mimetype, file.size);
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: validation.error,
          messageAm: getAmharicErrorMessage(validation.error!)
        });
      }
    }

    const uploadRequests = files.map(file => ({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      listingId: listingId ? parseInt(listingId) : undefined,
      userId
    }));

    const results = await imageService.uploadImages(uploadRequests, folder);

    // Moderate uploaded images (non-blocking)
    results.forEach(async (result, index) => {
      try {
        const imagePath = result.localPath || result.url;
        await imageModerationService.moderateImage(imagePath, result.id);
      } catch (error) {
        console.error(`Failed to moderate image ${result.id}:`, error);
      }
    });

    // Return uploaded image information
    const response = results.map((result, index) => ({
      id: result.id,
      url: result.url,
      key: result.key,
      size: result.size,
      mimeType: result.mimeType,
      originalName: files[index].originalname,
      moderationStatus: 'pending', // All new uploads start as pending
      variants: imageService.getImageVariants(result.key)
    }));

    res.json({
      message: 'Images uploaded successfully',
      messageAm: 'ምስሎች በተሳካ ሁኔታ ተሰቀሉ',
      images: response
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload images',
      messageAm: 'ምስሎችን መስቀል አልተሳካም',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload single image
router.post('/upload-single', isAuthenticated, upload.single('image'), async (req: any, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    const { listingId, folder = 'listings' } = req.body;
    const userId = req.user.claims.sub;

    if (!file) {
      return res.status(400).json({ 
        message: 'No image provided',
        messageAm: 'ምንም ምስል አልቀረበም'
      });
    }

    // Validate file
    const validation = imageService.validateImageFile(file.buffer, file.mimetype, file.size);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: validation.error,
        messageAm: getAmharicErrorMessage(validation.error!)
      });
    }

    const uploadRequest = {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      listingId: listingId ? parseInt(listingId) : undefined,
      userId
    };

    const result = await imageService.uploadSingleImage(uploadRequest, folder);

    res.json({
      message: 'Image uploaded successfully',
      messageAm: 'ምስል በተሳካ ሁኔታ ተሰቀለ',
      image: {
        url: result.url,
        key: result.key,
        size: result.size,
        mimeType: result.mimeType,
        originalName: file.originalname,
        variants: imageService.getImageVariants(result.key)
      }
    });

  } catch (error) {
    console.error('Single image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image',
      messageAm: 'ምስልን መስቀል አልተሳካም',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete image
router.delete('/:key', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { key } = req.params;
    const userId = req.user.claims.sub;

    // Decode the key (it may be URL encoded)
    const decodedKey = decodeURIComponent(key);

    // Check if image exists
    const exists = await imageService.imageExists(decodedKey);
    if (!exists) {
      return res.status(404).json({ 
        message: 'Image not found',
        messageAm: 'ምስል አልተገኘም'
      });
    }

    await imageService.deleteImage(decodedKey);

    res.json({
      message: 'Image deleted successfully',
      messageAm: 'ምስል በተሳካ ሁኔታ ተሰርዟል'
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ 
      message: 'Failed to delete image',
      messageAm: 'ምስልን መሰረዝ አልተሳካም',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get image metadata
router.get('/:key/metadata', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const decodedKey = decodeURIComponent(key);

    const metadata = await imageService.getImageMetadata(decodedKey);
    if (!metadata) {
      return res.status(404).json({ 
        message: 'Image not found',
        messageAm: 'ምስል አልተገኘም'
      });
    }

    res.json({
      message: 'Image metadata retrieved successfully',
      messageAm: 'የምስል መረጃ በተሳካ ሁኔታ ተመለሰ',
      metadata
    });

  } catch (error) {
    console.error('Get image metadata error:', error);
    res.status(500).json({ 
      message: 'Failed to get image metadata',
      messageAm: 'የምስል መረጃ ማግኘት አልተሳካም',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to get Amharic error messages
function getAmharicErrorMessage(englishError: string): string {
  const errorMap: Record<string, string> = {
    'File size exceeds 10MB limit': 'የፋይል መጠን ከ10MB ገደብ በላይ ነው',
    'File type not supported. Only JPEG, PNG, and WebP are allowed': 'የፋይል አይነት አይደገፍም። JPEG, PNG እና WebP ብቻ ተፈቅደዋል',
    'Invalid file type. Only JPEG, PNG, and WebP are allowed.': 'ትክክል ያልሆነ የፋይል አይነት። JPEG, PNG እና WebP ብቻ ተፈቅደዋል።',
    'No images provided': 'ምንም ምስሎች አልቀረቡም',
    'No image provided': 'ምንም ምስል አልቀረበም'
  };

  return errorMap[englishError] || englishError;
}

// Admin moderation endpoints
router.get('/admin/flagged', isAuthenticated, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    const userRole = req.user?.role || 'user';
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.',
        messageAm: 'መዳረሻ ውድቅ። የአስተዳዳሪ ፈቃድ ያስፈልጋል።'
      });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const flaggedImages = await imageModerationService.getFlaggedImages(limit);
    
    res.json({
      message: 'Flagged images retrieved successfully',
      messageAm: 'የተሰየሙ ምስሎች በተሳካ ሁኔታ ተመልሰዋል',
      images: flaggedImages
    });
  } catch (error) {
    console.error('Error fetching flagged images:', error);
    res.status(500).json({ 
      message: 'Failed to fetch flagged images',
      messageAm: 'የተሰየሙ ምስሎችን ማምጣት አልተሳካም'
    });
  }
});

router.post('/admin/review/:imageId', isAuthenticated, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    const userRole = req.user?.role || 'user';
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.',
        messageAm: 'መዳረሻ ውድቅ። የአስተዳዳሪ ፈቃድ ያስፈልጋል።'
      });
    }

    const imageId = parseInt(req.params.imageId);
    const { action, reason } = req.body; // action: 'approve' | 'reject'
    const adminUserId = req.user.claims.sub;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        message: 'Invalid action. Must be "approve" or "reject".',
        messageAm: 'የተሳሳተ ድርጊት። "ይፈቀድ" ወይም "ይከለከል" መሆን አለበት።'
      });
    }

    await imageModerationService.manualReview(imageId, action, adminUserId, reason);
    
    res.json({
      message: `Image ${action}ed successfully`,
      messageAm: `ምስል በተሳካ ሁኔታ ${action === 'approve' ? 'ፀድቋል' : 'ተከልክሏል'}`,
      action,
      imageId
    });
  } catch (error) {
    console.error('Error reviewing image:', error);
    res.status(500).json({ 
      message: 'Failed to review image',
      messageAm: 'ምስልን መገምገም አልተሳካም'
    });
  }
});

router.post('/admin/remoderate/:imageId', isAuthenticated, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    const userRole = req.user?.role || 'user';
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.',
        messageAm: 'መዳረሻ ውድቅ። የአስተዳዳሪ ፈቃድ ያስፈልጋል።'
      });
    }

    const imageId = parseInt(req.params.imageId);
    const result = await imageModerationService.reModerateImage(imageId);
    
    res.json({
      message: 'Image remoderated successfully',
      messageAm: 'ምስል እንደገና በተሳካ ሁኔታ ተገምግሟል',
      result
    });
  } catch (error) {
    console.error('Error remoderating image:', error);
    res.status(500).json({ 
      message: 'Failed to remoderate image',
      messageAm: 'ምስልን እንደገና መግመግም አልተሳካም'
    });
  }
});

export { router as imageRoutes };
export default router;