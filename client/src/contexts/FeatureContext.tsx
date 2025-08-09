import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
// Removed auth dependency - standalone operation
// Removed API dependency - standalone operation

// Feature configuration interface
export interface FeatureConfig {
  features: {
    payments: boolean;
    chat: boolean;
    mapSearch: boolean;
    imageUpload: boolean;
    favorites: boolean;
    adminPanel: boolean;
    analytics: boolean;
    notifications: boolean;
    multilanguage: boolean;
    rtlSupport: boolean;
  };
  config: {
    payments?: {
      provider: string;
      currency: string;
    } | null;
    maps?: {
      provider: string;
      hasApiKey: boolean;
    } | null;
    imageUpload?: {
      maxSize: number;
      maxCount: number;
      supportedFormats: string[];
    } | null;
    chat?: {
      maxMessageLength: number;
      fileUpload: boolean;
      moderation: boolean;
    } | null;
    localization: {
      defaultLanguage: string;
      supportedLanguages: string[];
      rtlSupport: boolean;
      languageDetection: string;
    };
    business: {
      maxListingsPerUser: number;
      listingExpiryDays: number;
      minSearchQueryLength: number;
    };
  };
}

// Context for feature toggles
interface FeatureContextType {
  features: FeatureConfig['features'];
  config: FeatureConfig['config'];
  isFeatureEnabled: (feature: keyof FeatureConfig['features']) => boolean;
  getFeatureConfig: <T = any>(feature: string) => T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

// Default feature configuration for fallback
const defaultFeatures: FeatureConfig = {
  features: {
    payments: false,
    chat: false,
    mapSearch: false,
    imageUpload: true,
    favorites: true,
    adminPanel: false,
    analytics: false,
    notifications: false,
    multilanguage: true,
    rtlSupport: true,
  },
  config: {
    localization: {
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'am'],
      rtlSupport: true,
      languageDetection: 'browser',
    },
    business: {
      maxListingsPerUser: 20,
      listingExpiryDays: 30,
      minSearchQueryLength: 2,
    },
  },
};

// Feature provider component
export function FeatureProvider({ children }: { children: ReactNode }) {
  // Standalone mode - no auth dependency
  const user = null;
  const isAuthenticated = false;
  const [featureConfig, setFeatureConfig] = useState<FeatureConfig>(defaultFeatures);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Standalone mode - no backend dependency
  const fetchFeatureConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    // Use default features for standalone operation
    setFeatureConfig(defaultFeatures);
    setIsLoading(false);
  };

  // Initialize on mount without backend dependency
  useEffect(() => {
    fetchFeatureConfig();
  }, []);

  // Helper function to check if feature is enabled
  const isFeatureEnabled = (feature: keyof FeatureConfig['features']): boolean => {
    return featureConfig.features[feature] || false;
  };

  // Helper function to get feature-specific configuration
  const getFeatureConfig = <T = any>(feature: string): T | null => {
    return (featureConfig.config as any)[feature] || null;
  };

  const contextValue: FeatureContextType = {
    features: featureConfig.features,
    config: featureConfig.config,
    isFeatureEnabled,
    getFeatureConfig,
    isLoading,
    error,
    refetch: fetchFeatureConfig,
  };

  return (
    <FeatureContext.Provider value={contextValue}>
      {children}
    </FeatureContext.Provider>
  );
}

// Hook to use feature context
export function useFeatures(): FeatureContextType {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
}

// Specific feature hooks for common checks
export function usePayments() {
  const { isFeatureEnabled, getFeatureConfig } = useFeatures();
  return {
    enabled: isFeatureEnabled('payments'),
    config: getFeatureConfig<FeatureConfig['config']['payments']>('payments'),
  };
}

export function useChat() {
  const { isFeatureEnabled, getFeatureConfig } = useFeatures();
  return {
    enabled: isFeatureEnabled('chat'),
    config: getFeatureConfig<FeatureConfig['config']['chat']>('chat'),
  };
}

export function useMapSearch() {
  const { isFeatureEnabled, getFeatureConfig } = useFeatures();
  return {
    enabled: isFeatureEnabled('mapSearch'),
    config: getFeatureConfig<FeatureConfig['config']['maps']>('maps'),
  };
}

export function useImageUpload() {
  const { isFeatureEnabled, getFeatureConfig } = useFeatures();
  return {
    enabled: isFeatureEnabled('imageUpload'),
    config: getFeatureConfig<FeatureConfig['config']['imageUpload']>('imageUpload'),
  };
}

export function useAdminPanel() {
  const { isFeatureEnabled } = useFeatures();
  const { user } = useAuth();
  
  const hasAdminAccess = user && 
    ((user as any).role === 'admin' || (user as any).role === 'moderator');
  
  return {
    enabled: isFeatureEnabled('adminPanel') && hasAdminAccess,
    isAdmin: (user as any)?.role === 'admin',
    isModerator: (user as any)?.role === 'moderator',
  };
}

export function useLocalization() {
  const { config } = useFeatures();
  return {
    ...config.localization,
    isRtlLanguage: (language: string) => language === 'am' && config.localization.rtlSupport,
  };
}

// HOC for feature-gated components
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  requiredFeature: keyof FeatureConfig['features'],
  fallback?: React.ComponentType<P> | React.ReactElement | null
) {
  return function FeatureGatedComponent(props: P) {
    const { isFeatureEnabled } = useFeatures();
    
    if (!isFeatureEnabled(requiredFeature)) {
      if (fallback) {
        if (React.isValidElement(fallback)) {
          return fallback;
        }
        const FallbackComponent = fallback as React.ComponentType<P>;
        return <FallbackComponent {...props} />;
      }
      return null;
    }
    
    return <Component {...props} />;
  };
}

// Component for conditionally rendering based on features
export function FeatureGate({
  feature,
  children,
  fallback,
}: {
  feature: keyof FeatureConfig['features'];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isFeatureEnabled } = useFeatures();
  
  if (isFeatureEnabled(feature)) {
    return <>{children}</>;
  }
  
  return <>{fallback || null}</>;
}

export default FeatureContext;