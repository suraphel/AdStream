#!/usr/bin/env tsx

import { config, localization } from '../server/config';
import { Logger } from '../server/logging/Logger';
import fs from 'fs/promises';
import path from 'path';

// Localization configuration interface
interface LocalizationSettings {
  defaultLanguage: string;
  supportedLanguages: string[];
  rtlLanguages: string[];
  dateFormats: Record<string, string>;
  numberFormats: Record<string, any>;
  currencyFormats: Record<string, any>;
  translations: Record<string, Record<string, string>>;
}

// Default localization configuration
const defaultLocalizationConfig: LocalizationSettings = {
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'am'],
  rtlLanguages: ['am'],
  dateFormats: {
    en: 'MM/dd/yyyy',
    am: 'dd/MM/yyyy',
  },
  numberFormats: {
    en: {
      decimal: '.',
      thousands: ',',
      currency: '$',
    },
    am: {
      decimal: '.',
      thousands: ',',
      currency: 'ብር',
    },
  },
  currencyFormats: {
    en: {
      symbol: 'ETB',
      position: 'before',
      precision: 2,
    },
    am: {
      symbol: 'ብር',
      position: 'after',
      precision: 2,
    },
  },
  translations: {
    en: {
      // Common UI translations
      'app.name': 'EthioMarket',
      'app.tagline': 'Your trusted marketplace in Ethiopia',
      'nav.home': 'Home',
      'nav.categories': 'Categories',
      'nav.post': 'Post Ad',
      'nav.profile': 'Profile',
      'nav.favorites': 'Favorites',
      'nav.admin': 'Admin',
      'nav.login': 'Login',
      'nav.logout': 'Logout',
      
      // Search and filters
      'search.placeholder': 'Search for items...',
      'search.button': 'Search',
      'search.results': 'Search Results',
      'search.no_results': 'No items found',
      'filter.location': 'Location',
      'filter.category': 'Category',
      'filter.price_range': 'Price Range',
      'filter.condition': 'Condition',
      'filter.apply': 'Apply Filters',
      'filter.clear': 'Clear Filters',
      
      // Listing details
      'listing.price': 'Price',
      'listing.location': 'Location',
      'listing.contact': 'Contact Seller',
      'listing.description': 'Description',
      'listing.condition': 'Condition',
      'listing.posted': 'Posted',
      'listing.views': 'Views',
      'listing.favorite': 'Add to Favorites',
      'listing.unfavorite': 'Remove from Favorites',
      'listing.share': 'Share',
      'listing.report': 'Report',
      
      // Categories
      'category.electronics': 'Electronics',
      'category.vehicles': 'Vehicles',
      'category.real_estate': 'Real Estate',
      'category.fashion': 'Fashion & Clothing',
      'category.home_garden': 'Home & Garden',
      'category.services': 'Services',
      'category.smartphones': 'Smartphones',
      'category.laptops': 'Laptops & Computers',
      'category.cars': 'Cars',
      'category.motorcycles': 'Motorcycles',
      
      // Forms
      'form.title': 'Title',
      'form.description': 'Description',
      'form.price': 'Price',
      'form.location': 'Location',
      'form.category': 'Category',
      'form.images': 'Images',
      'form.contact_phone': 'Phone Number',
      'form.contact_email': 'Email',
      'form.save': 'Save',
      'form.cancel': 'Cancel',
      'form.submit': 'Submit',
      'form.required': 'Required',
      
      // Messages
      'message.success': 'Success!',
      'message.error': 'Error occurred',
      'message.loading': 'Loading...',
      'message.no_data': 'No data available',
      'message.unauthorized': 'Please log in to continue',
      'message.forbidden': 'Access denied',
      'message.not_found': 'Page not found',
      
      // Features
      'feature.payments': 'Payments',
      'feature.chat': 'Chat',
      'feature.map_search': 'Map Search',
      'feature.image_upload': 'Image Upload',
      'feature.favorites': 'Favorites',
      'feature.admin_panel': 'Admin Panel',
      'feature.analytics': 'Analytics',
      'feature.notifications': 'Notifications',
    },
    am: {
      // Common UI translations
      'app.name': 'ኢትዮማርኬት',
      'app.tagline': 'በኢትዮጵያ የሚታመን የንግድ መድረክ',
      'nav.home': 'መነሻ',
      'nav.categories': 'ምድቦች',
      'nav.post': 'ማስታወቂያ ለጥፍ',
      'nav.profile': 'መገለጫ',
      'nav.favorites': 'ተወዳጆች',
      'nav.admin': 'አስተዳዳሪ',
      'nav.login': 'ግባ',
      'nav.logout': 'ውጣ',
      
      // Search and filters
      'search.placeholder': 'ነገሮችን ፈልግ...',
      'search.button': 'ፈልግ',
      'search.results': 'የፍለጋ ውጤቶች',
      'search.no_results': 'ምንም ነገር አልተገኘም',
      'filter.location': 'ቦታ',
      'filter.category': 'ምድብ',
      'filter.price_range': 'የዋጋ ክልል',
      'filter.condition': 'ሁኔታ',
      'filter.apply': 'ማጣሪያዎችን ተግብር',
      'filter.clear': 'ማጣሪያዎችን አጽዳ',
      
      // Listing details
      'listing.price': 'ዋጋ',
      'listing.location': 'ቦታ',
      'listing.contact': 'ሻጩን አግኝ',
      'listing.description': 'መግለጫ',
      'listing.condition': 'ሁኔታ',
      'listing.posted': 'የተለጠፈ',
      'listing.views': 'እይታዎች',
      'listing.favorite': 'ወደ ተወዳጆች ጨምር',
      'listing.unfavorite': 'ከተወዳጆች አስወግድ',
      'listing.share': 'አጋራ',
      'listing.report': 'ሪፖርት አድርግ',
      
      // Categories
      'category.electronics': 'ኤሌክትሮኒክስ',
      'category.vehicles': 'ተሽከርካሪዎች',
      'category.real_estate': 'ሪል እስቴት',
      'category.fashion': 'ፋሽን እና አልባሳት',
      'category.home_garden': 'ቤት እና አትክልት',
      'category.services': 'አገልግሎቶች',
      'category.smartphones': 'ስማርት ስልኮች',
      'category.laptops': 'ላፕቶፖች እና ኮምፒዩተሮች',
      'category.cars': 'መኪናዎች',
      'category.motorcycles': 'ሞተርሳይክሎች',
      
      // Forms
      'form.title': 'ርዕስ',
      'form.description': 'መግለጫ',
      'form.price': 'ዋጋ',
      'form.location': 'ቦታ',
      'form.category': 'ምድብ',
      'form.images': 'ምስሎች',
      'form.contact_phone': 'ስልክ ቁጥር',
      'form.contact_email': 'ኢሜይል',
      'form.save': 'አስቀምጥ',
      'form.cancel': 'ሰርዝ',
      'form.submit': 'ላክ',
      'form.required': 'አስፈላጊ',
      
      // Messages
      'message.success': 'በተሳካ ሁኔታ!',
      'message.error': 'ስህተት ተከስቷል',
      'message.loading': 'በመጫን ላይ...',
      'message.no_data': 'መረጃ አልተገኘም',
      'message.unauthorized': 'እባክዎ ለመቀጠል ይግቡ',
      'message.forbidden': 'መዳረሻ ተከልክሏል',
      'message.not_found': 'ገጹ አልተገኘም',
      
      // Features
      'feature.payments': 'ክፍያዎች',
      'feature.chat': 'ውይይት',
      'feature.map_search': 'የካርታ ፍለጋ',
      'feature.image_upload': 'ምስል መጫን',
      'feature.favorites': 'ተወዳጆች',
      'feature.admin_panel': 'የአስተዳደር ፓኔል',
      'feature.analytics': 'ትንተናዎች',
      'feature.notifications': 'ማሳወቂያዎች',
    },
  },
};

