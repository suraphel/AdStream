import { features, config, isFeatureEnabled } from '../config';
import { Logger } from '../logging/Logger';

export interface FeatureToggle {
  name: string;
  enabled: boolean;
  description: string;
  dependencies?: string[];
  environments?: string[];
  rolloutPercentage?: number;
  userGroups?: string[];
}

export interface FeatureToggleRule {
  feature: string;
  enabled: boolean;
  condition?: (context: FeatureContext) => boolean;
  metadata?: Record<string, any>;
}

export interface FeatureContext {
  userId?: string;
  userRole?: string;
  language?: 'en' | 'am';
  environment?: string;
  userAgent?: string;
  ipAddress?: string;
  experimentGroup?: string;
}

class FeatureToggleService {
  private static instance: FeatureToggleService;
  private toggles: Map<string, FeatureToggle> = new Map();
  private rules: Map<string, FeatureToggleRule[]> = new Map();

  private constructor() {
    this.initializeDefaultToggles();
  }

  public static getInstance(): FeatureToggleService {
    if (!FeatureToggleService.instance) {
      FeatureToggleService.instance = new FeatureToggleService();
    }
    return FeatureToggleService.instance;
  }

  private initializeDefaultToggles(): void {
    const defaultToggles: FeatureToggle[] = [
      {
        name: 'payments',
        enabled: features.payments,
        description: 'Enable Telebirr payment integration',
        dependencies: ['user_authentication'],
        environments: ['staging', 'production'],
      },
      {
        name: 'chat',
        enabled: features.chat,
        description: 'Enable real-time chat between users',
        dependencies: ['user_authentication'],
        rolloutPercentage: 100,
      },
      {
        name: 'mapSearch',
        enabled: features.mapSearch,
        description: 'Enable map-based location search',
        dependencies: ['geolocation'],
      },
      {
        name: 'imageUpload',
        enabled: features.imageUpload,
        description: 'Enable image upload for listings',
        rolloutPercentage: 100,
      },
      {
        name: 'favorites',
        enabled: features.favorites,
        description: 'Enable favorites/bookmarks functionality',
        dependencies: ['user_authentication'],
      },
      {
        name: 'adminPanel',
        enabled: features.adminPanel,
        description: 'Enable admin dashboard and management tools',
        dependencies: ['user_authentication'],
        userGroups: ['admin', 'moderator'],
      },
      {
        name: 'analytics',
        enabled: features.analytics,
        description: 'Enable user analytics and tracking',
        environments: ['staging', 'production'],
      },
      {
        name: 'notifications',
        enabled: features.notifications,
        description: 'Enable push notifications and email alerts',
        dependencies: ['user_authentication'],
      },
      {
        name: 'multilanguage',
        enabled: config.localization.supportedLanguages.length > 1,
        description: 'Enable multiple language support',
        rolloutPercentage: 100,
      },
      {
        name: 'rtlSupport',
        enabled: config.localization.enableRtlSupport,
        description: 'Enable right-to-left language support for Amharic',
        dependencies: ['multilanguage'],
      },
    ];

    defaultToggles.forEach(toggle => {
      this.toggles.set(toggle.name, toggle);
    });

    Logger.info('Feature toggles initialized', {
      toggleCount: this.toggles.size,
      enabledFeatures: Array.from(this.toggles.values())
        .filter(t => t.enabled)
        .map(t => t.name),
    });
  }

  // Check if a feature is enabled for a given context
  public isEnabled(featureName: string, context: FeatureContext = {}): boolean {
    const toggle = this.toggles.get(featureName);
    if (!toggle) {
      Logger.warn('Unknown feature toggle requested', { featureName });
      return false;
    }

    // Check base enabled state
    if (!toggle.enabled) {
      return false;
    }

    // Check environment restrictions
    if (toggle.environments && toggle.environments.length > 0) {
      const currentEnv = context.environment || config.nodeEnv;
      if (!toggle.environments.includes(currentEnv)) {
        return false;
      }
    }

    // Check user group restrictions
    if (toggle.userGroups && toggle.userGroups.length > 0) {
      if (!context.userRole || !toggle.userGroups.includes(context.userRole)) {
        return false;
      }
    }

    // Check rollout percentage
    if (toggle.rolloutPercentage !== undefined && toggle.rolloutPercentage < 100) {
      const hash = this.hashString(featureName + (context.userId || 'anonymous'));
      const bucket = hash % 100;
      if (bucket >= toggle.rolloutPercentage) {
        return false;
      }
    }

    // Check custom rules
    const rules = this.rules.get(featureName) || [];
    for (const rule of rules) {
      if (rule.condition && !rule.condition(context)) {
        return rule.enabled;
      }
    }

    // Check dependencies
    if (toggle.dependencies) {
      for (const dependency of toggle.dependencies) {
        if (!this.isEnabled(dependency, context)) {
          Logger.debug('Feature disabled due to dependency', {
            feature: featureName,
            dependency,
          });
          return false;
        }
      }
    }

    return true;
  }

