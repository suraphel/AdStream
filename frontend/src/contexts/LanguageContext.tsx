import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'header.home': 'Home',
    'header.categories': 'Categories',
    'header.myAds': 'My Ads',
    'header.messages': 'Messages',
    'header.postAd': 'Post Ad',
    'header.login': 'Login',
    'header.logout': 'Logout',
    
    // Search
    'search.title': 'Find what you\'re looking for',
    'search.subtitle': 'Browse thousands of listings across Ethiopia',
    'search.placeholder': 'What are you looking for?',
    'search.allCategories': 'All Categories',
    'search.allEthiopia': 'All Ethiopia',
    'search.advancedFilters': 'Advanced Filters',
    'search.searchButton': 'Search',
    
    // Categories
    'categories.title': 'Browse Categories',
    'categories.viewAll': 'View All',
    'categories.electronics': 'Electronics',
    'categories.vehicles': 'Vehicles',
    'categories.realEstate': 'Real Estate',
    'categories.jobs': 'Jobs',
    'categories.fashion': 'Fashion',
    'categories.services': 'Services',
    'categories.ads': 'ads',
    
    // Listings
    'listings.featured': 'Featured Ads',
    'listings.featuredSubtitle': 'Premium listings from verified sellers',
    'listings.recent': 'Recent Listings',
    'listings.recentSubtitle': 'Fresh additions to the marketplace',
    'listings.viewAllFeatured': 'View All Featured',
    'listings.loadMore': 'Load More Listings',
    'listings.featuredBadge': 'Featured',
    'listings.hoursAgo': 'hours ago',
    'listings.dayAgo': 'day ago',
    'listings.daysAgo': 'days ago',
    
    // Stats
    'stats.title': 'Ethiopia\'s Leading Marketplace',
    'stats.subtitle': 'Connecting buyers and sellers across the nation',
    'stats.activeListings': 'Active Listings',
    'stats.happyUsers': 'Happy Users',
    'stats.successRate': 'Success Rate',
    'stats.support': 'Support',
    
    // Cities
    'cities.addisAbaba': 'Addis Ababa',
    'cities.direDawa': 'Dire Dawa',
    'cities.bahirDar': 'Bahir Dar',
    'cities.gondar': 'Gondar',
    'cities.hawassa': 'Hawassa',
    'cities.mekelle': 'Mekelle',
    'cities.jimma': 'Jimma',
    'cities.adama': 'Adama',
    'cities.dessie': 'Dessie',
    'cities.debreMarkos': 'Debre Markos',
    
    // Forms
    'form.title': 'Title',
    'form.description': 'Description',
    'form.price': 'Price',
    'form.category': 'Category',
    'form.location': 'Location',
    'form.condition': 'Condition',
    'form.condition.new': 'New',
    'form.condition.used': 'Used',
    'form.condition.refurbished': 'Refurbished',
    'form.images': 'Images',
    'form.submit': 'Submit',
    'form.cancel': 'Cancel',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.noResults': 'No results found',
    'common.tryAgain': 'Try again',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.contact': 'Contact',
    'common.phone': 'Phone',
    'common.email': 'Email',
  },
  am: {
    // Header
    'header.home': 'መነሻ',
    'header.categories': 'ምድቦች',
    'header.myAds': 'የእኔ ማስታወቂያዎች',
    'header.messages': 'መልዕክቶች',
    'header.postAd': 'ማስታወቂያ ለጥፍ',
    'header.login': 'ግባ',
    'header.logout': 'ውጣ',
    
    // Search
    'search.title': 'የሚፈልጉትን ያግኙ',
    'search.subtitle': 'በኢትዮጵያ ውስጥ በሺዎች የሚቆጠሩ ዝርዝሮችን ይመልከቱ',
    'search.placeholder': 'ምን እየፈለጉ ነው?',
    'search.allCategories': 'ሁሉም ምድቦች',
    'search.allEthiopia': 'መላው ኢትዮጵያ',
    'search.advancedFilters': 'የላቀ ማጣሪያዎች',
    'search.searchButton': 'ፈልግ',
    
    // Categories
    'categories.title': 'ምድቦችን አስሱ',
    'categories.viewAll': 'ሁሉንም አይ',
    'categories.electronics': 'ኤሌክትሮኒክስ',
    'categories.vehicles': 'ተሽከርካሪዎች',
    'categories.realEstate': 'የሪል እስቴት',
    'categories.jobs': 'ስራዎች',
    'categories.fashion': 'ፋሽን',
    'categories.services': 'አገልግሎቶች',
    'categories.ads': 'ማስታወቂያዎች',
    
    // Listings
    'listings.featured': 'ተጨማሪ ማስታወቂያዎች',
    'listings.featuredSubtitle': 'ከተረጋገጡ ሻጮች የተሻሉ ዝርዝሮች',
    'listings.recent': 'የቅርብ ጊዜ ዝርዝሮች',
    'listings.recentSubtitle': 'ለገበያው አዲስ መጨመሮች',
    'listings.viewAllFeatured': 'ሁሉንም ተጨማሪዎች አይ',
    'listings.loadMore': 'ተጨማሪ ዝርዝሮችን ጫን',
    'listings.featuredBadge': 'ተጨማሪ',
    'listings.hoursAgo': 'ሰዓቶች በፊት',
    'listings.dayAgo': 'ቀን በፊት',
    'listings.daysAgo': 'ቀናት በፊት',
    
    // Stats
    'stats.title': 'የኢትዮጵያ ግንባር ቀደም ገበያ',
    'stats.subtitle': 'በመላው ሀገሪቱ ገዢዎችን እና ሻጮችን ማገናኘት',
    'stats.activeListings': 'ንቁ ዝርዝሮች',
    'stats.happyUsers': 'ደስተኛ ተጠቃሚዎች',
    'stats.successRate': 'የስኬት መጠን',
    'stats.support': 'ድጋፍ',
    
    // Cities
    'cities.addisAbaba': 'አዲስ አበባ',
    'cities.direDawa': 'ድሬዳዋ',
    'cities.bahirDar': 'ባህር ዳር',
    'cities.gondar': 'ጎንደር',
    'cities.hawassa': 'ሀዋሳ',
    'cities.mekelle': 'መቀሌ',
    'cities.jimma': 'ጅማ',
    'cities.adama': 'አዳማ',
    'cities.dessie': 'ደሴ',
    'cities.debreMarkos': 'ደብረ ማርቆስ',
    
    // Forms
    'form.title': 'ርዕስ',
    'form.description': 'መግለጫ',
    'form.price': 'ዋጋ',
    'form.category': 'ምድብ',
    'form.location': 'አካባቢ',
    'form.condition': 'ሁኔታ',
    'form.condition.new': 'አዲስ',
    'form.condition.used': 'ጥቅም ላይ የዋለ',
    'form.condition.refurbished': 'የተጠገነ',
    'form.images': 'ምስሎች',
    'form.submit': 'ላክ',
    'form.cancel': 'ሰርዝ',
    
    // Common
    'common.loading': 'በመጫን ላይ...',
    'common.error': 'ስህተት ተፈጥሯል',
    'common.noResults': 'ምንም ውጤት አልተገኘም',
    'common.tryAgain': 'እንደገና ሞክር',
    'common.save': 'አስቀምጥ',
    'common.delete': 'ሰርዝ',
    'common.edit': 'አርም',
    'common.view': 'አይ',
    'common.contact': 'ያነጋግሩ',
    'common.phone': 'ስልክ',
    'common.email': 'ኢሜይል',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'en' || saved === 'am')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, fallback?: string) => {
    return translations[language][key as keyof typeof translations['en']] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
