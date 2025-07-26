import { Router } from 'express';
import { otpService } from '../services/OTPService';

const router = Router();

// Send OTP endpoint
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, verificationType, userId, metadata } = req.body;

    // Validate required fields
    if (!phoneNumber || !verificationType) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and verification type are required',
        messageAm: 'ስልክ ቁጥር እና የማረጋገጫ አይነት ያስፈልጋል'
      });
    }

    // Validate verification type
    const validTypes = ['registration', 'password_reset', 'phone_verification'];
    if (!validTypes.includes(verificationType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification type',
        messageAm: 'ልክ ያልሆነ የማረጋገጫ አይነት'
      });
    }

    const result = await otpService.generateAndSendOTP(
      phoneNumber,
      verificationType,
      userId,
      metadata
    );

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        messageAm: 'የማረጋገጫ ኮድ በተሳካ ሁኔታ ተልኳል',
        otpId: result.otpId,
        expiresAt: result.expiresAt,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        messageAm: 'የማረጋገጫ ኮድ መላክ አልተሳካም',
        waitTime: result.waitTime,
      });
    }

  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      messageAm: 'የማረጋገጫ ኮድ መላክ አልተሳካም'
    });
  }
});

// Verify OTP endpoint
router.post('/verify', async (req, res) => {
  try {
    const { phoneNumber, otpCode, verificationType } = req.body;

    // Validate required fields
    if (!phoneNumber || !otpCode || !verificationType) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, OTP code, and verification type are required',
        messageAm: 'ስልክ ቁጥር፣ የማረጋገጫ ኮድ እና የማረጋገጫ አይነት ያስፈልጋል'
      });
    }

    // Validate OTP format (4 digits)
    if (!/^\d{4}$/.test(otpCode)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be a 4-digit number',
        messageAm: 'የማረጋገጫ ኮድ 4 አሃዝ መሆን አለበት'
      });
    }

    const result = await otpService.verifyOTP(phoneNumber, otpCode, verificationType);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        messageAm: 'የማረጋገጫ ኮድ በተሳካ ሁኔታ ተረጋግጧል',
      });
    } else {
      const statusCode = result.isExpired ? 400 : 400;
      res.status(statusCode).json({
        success: false,
        message: result.message,
        messageAm: 'የማረጋገጫ ኮድ ማረጋገጥ አልተሳካም',
        remainingAttempts: result.remainingAttempts,
        isExpired: result.isExpired,
        isUsed: result.isUsed,
      });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      messageAm: 'የማረጋገጫ ኮድ ማረጋገጥ አልተሳካም'
    });
  }
});

// Check OTP status endpoint (optional)
router.get('/status/:phoneNumber/:verificationType', async (req, res) => {
  try {
    const { phoneNumber, verificationType } = req.params;

    // This is a simple status check - you might want to implement this in OTPService
    res.json({
      success: true,
      message: 'Status check not implemented yet',
      canRequest: true, // This would be based on rate limiting
    });

  } catch (error) {
    console.error('OTP status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check OTP status',
    });
  }
});

export default router;