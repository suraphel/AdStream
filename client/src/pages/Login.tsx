import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BackendStatus {
  available: boolean;
  authEndpoint: string | null;
  message: string;
}

export default function Login() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  // Check backend availability
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Try multiple endpoints to detect backend
        const endpoints = [
          '/api/auth/status',
          '/api/auth/user', 
          '/api/environment'
        ];

        let backendFound = false;
        let authEndpoint = null;

        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint);
            if (response.status !== 404) {
              backendFound = true;
              // Check if there's a specific auth endpoint
              if (endpoint.includes('auth')) {
                authEndpoint = endpoint;
              }
              break;
            }
          } catch (e) {
            // Continue checking other endpoints
          }
        }

        if (backendFound) {
          // Try to find OAuth or external auth endpoint
          try {
            const authResponse = await fetch('/api/auth/providers');
            if (authResponse.ok) {
              const providers = await authResponse.json();
              if (providers.oauth || providers.external) {
                authEndpoint = '/api/login'; // External auth available
              }
            }
          } catch (e) {
            // Fallback to form-based login
          }
        }

        setBackendStatus({
          available: backendFound,
          authEndpoint,
          message: backendFound 
            ? 'Backend authentication available' 
            : 'Backend unavailable - showing demo mode'
        });
      } catch (error) {
        setBackendStatus({
          available: false,
          authEndpoint: null,
          message: 'Backend connection failed - demo mode active'
        });
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  const handleBackendLogin = () => {
    if (backendStatus?.authEndpoint) {
      // Redirect to backend auth
      window.location.href = backendStatus.authEndpoint;
    } else {
      // Try OAuth or external provider
      window.location.href = '/api/login';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    if (backendStatus?.available) {
      // Try backend login
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          navigate('/');
        } else {
          const error = await response.text();
          setError(error || 'Login failed');
        }
      } catch (error) {
        setError('Login request failed');
      }
    } else {
      // Demo mode - simulate login
      setTimeout(() => {
        setError('Demo mode: Login functionality requires backend connection');
        setFormLoading(false);
      }, 1000);
      return;
    }
    
    setFormLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking authentication status...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign in to EthioMarket
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your account to manage listings and favorites
            </p>
          </div>

          {/* Backend Status Alert */}
          <Alert className={backendStatus?.available ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            {backendStatus?.available ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription className={backendStatus?.available ? 'text-green-800' : 'text-yellow-800'}>
              {backendStatus?.message}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {backendStatus?.available ? 'Login' : 'Demo Mode'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backendStatus?.available && backendStatus.authEndpoint === '/api/login' ? (
                // External/OAuth Login
                <div className="space-y-4">
                  <Button 
                    onClick={handleBackendLogin}
                    className="w-full"
                    size="lg"
                  >
                    Continue with Authentication Provider
                  </Button>
                  <div className="text-center text-sm text-gray-600">
                    You'll be redirected to the authentication provider
                  </div>
                </div>
              ) : (
                // Form-based Login (works for both backend available and demo mode)
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {!backendStatus?.available && (
                    <div className="text-center text-sm text-gray-500 mt-4">
                      Backend connection required for actual authentication
                    </div>
                  )}
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Button variant="link" className="p-0 h-auto font-medium" onClick={() => navigate('/register')}>
                    Sign up here
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}