// Create localization files for environment
async function createLocalizationFiles(environment: string = 'development'): Promise<void> {
  try {
    Logger.info('Creating localization configuration files', { environment });
    
    const localizationDir = path.join(process.cwd(), 'client', 'src', 'locales');
    await fs.mkdir(localizationDir, { recursive: true });
    
    // Create language-specific files
    for (const language of defaultLocalizationConfig.supportedLanguages) {
      const languageFile = path.join(localizationDir, `${language}.json`);
      const translations = defaultLocalizationConfig.translations[language] || {};
      
      await fs.writeFile(languageFile, JSON.stringify(translations, null, 2));
      Logger.info(`Created translation file: ${language}.json`);
    }
    
    // Create main localization configuration
    const configFile = path.join(localizationDir, 'config.json');
    const configData = {
      defaultLanguage: localization.defaultLanguage,
      supportedLanguages: localization.supportedLanguages,
      rtlLanguages: defaultLocalizationConfig.rtlLanguages.filter(lang => 
        localization.supportedLanguages.includes(lang as 'en' | 'am')
      ),
      dateFormats: defaultLocalizationConfig.dateFormats,
      numberFormats: defaultLocalizationConfig.numberFormats,
      currencyFormats: defaultLocalizationConfig.currencyFormats,
      rtlSupport: localization.enableRtlSupport,
      languageDetection: localization.languageDetection,
    };
    
    await fs.writeFile(configFile, JSON.stringify(configData, null, 2));
    Logger.info('Created localization configuration file');
    
    // Create environment-specific overrides
    const envConfigFile = path.join(localizationDir, `config.${environment}.json`);
    const envOverrides = {
      environment,
      enabledLanguages: localization.supportedLanguages,
      debugMode: environment === 'development',
      fallbackLanguage: localization.defaultLanguage,
    };
    
    await fs.writeFile(envConfigFile, JSON.stringify(envOverrides, null, 2));
    Logger.info(`Created environment-specific config: config.${environment}.json`);
    
    Logger.info('Localization configuration setup completed', {
      supportedLanguages: localization.supportedLanguages,
      defaultLanguage: localization.defaultLanguage,
      rtlSupport: localization.enableRtlSupport,
    });
    
  } catch (error) {
    Logger.error('Failed to create localization files', { error });
    throw error;
  }
}

