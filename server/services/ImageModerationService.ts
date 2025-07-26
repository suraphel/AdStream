import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { db } from '../db';
import { listingImages, type ListingImage } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface ModerationResult {
  isAppropriate: boolean;
  score: number;
  reason?: string;
  categories?: string[];
}

export interface ImageAnalysis {
  hasNudity: boolean;
  hasViolence: boolean;
  hasInappropriateContent: boolean;
  confidence: number;
  details: string[];
}

export class ImageModerationService {
  private readonly deepAiApiKey = process.env.DEEPAI_API_KEY;
  private readonly moderationThreshold = 0.7; // 70% confidence threshold
  
  /**
   * Moderate an uploaded image using multiple checks
   */
  async moderateImage(imagePath: string, imageId: number): Promise<ModerationResult> {
    try {
      console.log(`Starting moderation for image ${imageId} at path: ${imagePath}`);
      
      // 1. Basic image preprocessing with Sharp
      const preprocessResult = await this.preprocessImage(imagePath);
      if (!preprocessResult.isValid) {
        return {
          isAppropriate: false,
          score: 1.0,
          reason: 'Invalid image format or corrupted file',
          categories: ['technical_error']
        };
      }

      // 2. Run content detection analysis
      const analysisResult = await this.analyzeImageContent(imagePath);
      
      // 3. Check with DeepAI API if available
      let deepAiResult: ModerationResult | null = null;
      if (this.deepAiApiKey) {
        deepAiResult = await this.checkWithDeepAI(imagePath);
      }

      // 4. Combine results to make final decision
      const finalResult = this.combineResults(analysisResult, deepAiResult);
      
      // 5. Update database with moderation result
      await this.updateModerationStatus(imageId, finalResult);
      
      console.log(`Moderation completed for image ${imageId}:`, finalResult);
      return finalResult;
      
    } catch (error) {
      console.error('Error during image moderation:', error);
      
      // Mark as flagged for manual review on error
      const errorResult: ModerationResult = {
        isAppropriate: false,
        score: 1.0,
        reason: `Moderation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        categories: ['technical_error']
      };
      
      await this.updateModerationStatus(imageId, errorResult);
      return errorResult;
    }
  }

  /**
   * Preprocess image using Sharp - validate format, size, and basic properties
   */
  private async preprocessImage(imagePath: string): Promise<{ isValid: boolean; details: string[] }> {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const details: string[] = [];
      
      // Check if image format is supported
      const supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      if (!metadata.format || !supportedFormats.includes(metadata.format)) {
        details.push(`Unsupported format: ${metadata.format}`);
        return { isValid: false, details };
      }
      
      // Check image dimensions
      if (!metadata.width || !metadata.height) {
        details.push('Unable to determine image dimensions');
        return { isValid: false, details };
      }
      
      // Check for reasonable dimensions (not too small or extremely large)
      if (metadata.width < 50 || metadata.height < 50) {
        details.push('Image too small');
        return { isValid: false, details };
      }
      
      if (metadata.width > 10000 || metadata.height > 10000) {
        details.push('Image too large');
        return { isValid: false, details };
      }
      
      details.push(`Valid ${metadata.format} image: ${metadata.width}x${metadata.height}`);
      return { isValid: true, details };
      
    } catch (error) {
      return { 
        isValid: false, 
        details: [`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  /**
   * Analyze image content using basic heuristics and file analysis
   */
  private async analyzeImageContent(imagePath: string): Promise<ImageAnalysis> {
    try {
      const image = sharp(imagePath);
      const { data, info } = await image
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });
      
      // Basic content analysis using pixel data
      const analysis = this.analyzePixelData(data, info);
      
      return analysis;
    } catch (error) {
      console.error('Content analysis failed:', error);
      return {
        hasNudity: false,
        hasViolence: false,
        hasInappropriateContent: false,
        confidence: 0,
        details: ['Content analysis failed']
      };
    }
  }

  /**
   * Analyze pixel data for potential inappropriate content indicators
   */
  private analyzePixelData(data: Buffer, info: sharp.OutputInfo): ImageAnalysis {
    const { width, height, channels } = info;
    const details: string[] = [];
    
    // Calculate basic statistics
    let totalPixels = width * height;
    let skinTonePixels = 0;
    let darkPixels = 0;
    let brightPixels = 0;
    
    // Sample every 10th pixel to improve performance
    for (let i = 0; i < data.length; i += channels * 10) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Basic skin tone detection (simplified)
      if (this.isSkinTone(r, g, b)) {
        skinTonePixels++;
      }
      
      // Brightness analysis
      const brightness = (r + g + b) / 3;
      if (brightness < 50) darkPixels++;
      if (brightness > 200) brightPixels++;
    }
    
    totalPixels = totalPixels / 10; // Adjust for sampling
    const skinRatio = skinTonePixels / totalPixels;
    const darkRatio = darkPixels / totalPixels;
    
    details.push(`Skin tone ratio: ${(skinRatio * 100).toFixed(2)}%`);
    details.push(`Dark pixel ratio: ${(darkRatio * 100).toFixed(2)}%`);
    
    // Simple heuristics (these are basic and would need refinement)
    const hasHighSkinTone = skinRatio > 0.3; // More than 30% skin tone
    const hasExtremeContrast = darkRatio > 0.4 || (brightPixels / totalPixels) > 0.4;
    
    return {
      hasNudity: hasHighSkinTone && hasExtremeContrast,
      hasViolence: false, // Would need more sophisticated analysis
      hasInappropriateContent: hasHighSkinTone && hasExtremeContrast,
      confidence: hasHighSkinTone ? 0.6 : 0.3, // Basic confidence
      details
    };
  }

