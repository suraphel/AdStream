import sharp from 'sharp';
import { promises as fs } from 'fs';
import { db } from '../db';
import { listingImages, moderationLogs } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Simple NSFW detection using file characteristics and basic heuristics
// In production, you would integrate with services like Google Vision API, AWS Rekognition, or NSFW.js

export interface ModerationResult {
  isNSFW: boolean;
  score: number; // 0-1, where 1 is definitely NSFW
  reason?: string;
  action: 'approved' | 'flagged' | 'removed';
}

export class NSFWModerationService {
  private static readonly NSFW_THRESHOLD = 0.7;
  private static readonly FLAG_THRESHOLD = 0.5;

  static async moderateImage(imagePath: string, imageId: number): Promise<ModerationResult> {
    try {
      // Basic image analysis using Sharp
      const imageBuffer = await fs.readFile(imagePath);
      const metadata = await sharp(imageBuffer).metadata();
      
      let score = 0;
      let reason = '';
      
      // Basic heuristics for NSFW detection
      // 1. Check image dimensions (very wide or very tall might be suspicious)
      if (metadata.width && metadata.height) {
        const aspectRatio = metadata.width / metadata.height;
        if (aspectRatio > 3 || aspectRatio < 0.3) {
          score += 0.1;
          reason += 'Unusual aspect ratio. ';
        }
      }

      // 2. Check file size (very small images might be problematic)
      const stats = await fs.stat(imagePath);
      if (stats.size < 10000) { // Less than 10KB
        score += 0.15;
        reason += 'Very small file size. ';
      }

      // 3. Basic filename analysis
      const filename = imagePath.toLowerCase();
      const suspiciousKeywords = ['nude', 'sexy', 'adult', 'xxx', 'porn', 'explicit'];
      for (const keyword of suspiciousKeywords) {
        if (filename.includes(keyword)) {
          score += 0.4;
          reason += `Suspicious filename keyword: ${keyword}. `;
          break;
        }
      }

      // 4. Image quality analysis
      try {
        const stats = await sharp(imageBuffer).stats();
        // Very dark or very bright images might be suspicious
        if (stats.channels) {
          const avgBrightness = stats.channels.reduce((sum, channel) => sum + channel.mean, 0) / stats.channels.length;
          if (avgBrightness < 50 || avgBrightness > 200) {
            score += 0.1;
            reason += 'Unusual brightness levels. ';
          }
        }
      } catch (error) {
        console.warn('Could not analyze image statistics:', error);
      }

      // Determine action based on score
      let action: 'approved' | 'flagged' | 'removed';
      if (score >= this.NSFW_THRESHOLD) {
        action = 'removed';
      } else if (score >= this.FLAG_THRESHOLD) {
        action = 'flagged';
      } else {
        action = 'approved';
      }

      const result: ModerationResult = {
        isNSFW: score >= this.FLAG_THRESHOLD,
        score,
        reason: reason.trim() || 'Automated analysis completed',
        action
      };

      // Log the moderation result
      await this.logModerationResult(imageId, result);

      // Update image moderation status
      await this.updateImageModerationStatus(imageId, result);

      return result;

    } catch (error) {
      console.error('Error during image moderation:', error);
      
      // Default to flagged for review on error
      const result: ModerationResult = {
        isNSFW: true,
        score: 0.6,
        reason: 'Error during automated analysis - flagged for manual review',
        action: 'flagged'
      };

      await this.logModerationResult(imageId, result);
      await this.updateImageModerationStatus(imageId, result);

      return result;
    }
  }

  private static async logModerationResult(imageId: number, result: ModerationResult): Promise<void> {
    try {
      await db.insert(moderationLogs).values({
        imageId,
        moderationType: 'nsfw',
        score: result.score.toString(),
        action: result.action,
        moderatedBy: 'system'
      });
    } catch (error) {
      console.error('Error logging moderation result:', error);
    }
  }

  private static async updateImageModerationStatus(imageId: number, result: ModerationResult): Promise<void> {
    try {
      await db.update(listingImages)
        .set({
          moderationStatus: result.action,
          moderationScore: result.score.toString(),
          moderationReason: result.reason,
          moderatedAt: new Date(),
          moderatedBy: 'system'
        })
        .where(eq(listingImages.id, imageId));
    } catch (error) {
      console.error('Error updating image moderation status:', error);
    }
  }

  // Batch moderate multiple images
  static async moderateImages(imagePaths: { path: string; imageId: number }[]): Promise<ModerationResult[]> {
    const results: ModerationResult[] = [];
    
    for (const { path, imageId } of imagePaths) {
      const result = await this.moderateImage(path, imageId);
      results.push(result);
      
      // Add small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Watermark approved images
  static async addWatermark(imagePath: string, outputPath: string): Promise<void> {
    try {
      // Create a simple text watermark
      const watermarkSvg = `
        <svg width="200" height="50">
          <text x="10" y="30" font-family="Arial" font-size="14" fill="rgba(255,255,255,0.7)" stroke="rgba(0,0,0,0.3)" stroke-width="1">
            EthioMarket.com
          </text>
        </svg>
      `;

      const watermarkBuffer = Buffer.from(watermarkSvg);

      // Add watermark to bottom right corner
      await sharp(imagePath)
        .composite([
          {
            input: watermarkBuffer,
            gravity: 'southeast',
            blend: 'over'
          }
        ])
        .jpeg({ quality: 85 })
        .toFile(outputPath);

    } catch (error) {
      console.error('Error adding watermark:', error);
      // If watermarking fails, just copy the original
      await fs.copyFile(imagePath, outputPath);
    }
  }

  // Get moderation statistics
  static async getModerationStats(days: number = 30): Promise<{
    total: number;
    approved: number;
    flagged: number;
    removed: number;
    averageScore: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // This would need actual SQL aggregation - simplified for now
      const logs = await db.select().from(moderationLogs);
      
      const recentLogs = logs.filter(log => 
        new Date(log.moderatedAt) >= cutoffDate
      );

      const stats = recentLogs.reduce((acc, log) => {
        acc.total++;
        if (log.action === 'approved') acc.approved++;
        else if (log.action === 'flagged') acc.flagged++;
        else if (log.action === 'removed') acc.removed++;
        acc.totalScore += parseFloat(log.score || '0');
        return acc;
      }, {
        total: 0,
        approved: 0,
        flagged: 0,
        removed: 0,
        totalScore: 0
      });

      return {
        ...stats,
        averageScore: stats.total > 0 ? stats.totalScore / stats.total : 0
      };

    } catch (error) {
      console.error('Error getting moderation stats:', error);
      return {
        total: 0,
        approved: 0,
        flagged: 0,
        removed: 0,
        averageScore: 0
      };
    }
  }
}