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
import { Loader2, Building, ArrowLeft, Shield } from 'lucide-react';

// Company registration schema
const tenderCompanySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyType: z.enum(['private_limited', 'plc', 'partnership', 'sole_proprietorship', 'government', 'ngo']),
  vatNumber: z.string().min(10, 'VAT number must be at least 10 characters'),
  tinNumber: z.string().min(10, 'TIN number must be at least 10 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^(\+251|0)?[79]\d{8}$/, 'Please enter a valid Ethiopian phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  region: z.string().min(1, 'Please select your region'),
  businessLicense: z.string().min(10, 'Business license number is required'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  contactTitle: z.string().min(2, 'Contact person title is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User registration schema  
const tenderUserSchema = z.object({
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
  profession: z.string().min(2, 'Profession is required'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  region: z.string().min(1, 'Please select your region'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type TenderCompanyFormData = z.infer<typeof tenderCompanySchema>;
type TenderUserFormData = z.infer<typeof tenderUserSchema>;

// Ethiopian regions
const ETHIOPIAN_REGIONS = [
  'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
  'Gambela', 'Harari', 'Oromia', 'Sidama', 'SNNP', 'Somali', 'Tigray'
];

const COMPANY_TYPES = [
  { value: 'private_limited', label: 'Private Limited Company' },
  { value: 'plc', label: 'Public Limited Company (PLC)' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'government', label: 'Government Entity' },
  { value: 'ngo', label: 'NGO/Non-Profit' },
];

interface TenderOTPRegisterProps {
  registrationType: 'company' | 'user';
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function TenderOTPRegister({ 
  registrationType, 
  onSuccess, 
  onCancel, 
  className 
}: TenderOTPRegisterProps) {
  const [step, setStep] = useState<'registration' | 'otp' | 'success'>('registration');
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isCompany = registrationType === 'company';
  const schema = isCompany ? tenderCompanySchema : tenderUserSchema;
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isCompany ? {
      companyName: '',
      companyType: 'private_limited',
      vatNumber: '',
      tinNumber: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      address: '',
      city: '',
      region: '',
      businessLicense: '',
      contactPerson: '',
      contactTitle: '',
    } : {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      profession: '',
      city: '',
      region: '',
    },
  });

  const onSubmit = async (data: any) => {
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
        registrationType,
        isVerified: false,
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
      const endpoint = isCompany ? '/api/tenders/company/register' : '/api/tenders/user/register';
      
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          ...registrationData,
          isVerified: true,
          phoneVerified: true,
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.success || response.company || response.user) {
        setStep('success');
        toast({
          title: 'Registration Successful',
          description: `Your ${isCompany ? 'company' : 'account'} has been registered successfully!`,
        });
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = '/tender';
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

  // Format phone number for display
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
          userId={registrationData.email}
          metadata={{
            registrationData: {
              type: registrationType,
              email: registrationData.email,
              name: isCompany ? registrationData.companyName : `${registrationData.firstName} ${registrationData.lastName}`
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
            {isCompany ? <Building className="w-6 h-6 text-green-600" /> : <Shield className="w-6 h-6 text-green-600" />}
          </div>
          <CardTitle className="text-xl text-green-800">Registration Successful!</CardTitle>
          <p className="text-sm text-gray-600">
            Your {isCompany ? 'company' : 'account'} has been registered and verified successfully.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            You will be redirected to the tender platform shortly...
          </p>
          <Button 
            onClick={() => onSuccess ? onSuccess() : window.location.href = '/tender'}
            className="w-full"
          >
            Continue to Tender Platform
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl text-center">
          {isCompany ? 'Company Registration' : 'User Registration'}
        </CardTitle>
        <p className="text-sm text-gray-600 text-center">
          {isCompany 
            ? 'Register your company to participate in tender bidding'
            : 'Create an account to access and download tender documents'
          }
        </p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isCompany ? (
              // Company Registration Fields
              <>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COMPANY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="businessLicense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business License *</FormLabel>
                        <FormControl>
                          <Input placeholder="License number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VAT Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="VAT registration number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tinNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TIN Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Tax identification number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full company address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
                        <FormControl>
                          <Input placeholder="Primary contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. CEO, Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            ) : (
              // User Registration Fields
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
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
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profession *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your profession or job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Common Fields */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="09XXXXXXXX or +251XXXXXXXXX" 
                      {...field}
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region *</FormLabel>
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
                    <FormLabel>City *</FormLabel>
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
                    {isCompany ? <Building className="w-4 h-4 mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                    Register {isCompany ? 'Company' : 'Account'}
                  </>
                )}
              </Button>

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
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}