  /**
   * Simple skin tone detection
   */
  private isSkinTone(r: number, g: number, b: number): boolean {
    // Basic skin tone detection algorithm
    return (
      r > 95 && g > 40 && b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 && r > g && r > b
    );
  }

  /**
   * Check image with DeepAI API for explicit content
   */
  private async checkWithDeepAI(imagePath: string): Promise<ModerationResult | null> {
    if (!this.deepAiApiKey) {
      console.log('DeepAI API key not configured, skipping external check');
      return null;
    }

    try {
      console.log('Checking image with DeepAI API...');
      
      const imageBuffer = await fs.readFile(imagePath);
      
      const formData = new FormData();
      formData.append('image', new Blob([imageBuffer]), path.basename(imagePath));

      const response = await fetch('https://api.deepai.org/api/nsfw-detector', {
        method: 'POST',
        headers: {
          'Api-Key': this.deepAiApiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`DeepAI API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('DeepAI response:', result);
      
      const nsfwScore = result.output?.nsfw_score || 0;
      const isInappropriate = nsfwScore > this.moderationThreshold;
      
      return {
        isAppropriate: !isInappropriate,
        score: nsfwScore,
        reason: isInappropriate ? 'Explicit content detected by AI analysis' : undefined,
        categories: isInappropriate ? ['explicit_content'] : []
      };
      
    } catch (error) {
      console.error('DeepAI API check failed:', error);
      return null; // Don't fail the entire process if external API fails
    }
  }

  /**
   * Combine results from different analysis methods
   */
  private combineResults(
    pixelAnalysis: ImageAnalysis, 
    deepAiResult: ModerationResult | null
  ): ModerationResult {
    const reasons: string[] = [];
    const categories: string[] = [];
    let maxScore = 0;
    let isInappropriate = false;

    // Check pixel analysis results
    if (pixelAnalysis.hasInappropriateContent) {
      isInappropriate = true;
      maxScore = Math.max(maxScore, pixelAnalysis.confidence);
      reasons.push('Potential inappropriate content detected');
      categories.push('suspicious_content');
    }

    // Check DeepAI results
    if (deepAiResult && !deepAiResult.isAppropriate) {
      isInappropriate = true;
      maxScore = Math.max(maxScore, deepAiResult.score);
      if (deepAiResult.reason) reasons.push(deepAiResult.reason);
      if (deepAiResult.categories) categories.push(...deepAiResult.categories);
    }

    // If neither method found issues, mark as appropriate
    if (!isInappropriate) {
      return {
        isAppropriate: true,
        score: Math.max(pixelAnalysis.confidence, deepAiResult?.score || 0),
        reason: undefined,
        categories: []
      };
    }

    return {
      isAppropriate: false,
      score: maxScore,
      reason: reasons.join('; '),
      categories: Array.from(new Set(categories))
    };
  }

  /**
   * Update moderation status in database
   */
  private async updateModerationStatus(imageId: number, result: ModerationResult): Promise<void> {
    const status = result.isAppropriate ? 'approved' : 'rejected';
    
    await db
      .update(listingImages)
      .set({
        moderationStatus: status,
        moderationScore: result.score.toString(),
        moderationReason: result.reason,
        moderatedAt: new Date(),
        moderatedBy: 'system'
      })
      .where(eq(listingImages.id, imageId));
  }

  /**
   * Get flagged images for admin review
   */
  async getFlaggedImages(limit: number = 50): Promise<ListingImage[]> {
    return await db
      .select()
      .from(listingImages)
      .where(eq(listingImages.moderationStatus, 'flagged'))
      .limit(limit);
  }

  /**
   * Manually approve or reject an image (admin action)
   */
  async manualReview(
    imageId: number, 
    action: 'approve' | 'reject', 
    adminUserId: string, 
    reason?: string
  ): Promise<void> {
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    await db
      .update(listingImages)
      .set({
        moderationStatus: status,
        moderationReason: reason,
        moderatedAt: new Date(),
        moderatedBy: adminUserId
      })
      .where(eq(listingImages.id, imageId));
  }

  /**
   * Re-moderate an image (for testing or after model updates)
   */
  async reModerateImage(imageId: number): Promise<ModerationResult> {
    const [image] = await db
      .select()
      .from(listingImages)
      .where(eq(listingImages.id, imageId))
      .limit(1);

    if (!image) {
      throw new Error(`Image ${imageId} not found`);
    }

    // Reset moderation status
    await db
      .update(listingImages)
      .set({
        moderationStatus: 'pending',
        moderationScore: null,
        moderationReason: null,
        moderatedAt: null,
        moderatedBy: null
      })
      .where(eq(listingImages.id, imageId));

    // Re-run moderation
    const imagePath = path.join(process.cwd(), 'uploads', path.basename(image.imageUrl));
    return await this.moderateImage(imagePath, imageId);
  }
}

export const imageModerationService = new ImageModerationService();