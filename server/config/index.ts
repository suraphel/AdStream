import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string(),
  
  // Feature toggles
  FEATURE_PAYMENTS: z.string().transform(val => val === 'true').default('false'),
  FEATURE_CHAT: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MAP_SEARCH: z.string().transform(val => val === 'true').default('false'),
  FEATURE_IMAGE_UPLOAD: z.string().transform(val => val === 'true').default('true'),
  FEATURE_FAVORITES: z.string().transform(val => val === 'true').default('true'),
  FEATURE_ADMIN_PANEL: z.string().transform(val => val === 'true').default('true'),
  FEATURE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  FEATURE_NOTIFICATIONS: z.string().transform(val => val === 'true').default('false'),
  
  // Localization settings
  DEFAULT_LANGUAGE: z.enum(['en', 'am']).default('en'),
  SUPPORTED_LANGUAGES: z.string().default('en,am'),
  ENABLE_RTL_SUPPORT: z.string().transform(val => val === 'true').default('true'),
  LANGUAGE_DETECTION: z.enum(['browser', 'header', 'query', 'manual']).default('browser'),
  
  // Image storage configuration
  IMAGE_STORAGE_TYPE: z.enum(['local', 'azure', 'aws']).default('local'),
  IMAGE_MAX_SIZE_MB: z.string().transform(Number).default('10'),
  IMAGE_MAX_COUNT: z.string().transform(Number).default('10'),
  
  // Payment configuration (Telebirr)
  TELEBIRR_API_URL: z.string().optional(),
  TELEBIRR_APP_ID: z.string().optional(),
  TELEBIRR_APP_KEY: z.string().optional(),
  TELEBIRR_PUBLIC_KEY: z.string().optional(),
  TELEBIRR_NOTIFY_URL: z.string().optional(),
  
  // Map and location services
  MAP_PROVIDER: z.enum(['google', 'mapbox', 'osm']).default('osm'),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  MAPBOX_ACCESS_TOKEN: z.string().optional(),
  
  // Chat configuration
  CHAT_MAX_MESSAGE_LENGTH: z.string().transform(Number).default('1000'),
  CHAT_FILE_UPLOAD: z.string().transform(val => val === 'true').default('false'),
  CHAT_MODERATION: z.string().transform(val => val === 'true').default('true'),
  
  // Monitoring and logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  METRICS_ENABLED: z.string().transform(val => val === 'true').default('true'),
  ERROR_TRACKING_ENABLED: z.string().transform(val => val === 'true').default('true'),
  
  // Rate limiting
  RATE_LIMIT_ENABLED: z.string().transform(val => val === 'true').default('true'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Email configuration
  EMAIL_PROVIDER: z.enum(['smtp', 'sendgrid', 'ses']).default('smtp'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Security settings
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  JWT_EXPIRY: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('*'),
  
  // Business rules
  LISTING_EXPIRY_DAYS: z.string().transform(Number).default('30'),
  MAX_LISTINGS_PER_USER: z.string().transform(Number).default('50'),
  FEATURED_LISTING_DURATION_DAYS: z.string().transform(Number).default('7'),
  MIN_SEARCH_QUERY_LENGTH: z.string().transform(Number).default('2'),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Feature flags object
export const features = {
  payments: env.FEATURE_PAYMENTS,
  chat: env.FEATURE_CHAT,
  mapSearch: env.FEATURE_MAP_SEARCH,
  imageUpload: env.FEATURE_IMAGE_UPLOAD,
  favorites: env.FEATURE_FAVORITES,
  adminPanel: env.FEATURE_ADMIN_PANEL,
  analytics: env.FEATURE_ANALYTICS,
  notifications: env.FEATURE_NOTIFICATIONS,
} as const;

// Localization configuration
export const localization = {
  defaultLanguage: env.DEFAULT_LANGUAGE,
  supportedLanguages: env.SUPPORTED_LANGUAGES.split(',') as ('en' | 'am')[],
  enableRtlSupport: env.ENABLE_RTL_SUPPORT,
  languageDetection: env.LANGUAGE_DETECTION,
} as const;

// Application configuration
export const config = {
  // Environment
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isStaging: env.NODE_ENV === 'staging',
  
  // Database
  database: {
    url: env.DATABASE_URL,
  },
  
  // Authentication
  auth: {
    sessionSecret: env.SESSION_SECRET,
    bcryptRounds: env.BCRYPT_ROUNDS,
    jwtExpiry: env.JWT_EXPIRY,
  },
  
  // Image storage
  imageStorage: {
    type: env.IMAGE_STORAGE_TYPE,
    maxSizeMB: env.IMAGE_MAX_SIZE_MB,
    maxCount: env.IMAGE_MAX_COUNT,
  },
  
  // Payment configuration
  payments: {
    telebirr: {
      apiUrl: env.TELEBIRR_API_URL,
      appId: env.TELEBIRR_APP_ID,
      appKey: env.TELEBIRR_APP_KEY,
      publicKey: env.TELEBIRR_PUBLIC_KEY,
      notifyUrl: env.TELEBIRR_NOTIFY_URL,
    },
  },
  
  // Map services
  maps: {
    provider: env.MAP_PROVIDER,
    googleMapsApiKey: env.GOOGLE_MAPS_API_KEY,
    mapboxAccessToken: env.MAPBOX_ACCESS_TOKEN,
  },
  
  // Chat configuration
  chat: {
    maxMessageLength: env.CHAT_MAX_MESSAGE_LENGTH,
    fileUpload: env.CHAT_FILE_UPLOAD,
    moderation: env.CHAT_MODERATION,
  },
  
  // Monitoring
  monitoring: {
    logLevel: env.LOG_LEVEL,
    metricsEnabled: env.METRICS_ENABLED,
    errorTrackingEnabled: env.ERROR_TRACKING_ENABLED,
  },
  
  // Rate limiting
  rateLimit: {
    enabled: env.RATE_LIMIT_ENABLED,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  // Email
  email: {
    provider: env.EMAIL_PROVIDER,
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  },
  
  // Security
  security: {
    corsOrigins: env.CORS_ORIGINS.split(','),
  },
  
  // Business rules
  business: {
    listingExpiryDays: env.LISTING_EXPIRY_DAYS,
    maxListingsPerUser: env.MAX_LISTINGS_PER_USER,
    featuredListingDurationDays: env.FEATURED_LISTING_DURATION_DAYS,
    minSearchQueryLength: env.MIN_SEARCH_QUERY_LENGTH,
  },
  
  // Features and localization
  features,
  localization,
} as const;

export type Config = typeof config;
export type Features = typeof features;
export type Localization = typeof localization;

// Helper functions
export const isFeatureEnabled = (feature: keyof Features): boolean => {
  return features[feature];
};

export const getSupportedLanguages = (): string[] => {
  return localization.supportedLanguages;
};

export const isLanguageSupported = (language: string): boolean => {
  return localization.supportedLanguages.includes(language as 'en' | 'am');
};

export const getDefaultLanguage = (): string => {
  return localization.defaultLanguage;
};

export default config;