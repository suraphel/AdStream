import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PasswordStrengthInput } from '@/components/ui/password-strength';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Mail, Phone, MapPin, Lock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const userRegistrationSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  contactPerson: z.string().min(2, 'Contact person name must be at least 2 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;

const TenderUserRegister: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<UserRegistrationFormData>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: UserRegistrationFormData) => {
      const { confirmPassword, ...registrationData } = data;
      return apiRequest('/api/tender-auth/register-user', 'POST', registrationData);
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in to continue.",
      });
      navigate('/tender/login-user');
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserRegistrationFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Company</h1>
          <p className="text-gray-600">
            Create an account to purchase and download tender documents
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Company Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Name */}
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Company Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Person */}
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Contact Person
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact person name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="company@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+251912345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Company Address
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your complete company address"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Fields */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password
                        </FormLabel>
                        <FormControl>
                          <PasswordStrengthInput
                            password={field.value}
                            onPasswordChange={field.onChange}
                            placeholder="Create a strong password"
                            showSuggestions={true}
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
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>Creating Account...</>
                    ) : (
                      <>Create Account</>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/tender/login-user')}
                        className="text-primary hover:underline"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Registration Benefits */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Registration Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <span>Access to complete tender documents</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <span>Email notifications and confirmations</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <span>Download history and re-access</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TenderUserRegister;