// Validate localization configuration
function validateLocalizationConfig(): boolean {
  try {
    Logger.info('Validating localization configuration');
    
    const errors: string[] = [];
    
    // Check supported languages
    if (!localization.supportedLanguages || localization.supportedLanguages.length === 0) {
      errors.push('No supported languages configured');
    }
    
    // Check default language is in supported languages
    if (!localization.supportedLanguages.includes(localization.defaultLanguage)) {
      errors.push(`Default language '${localization.defaultLanguage}' not in supported languages`);
    }
    
    // Check translations exist for supported languages
    for (const language of localization.supportedLanguages) {
      if (!defaultLocalizationConfig.translations[language]) {
        errors.push(`Missing translations for language: ${language}`);
      }
    }
    
    // Check RTL configuration
    if (localization.enableRtlSupport && !defaultLocalizationConfig.rtlLanguages.some(lang => 
      localization.supportedLanguages.includes(lang as 'en' | 'am')
    )) {
      Logger.warn('RTL support enabled but no RTL languages in supported languages');
    }
    
    if (errors.length > 0) {
      Logger.error('Localization configuration validation failed', { errors });
      return false;
    }
    
    Logger.info('Localization configuration validation passed');
    return true;
    
  } catch (error) {
    Logger.error('Localization validation error', { error });
    return false;
  }
}

// Generate localization report
function generateLocalizationReport(): any {
  const report = {
    configuration: {
      defaultLanguage: localization.defaultLanguage,
      supportedLanguages: localization.supportedLanguages,
      rtlSupport: localization.enableRtlSupport,
      languageDetection: localization.languageDetection,
    },
    statistics: {
      totalLanguages: localization.supportedLanguages.length,
      totalTranslations: Object.keys(defaultLocalizationConfig.translations.en || {}).length,
      rtlLanguages: defaultLocalizationConfig.rtlLanguages.filter(lang => 
        localization.supportedLanguages.includes(lang as 'en' | 'am')
      ).length,
    },
    coverage: {} as Record<string, number>,
    features: {
      dateFormatting: !!defaultLocalizationConfig.dateFormats,
      numberFormatting: !!defaultLocalizationConfig.numberFormats,
      currencyFormatting: !!defaultLocalizationConfig.currencyFormats,
      rtlLayout: localization.enableRtlSupport,
    },
  };
  
  // Calculate translation coverage
  const baseTranslations = defaultLocalizationConfig.translations.en || {};
  const baseCount = Object.keys(baseTranslations).length;
  
  for (const language of localization.supportedLanguages) {
    const langTranslations = defaultLocalizationConfig.translations[language] || {};
    const langCount = Object.keys(langTranslations).length;
    report.coverage[language] = baseCount > 0 ? Math.round((langCount / baseCount) * 100) : 0;
  }
  
  return report;
}

// Main execution
async function main(): Promise<void> {
  const environment = process.env.NODE_ENV || 'development';
  
  try {
    Logger.info('Starting localization configuration setup', { environment });
    
    // Validate configuration
    if (!validateLocalizationConfig()) {
      throw new Error('Localization configuration validation failed');
    }
    
    // Create localization files
    await createLocalizationFiles(environment);
    
    // Generate and display report
    const report = generateLocalizationReport();
    Logger.info('Localization setup report', report);
    
    console.log('\n📊 Localization Configuration Report');
    console.log('=====================================');
    console.log(`Environment: ${environment}`);
    console.log(`Default Language: ${report.configuration.defaultLanguage}`);
    console.log(`Supported Languages: ${report.configuration.supportedLanguages.join(', ')}`);
    console.log(`RTL Support: ${report.configuration.rtlSupport ? 'Enabled' : 'Disabled'}`);
    console.log(`Language Detection: ${report.configuration.languageDetection}`);
    console.log('\nTranslation Coverage:');
    
    for (const [language, coverage] of Object.entries(report.coverage)) {
      const status = coverage >= 90 ? '✅' : coverage >= 70 ? '⚠️' : '❌';
      console.log(`  ${status} ${language.toUpperCase()}: ${coverage}%`);
    }
    
    console.log('\nFeatures:');
    console.log(`  📅 Date Formatting: ${report.features.dateFormatting ? 'Enabled' : 'Disabled'}`);
    console.log(`  🔢 Number Formatting: ${report.features.numberFormatting ? 'Enabled' : 'Disabled'}`);
    console.log(`  💰 Currency Formatting: ${report.features.currencyFormatting ? 'Enabled' : 'Disabled'}`);
    console.log(`  🔄 RTL Layout: ${report.features.rtlLayout ? 'Enabled' : 'Disabled'}`);
    console.log('\n✅ Localization configuration completed successfully!');
    
  } catch (error) {
    Logger.error('Localization setup failed', { error });
    console.error('❌ Localization setup failed:', error);
    process.exit(1);
  }
}

// Export functions
export {
  createLocalizationFiles,
  validateLocalizationConfig,
  generateLocalizationReport,
  defaultLocalizationConfig,
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}