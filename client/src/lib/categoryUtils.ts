// Utility functions for category-based access control

// Categories that require authentication for contact details and messaging
const P2P_RESTRICTED_CATEGORIES = [
  'electronics',
  'smartphones', 
  'laptops',
  'vehicles',
  'cars',
  'motorcycles',
  'real-estate',
  'apartments',
  'houses',
  'fashion',
  'mens-clothing',
  'womens-clothing',
  'home-garden',
  'furniture',
  'jobs',
  'services', // Person-to-person services
];

// Categories that are always public (no authentication required)
const PUBLIC_CATEGORIES = [
  'tenders', // Tender documents
  'airline-tickets', // Airline ticket sales
  'external-listings', // External B2B listings
];

/**
 * Determines if a category requires authentication for contact details and messaging
 * @param categorySlug - The category slug to check
 * @returns true if authentication is required, false otherwise
 */
export function requiresAuthForContact(categorySlug: string): boolean {
  // If it's explicitly a public category, no auth required
  if (PUBLIC_CATEGORIES.includes(categorySlug)) {
    return false;
  }
  
  // If it's a known P2P category, auth is required
  if (P2P_RESTRICTED_CATEGORIES.includes(categorySlug)) {
    return true;
  }
  
  // Default: assume P2P marketplace requiring auth (safer approach)
  return true;
}

/**
 * Determines if a category is a tender/B2B category that should be fully public
 * @param categorySlug - The category slug to check
 * @returns true if it's a public B2B category, false otherwise
 */
export function isPublicCategory(categorySlug: string): boolean {
  return PUBLIC_CATEGORIES.includes(categorySlug);
}

/**
 * Gets appropriate message for authentication requirement
 * @param categorySlug - The category slug
 * @param language - Current language ('en' or 'am')
 * @returns Appropriate message for the category
 */
export function getAuthRequiredMessage(categorySlug: string, language: 'en' | 'am' = 'en'): string {
  const messages = {
    en: {
      contact: "Sign in to view seller's contact information and full details",
      chat: "Sign in to message the seller",
      default: "Sign in to contact the seller and view full details"
    },
    am: {
      contact: "የሻጩን የግንኙነት መረጃ እና ሙሉ ዝርዝሮች ለማየት ይግቡ",
      chat: "ለሻጩ መልእክት ለመላክ ይግቡ",
      default: "ሻጩን ለመገናኘት እና ሙሉ ዝርዝሮች ለማየት ይግቡ"
    }
  };
  
  return messages[language].default;
}