import { config } from '../config';
import { db } from '../db';
import { otpVerifications, otpRateLimits } from '../../shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

interface OTPGenerationResult {
  success: boolean;
  message: string;
  otpId?: string;
  expiresAt?: Date;
  waitTime?: number;
}

interface OTPVerificationResult {
  success: boolean;
  message: string;
  remainingAttempts?: number;
  isExpired?: boolean;
  isUsed?: boolean;
}

class OTPService {
  private twilio: any;

  constructor() {
    // Initialize Twilio client if credentials are available
    if (
      config.sms.twilio.accountSid !== 'your_twilio_account_sid_here' &&
      config.sms.twilio.authToken !== 'your_twilio_auth_token_here'
    ) {
      try {
        const twilio = require('twilio');
        this.twilio = twilio(config.sms.twilio.accountSid, config.sms.twilio.authToken);
      } catch (error) {
        console.error('Failed to initialize Twilio:', error);
      }
    }
  }

  private generateOTPCode(): string {
    // Generate 4-digit code
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Ethiopian phone numbers
    if (cleaned.startsWith('0')) {
      // Remove leading 0 and add country code
      cleaned = '251' + cleaned.substring(1);
    } else if (!cleaned.startsWith('251')) {
      // Add country code if missing
      cleaned = '251' + cleaned;
    }
    
    return '+' + cleaned;
  }

  private validateEthiopianPhone(phoneNumber: string): boolean {
    const normalized = this.normalizePhoneNumber(phoneNumber);
    // Ethiopian mobile numbers: +251[79]XXXXXXXX (9 digits after country code)
    return /^\+251[79]\d{8}$/.test(normalized);
  }

  private encryptOTP(code: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.createHash('sha256').update(config.auth.sessionSecret).digest();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(code, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private decryptOTP(encryptedCode: string): string {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.createHash('sha256').update(config.auth.sessionSecret).digest();
      
      const parts = encryptedCode.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      
      const decipher = crypto.createDecipher(algorithm, key);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt OTP:', error);
      return '';
    }
  }

  private async checkRateLimit(phoneNumber: string): Promise<{ allowed: boolean; waitTime?: number }> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const windowStart = new Date(Date.now() - config.otp.rateLimitWindowMinutes * 60 * 1000);

    try {
      // Check recent rate limits
      const [recentLimit] = await db
        .select()
        .from(otpRateLimits)
        .where(
          and(
            eq(otpRateLimits.phoneNumber, normalizedPhone),
            gt(otpRateLimits.lastRequestAt, windowStart)
          )
        )
        .orderBy(otpRateLimits.lastRequestAt)
        .limit(1);

      if (recentLimit && recentLimit.requestCount >= config.otp.maxRequestsPerHour) {
        const waitTime = Math.ceil(
          (recentLimit.lastRequestAt.getTime() + config.otp.rateLimitWindowMinutes * 60 * 1000 - Date.now()) / 1000
        );
        return { allowed: false, waitTime };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: true }; // Allow on error to prevent service disruption
    }
  }

  private async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.twilio) {
      console.log('Twilio not configured. SMS message for', phoneNumber, ':', message);
      return true; // Return true in development for testing
    }

    try {
      await this.twilio.messages.create({
        body: message,
        from: config.sms.twilio.phoneNumber,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  async generateAndSendOTP(
    phoneNumber: string,
    verificationType: 'registration' | 'password_reset' | 'phone_verification',
    userId?: string,
    metadata?: any
  ): Promise<OTPGenerationResult> {
    try {
      // Validate phone number
      if (!this.validateEthiopianPhone(phoneNumber)) {
        return {
          success: false,
          message: 'Invalid phone number format. Please use Ethiopian format (+251XXXXXXXXX)',
        };
      }

      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

      // Check rate limiting
      const rateCheck = await this.checkRateLimit(normalizedPhone);
      if (!rateCheck.allowed) {
        return {
          success: false,
          message: 'Too many OTP requests. Please wait before requesting again.',
          waitTime: rateCheck.waitTime,
        };
      }

      // Generate OTP code
      const otpCode = this.generateOTPCode();
      const encryptedCode = this.encryptOTP(otpCode);
      const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

      // Save to database
      const [otpRecord] = await db
        .insert(otpVerifications)
        .values({
          phoneNumber: normalizedPhone,
          otpCode: otpCode, // Store plain OTP for now
          hashedOtp: encryptedCode,
          verificationType,
          userId,
          metadata: metadata ? JSON.stringify(metadata) : null,
          expiresAt,
          attempts: 0,
          isUsed: false,
        })
        .returning();

      // Record rate limit entry
      await db.insert(otpRateLimits).values({
        phoneNumber: normalizedPhone,
        requestCount: 1,
        firstRequestAt: new Date(),
        lastRequestAt: new Date(),
      });

      // Send SMS
      const message = `Your EthioMarket verification code is: ${otpCode}. Valid for ${config.otp.expiryMinutes} minutes. Do not share this code.`;
      const smsSent = await this.sendSMS(normalizedPhone, message);

      if (!smsSent) {
        return {
          success: false,
          message: 'Failed to send SMS. Please try again.',
        };
      }

      return {
        success: true,
        message: 'OTP sent successfully',
        otpId: otpRecord.id,
        expiresAt,
      };

    } catch (error) {
      console.error('Failed to generate OTP:', error);
      return {
        success: false,
        message: 'Failed to generate OTP. Please try again.',
      };
    }
  }

  async verifyOTP(
    phoneNumber: string,
    otpCode: string,
    verificationType: 'registration' | 'password_reset' | 'phone_verification'
  ): Promise<OTPVerificationResult> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      const now = new Date();

      // Find the most recent unused OTP for this phone number and type
      const [otpRecord] = await db
        .select()
        .from(otpVerifications)
        .where(
          and(
            eq(otpVerifications.phoneNumber, normalizedPhone),
            eq(otpVerifications.verificationType, verificationType),
            eq(otpVerifications.isUsed, false)
          )
        )
        .orderBy(otpVerifications.createdAt)
        .limit(1);

      if (!otpRecord) {
        return {
          success: false,
          message: 'No valid OTP found. Please request a new one.',
        };
      }

      // Check if expired
      if (now > otpRecord.expiresAt) {
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
          isExpired: true,
        };
      }

      // Check attempts
      if (otpRecord.attempts >= config.otp.maxAttempts) {
        return {
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new OTP.',
          remainingAttempts: 0,
        };
      }

      // Decrypt and verify code
      const decryptedCode = this.decryptOTP(otpRecord.hashedOtp);
      if (decryptedCode !== otpCode) {
        // Increment attempts
        await db
          .update(otpVerifications)
          .set({ attempts: otpRecord.attempts + 1 })
          .where(eq(otpVerifications.id, otpRecord.id));

        const remainingAttempts = config.otp.maxAttempts - (otpRecord.attempts + 1);
        return {
          success: false,
          message: `Invalid OTP code. ${remainingAttempts} attempts remaining.`,
          remainingAttempts,
        };
      }

      // Mark as used
      await db
        .update(otpVerifications)
        .set({ 
          isUsed: true,
          verifiedAt: now,
        })
        .where(eq(otpVerifications.id, otpRecord.id));

      return {
        success: true,
        message: 'OTP verified successfully',
      };

    } catch (error) {
      console.error('Failed to verify OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
      };
    }
  }
}

export const otpService = new OTPService();
export default otpService;