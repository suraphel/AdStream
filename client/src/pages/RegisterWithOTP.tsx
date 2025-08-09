import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import OTPVerification from '@/components/OTPVerification';
import PasswordStrengthInput from '@/components/PasswordStrengthInput';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';

// Registration form schema
const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^(\+251|0)?[79]\d{8}$/, 'Please enter a valid Ethiopian phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
  region: z.string().min(1, 'Please select your region'),
  city: z.string().min(2, 'City must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

// Ethiopian regions
const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'SNNP',
  'Somali',
  'Tigray'
];

interface RegisterWithOTPProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function RegisterWithOTP({ onSuccess, onCancel, className }: RegisterWithOTPProps) {
  const [step, setStep] = useState<'registration' | 'otp' | 'success'>('registration');
  const [registrationData, setRegistrationData] = useState<RegistrationFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      region: '',
      city: '',
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    
    try {
      // Normalize phone number for Ethiopian format
      let normalizedPhone = data.phoneNumber.replace(/\D/g, '');
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '251' + normalizedPhone.substring(1);
      } else if (!normalizedPhone.startsWith('251')) {
        normalizedPhone = '251' + normalizedPhone;
      }
      normalizedPhone = '+' + normalizedPhone;

      // Store registration data for after OTP verification
      const registrationPayload = {
        ...data,
        phoneNumber: normalizedPhone,
        isVerified: false, // Will be set to true after OTP verification
      };
      
      setRegistrationData(registrationPayload);
      setStep('otp');
      
      toast({
        title: 'Registration Started',
        description: 'Please verify your phone number to complete registration',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start registration process',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async () => {
    if (!registrationData) return;

    setIsLoading(true);
    
    try {
      // Complete user registration
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...registrationData,
          isVerified: true,
          phoneVerified: true,
          verificationType: 'registration'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.success || response.user) {
        setStep('success');
        toast({
          title: 'Registration Successful',
          description: 'Your account has been created successfully!',
        });
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = '/api/login';
          }
        }, 2000);
      } else {
        throw new Error(response.message || 'Registration failed');
      }

    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to complete registration',
        variant: 'destructive',
      });
      
      // Go back to registration form
      setStep('registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (step === 'otp') {
      setStep('registration');
      setRegistrationData(null);
    } else if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  // Normalize phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '+251' + cleaned.substring(1);
    } else if (cleaned.startsWith('251')) {
      return '+' + cleaned;
    } else {
      return '+251' + cleaned;
    }
  };

  if (step === 'otp' && registrationData) {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <OTPVerification
          phoneNumber={registrationData.phoneNumber}
          verificationType="registration"
          onVerificationSuccess={handleOTPVerificationSuccess}
          onCancel={() => setStep('registration')}
          userId={registrationData.email} // Use email as temporary ID
          metadata={{
            registrationData: {
              firstName: registrationData.firstName,
              lastName: registrationData.lastName,
              email: registrationData.email
            }
          }}
        />
      </div>
    );
  }

  if (step === 'success') {
    return (
      <Card className={`max-w-md mx-auto ${className}`}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-xl text-green-800">Registration Successful!</CardTitle>
          <p className="text-sm text-gray-600">
            Your account has been created and verified successfully.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            You will be redirected to login shortly...
          </p>
          <Button 
            onClick={() => onSuccess ? onSuccess() : window.location.href = '/api/login'}
            className="w-full"
          >
            Continue to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl text-center">Create Account</CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Join EthioMarket to buy and sell items in Ethiopia
        </p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="09XXXXXXXX or +251XXXXXXXXX" 
                      {...field}
                      onChange={(e) => {
                        // Auto-format phone number
                        let value = e.target.value;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {field.value && (
                    <p className="text-xs text-gray-500">
                      Formatted: {formatPhoneNumber(field.value)}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordStrengthInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Create a strong password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ETHIOPIAN_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Login Link */}
        <div className="text-center mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/api/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign In
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}