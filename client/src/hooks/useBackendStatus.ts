import { useState, useEffect } from 'react';

interface BackendStatus {
  available: boolean;
  authEndpoint: string | null;
  message: string;
}

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Try multiple endpoints to detect backend
        const endpoints = [
          '/api/auth/status',
          '/api/auth/user', 
          '/api/environment',
          '/api/categories'
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

        setStatus({
          available: backendFound,
          authEndpoint,
          message: backendFound 
            ? 'Backend authentication available' 
            : 'Backend unavailable - demo mode active'
        });
      } catch (error) {
        setStatus({
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

  return { status, loading };
}