import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Loader2, Shield, MessageCircle } from 'lucide-react';

interface OTPVerificationProps {
  phoneNumber: string;
  verificationType: 'registration' | 'password_reset' | 'phone_verification';
  onVerificationSuccess: () => void;
  onCancel: () => void;
  userId?: string;
  metadata?: any;
  className?: string;
}

export default function OTPVerification({
  phoneNumber,
  verificationType,
  onVerificationSuccess,
  onCancel,
  userId,
  metadata,
  className,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [otpSent, setOtpSent] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Send initial OTP
    sendOTP();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const sendOTP = async () => {
    setIsResending(true);
    try {
      const response = await apiRequest('/api/otp/send', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber,
          verificationType,
          userId,
          metadata,
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.success) {
        setOtpSent(true);
        setTimeLeft(600); // Reset timer
        toast({
          title: 'OTP Sent',
          description: `Verification code sent to ${formatPhoneNumber(phoneNumber)}`,
        });
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 4) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the complete 4-digit code',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/api/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber,
          otpCode,
          verificationType,
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.success) {
        toast({
          title: 'Verification Successful',
          description: 'Your phone number has been verified',
        });
        onVerificationSuccess();
      } else {
        setAttempts(prev => prev + 1);
        
        if (response.remainingAttempts !== undefined) {
          toast({
            title: 'Invalid OTP',
            description: `${response.message} ${response.remainingAttempts} attempts remaining.`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Verification Failed',
            description: response.message || 'Invalid OTP code',
            variant: 'destructive',
          });
        }
        
        // Clear OTP inputs on error
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Verification failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    // Format +251912345678 as +251 91 234 5678
    if (phone.startsWith('+251')) {
      const number = phone.substring(4);
      return `+251 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
    }
    return phone;
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Verify Your Phone Number</CardTitle>
        <p className="text-sm text-gray-600">
          We've sent a 4-digit verification code to
          <br />
          <span className="font-semibold">{formatPhoneNumber(phoneNumber)}</span>
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block text-center">
            Enter verification code
          </label>
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        {timeLeft > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Code expires in <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
            </p>
          </div>
        )}

        {/* Attempts remaining */}
        {attempts > 0 && (
          <div className="text-center">
            <p className="text-sm text-orange-600">
              {maxAttempts - attempts} attempts remaining
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={verifyOTP}
            disabled={isLoading || otp.some(digit => !digit) || attempts >= maxAttempts}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Verify Code
              </>
            )}
          </Button>

          {/* Resend Button */}
          <Button
            variant="outline"
            onClick={sendOTP}
            disabled={isResending || timeLeft > 540} // Allow resend after 1 minute
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : timeLeft > 540 ? (
              `Resend in ${formatTime(timeLeft - 540)}`
            ) : (
              'Resend Code'
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code? Check your SMS messages or contact support if the issue persists.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}