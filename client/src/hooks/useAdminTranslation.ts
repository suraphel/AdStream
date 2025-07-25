import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations } from "@/lib/i18n";

export function useAdminTranslation() {
  const { language } = useLanguage();
  
  const getTranslation = (key: string): string => {
    const keys = key.split('.');
    let current: any = adminTranslations[language];
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English if key not found in current language
        current = adminTranslations.en;
        for (const fallbackKey of keys) {
          if (current && typeof current === 'object' && fallbackKey in current) {
            current = current[fallbackKey];
          } else {
            return key; // Return the key itself if not found
          }
        }
        break;
      }
    }
    
    return typeof current === 'string' ? current : key;
  };
  
  return {
    t: getTranslation,
    language
  };
}

export default useAdminTranslation;