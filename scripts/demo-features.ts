#!/usr/bin/env tsx

import { featureToggleService } from '../server/services/FeatureToggleService';
import { config } from '../server/config';
import { Logger } from '../server/logging/Logger';

// Demo script to showcase feature toggle functionality
async function demonstrateFeatureToggles(): Promise<void> {
  console.log('🎛️  EthioMarket Feature Toggle Demonstration');
  console.log('==========================================\n');

  // Environment information
  console.log('📊 Environment Information:');
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Default Language: ${config.localization.defaultLanguage}`);
  console.log(`Supported Languages: ${config.localization.supportedLanguages.join(', ')}`);
  console.log(`RTL Support: ${config.localization.enableRtlSupport ? 'Enabled' : 'Disabled'}\n`);

  // Test different user contexts
  const testContexts = [
    {
      name: 'Anonymous User',
      context: {
        environment: config.nodeEnv,
      },
    },
    {
      name: 'Regular User (English)',
      context: {
        userId: 'user-123',
        userRole: 'user',
        language: 'en' as const,
        environment: config.nodeEnv,
      },
    },
    {
      name: 'Regular User (Amharic)',
      context: {
        userId: 'user-456',
        userRole: 'user',
        language: 'am' as const,
        environment: config.nodeEnv,
      },
    },
    {
      name: 'Admin User',
      context: {
        userId: 'admin-001',
        userRole: 'admin',
        language: 'en' as const,
        environment: config.nodeEnv,
      },
    },
  ];

  for (const { name, context } of testContexts) {
    console.log(`👤 ${name}:`);
    console.log('-'.repeat(name.length + 4));

    const features = featureToggleService.getAllFeatures(context);
    const featureConfig = featureToggleService.getFeatureConfig(context);

    // Display enabled features
    const enabledFeatures = Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature);

    if (enabledFeatures.length > 0) {
      console.log('✅ Enabled Features:');
      enabledFeatures.forEach(feature => {
        console.log(`   • ${feature}`);
      });
    } else {
      console.log('❌ No features enabled');
    }

    // Display disabled features
    const disabledFeatures = Object.entries(features)
      .filter(([_, enabled]) => !enabled)
      .map(([feature]) => feature);

    if (disabledFeatures.length > 0) {
      console.log('🚫 Disabled Features:');
      disabledFeatures.forEach(feature => {
        console.log(`   • ${feature}`);
      });
    }

    // Display specific feature configurations
    console.log('⚙️  Feature Configurations:');
    
    if (features.payments && featureConfig.config.payments) {
      console.log(`   💳 Payments: ${featureConfig.config.payments.provider} (${featureConfig.config.payments.currency})`);
    }
    
    if (features.imageUpload && featureConfig.config.imageUpload) {
      console.log(`   📸 Image Upload: Max ${featureConfig.config.imageUpload.maxSize}MB, ${featureConfig.config.imageUpload.maxCount} files`);
    }
    
    if (features.chat && featureConfig.config.chat) {
      console.log(`   💬 Chat: Max ${featureConfig.config.chat.maxMessageLength} chars, Moderation: ${featureConfig.config.chat.moderation ? 'On' : 'Off'}`);
    }
    
    if (features.mapSearch && featureConfig.config.maps) {
      console.log(`   🗺️  Maps: ${featureConfig.config.maps.provider} (API Key: ${featureConfig.config.maps.hasApiKey ? 'Yes' : 'No'})`);
    }

    // Localization settings
    const localization = featureConfig.config.localization;
    console.log(`   🌐 Language: ${localization.defaultLanguage} (RTL: ${localization.rtlSupport ? 'On' : 'Off'})`);
    
    console.log('');
  }

  // Feature analytics
  console.log('📈 Feature Analytics:');
  console.log('===================');
  const analytics = featureToggleService.getFeatureAnalytics();
  console.log(`Total Features: ${analytics.totalFeatures}`);
  console.log(`Enabled: ${analytics.enabledFeatures}`);
  console.log(`Disabled: ${analytics.disabledFeatures}`);
  console.log(`Conditional: ${analytics.conditionalFeatures}`);
  console.log(`Environment Specific: ${analytics.environmentSpecific}`);
  console.log(`Role Restricted: ${analytics.roleRestricted}\n`);

  // Test feature dependencies
  console.log('🔗 Feature Dependencies Test:');
  console.log('=============================');
  
  // Test a feature that doesn't exist in dependencies
  const testContext = {
    userId: 'test-user',
    userRole: 'user',
    environment: config.nodeEnv,
  };
  
  console.log('Testing favorites feature (depends on user_authentication):');
  const favoritesEnabled = featureToggleService.isEnabled('favorites', testContext);
  console.log(`Result: ${favoritesEnabled ? 'Enabled' : 'Disabled'}`);
  
  console.log('\nTesting payments feature (depends on user_authentication):');
  const paymentsEnabled = featureToggleService.isEnabled('payments', testContext);
  console.log(`Result: ${paymentsEnabled ? 'Enabled' : 'Disabled'}`);

  // Demonstrate custom rules
  console.log('\n🎯 Custom Rules Demonstration:');
  console.log('==============================');
  
  // Add a custom rule for analytics feature
  featureToggleService.addRule('analytics', {
    feature: 'analytics',
    enabled: true,
    condition: (context) => {
      // Only enable analytics for admin users in production
      return context.userRole === 'admin' && context.environment === 'production';
    },
    metadata: {
      description: 'Analytics only for admins in production',
      createdAt: new Date().toISOString(),
    },
  });
  
  const analyticsInDev = featureToggleService.isEnabled('analytics', {
    userRole: 'admin',
    environment: 'development',
  });
  
  const analyticsInProd = featureToggleService.isEnabled('analytics', {
    userRole: 'admin',
    environment: 'production',
  });
  
  console.log(`Analytics for admin in development: ${analyticsInDev ? 'Enabled' : 'Disabled'}`);
  console.log(`Analytics for admin in production: ${analyticsInProd ? 'Enabled' : 'Disabled'}`);

  // Language-specific features
  console.log('\n🌍 Language-Specific Features:');
  console.log('==============================');
  
  const englishContext = { language: 'en', environment: config.nodeEnv };
  const amharicContext = { language: 'am', environment: config.nodeEnv };
  
  console.log(`Multilanguage support (EN): ${featureToggleService.isEnabled('multilanguage', englishContext)}`);
  console.log(`Multilanguage support (AM): ${featureToggleService.isEnabled('multilanguage', amharicContext)}`);
  console.log(`RTL support (EN): ${featureToggleService.isEnabled('rtlSupport', englishContext)}`);
  console.log(`RTL support (AM): ${featureToggleService.isEnabled('rtlSupport', amharicContext)}`);

  console.log('\n✅ Feature toggle demonstration completed!');
  console.log('\nTo test in your application:');
  console.log('1. Check feature status: GET /api/features/config');
  console.log('2. View analytics (admin): GET /api/features/analytics');
  console.log('3. Environment info: GET /api/environment');
}

// Configuration validation
function validateConfiguration(): boolean {
  console.log('🔍 Configuration Validation:');
  console.log('============================');
  
  const errors: string[] = [];
  
  // Check required environment variables
  const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });
  
  // Check feature configuration consistency
  if (config.features.payments && !process.env.TELEBIRR_API_URL) {
    errors.push('Payments enabled but TELEBIRR_API_URL not configured');
  }
  
  if (config.features.mapSearch && config.maps.provider === 'google' && !config.maps.googleMapsApiKey) {
    errors.push('Google Maps provider selected but API key not configured');
  }
  
  // Check localization configuration
  if (config.localization.supportedLanguages.length === 0) {
    errors.push('No supported languages configured');
  }
  
  if (!config.localization.supportedLanguages.includes(config.localization.defaultLanguage)) {
    errors.push('Default language not in supported languages list');
  }
  
  if (errors.length > 0) {
    console.log('❌ Configuration validation failed:');
    errors.forEach(error => console.log(`   • ${error}`));
    return false;
  }
  
  console.log('✅ Configuration validation passed');
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Features enabled: ${Object.values(config.features).filter(Boolean).length}/${Object.keys(config.features).length}`);
  console.log(`Languages: ${config.localization.supportedLanguages.join(', ')}`);
  
  return true;
}

// Main execution
async function main(): Promise<void> {
  try {
    Logger.info('Starting feature toggle demonstration');
    
    // Validate configuration first
    if (!validateConfiguration()) {
      throw new Error('Configuration validation failed');
    }
    
    console.log('');
    
    // Demonstrate feature toggles
    await demonstrateFeatureToggles();
    
    Logger.info('Feature toggle demonstration completed');
    
  } catch (error) {
    Logger.error('Feature toggle demonstration failed', { error });
    console.error('❌ Demonstration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { demonstrateFeatureToggles, validateConfiguration };