  // Get all available features with their status
  public getAllFeatures(context: FeatureContext = {}): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    
    for (const [name] of this.toggles) {
      result[name] = this.isEnabled(name, context);
    }

    return result;
  }

  // Get feature configuration for frontend
  public getFeatureConfig(context: FeatureContext = {}): any {
    const enabledFeatures = this.getAllFeatures(context);
    
    return {
      features: enabledFeatures,
      config: {
        // Payment configuration
        payments: enabledFeatures.payments ? {
          provider: 'telebirr',
          currency: 'ETB',
        } : null,
        
        // Map configuration
        maps: enabledFeatures.mapSearch ? {
          provider: config.maps.provider,
          hasApiKey: !!(config.maps.googleMapsApiKey || config.maps.mapboxAccessToken),
        } : null,
        
        // Image upload configuration
        imageUpload: enabledFeatures.imageUpload ? {
          maxSize: config.imageStorage.maxSizeMB,
          maxCount: config.imageStorage.maxCount,
          supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        } : null,
        
        // Chat configuration
        chat: enabledFeatures.chat ? {
          maxMessageLength: config.chat.maxMessageLength,
          fileUpload: config.chat.fileUpload,
          moderation: config.chat.moderation,
        } : null,
        
        // Localization configuration
        localization: {
          defaultLanguage: config.localization.defaultLanguage,
          supportedLanguages: config.localization.supportedLanguages,
          rtlSupport: enabledFeatures.rtlSupport,
          languageDetection: config.localization.languageDetection,
        },
        
        // Business rules
        business: {
          maxListingsPerUser: config.business.maxListingsPerUser,
          listingExpiryDays: config.business.listingExpiryDays,
          minSearchQueryLength: config.business.minSearchQueryLength,
        },
      },
    };
  }

  // Add custom rule for a feature
  public addRule(featureName: string, rule: FeatureToggleRule): void {
    if (!this.rules.has(featureName)) {
      this.rules.set(featureName, []);
    }
    this.rules.get(featureName)!.push(rule);
    
    Logger.info('Feature rule added', { featureName, rule: rule.feature });
  }

  // Update feature toggle
  public updateToggle(featureName: string, updates: Partial<FeatureToggle>): void {
    const existing = this.toggles.get(featureName);
    if (!existing) {
      Logger.warn('Attempted to update unknown feature toggle', { featureName });
      return;
    }

    const updated = { ...existing, ...updates };
    this.toggles.set(featureName, updated);
    
    Logger.info('Feature toggle updated', { featureName, updates });
  }

  // Get feature analytics
  public getFeatureAnalytics(): any {
    const analytics = {
      totalFeatures: this.toggles.size,
      enabledFeatures: 0,
      disabledFeatures: 0,
      conditionalFeatures: 0,
      environmentSpecific: 0,
      roleRestricted: 0,
    };

    for (const toggle of this.toggles.values()) {
      if (toggle.enabled) {
        analytics.enabledFeatures++;
      } else {
        analytics.disabledFeatures++;
      }

      if (toggle.rolloutPercentage !== undefined && toggle.rolloutPercentage < 100) {
        analytics.conditionalFeatures++;
      }

      if (toggle.environments && toggle.environments.length > 0) {
        analytics.environmentSpecific++;
      }

      if (toggle.userGroups && toggle.userGroups.length > 0) {
        analytics.roleRestricted++;
      }
    }

    return analytics;
  }

  // Simple hash function for rollout percentage
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const featureToggleService = FeatureToggleService.getInstance();

// Helper functions for common checks
export const isPaymentsEnabled = (context?: FeatureContext): boolean => 
  featureToggleService.isEnabled('payments', context);

export const isChatEnabled = (context?: FeatureContext): boolean => 
  featureToggleService.isEnabled('chat', context);

export const isMapSearchEnabled = (context?: FeatureContext): boolean => 
  featureToggleService.isEnabled('mapSearch', context);

export const isImageUploadEnabled = (context?: FeatureContext): boolean => 
  featureToggleService.isEnabled('imageUpload', context);

export const isFavoritesEnabled = (context?: FeatureContext): boolean => 
  featureToggleService.isEnabled('favorites', context);

export const isAdminPanelEnabled = (context?: FeatureContext): boolean => 
  featureToggleService.isEnabled('adminPanel', context);

export const isAnalyticsEnabled = (context?: FeatureContext): boolean => 
  featureToggleService.isEnabled('analytics', context);

export const isNotificationsEnabled = (context?: FeatureContext): boolean => 
  featureToggleService.isEnabled('notifications', context);

export const isMultilanguageEnabled = (context?: FeatureContext): boolean => 
  featureToggleService.isEnabled('multilanguage', context);

export const isRtlSupportEnabled = (context?: FeatureContext): boolean => 
  featureToggleService.isEnabled('rtlSupport', context);