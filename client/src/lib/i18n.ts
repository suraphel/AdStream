export const formatRelativeTime = (date: string, language: 'en' | 'am') => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  if (diffInSeconds < intervals.hour) {
    const minutes = Math.floor(diffInSeconds / intervals.minute);
    if (language === 'am') {
      return minutes <= 1 ? 'አሁን' : `${minutes} ደቂቃዎች በፊት`;
    }
    return minutes <= 1 ? 'now' : `${minutes} minutes ago`;
  }

  if (diffInSeconds < intervals.day) {
    const hours = Math.floor(diffInSeconds / intervals.hour);
    if (language === 'am') {
      return hours === 1 ? 'ሰዓት በፊት' : `${hours} ሰዓቶች በፊት`;
    }
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  if (diffInSeconds < intervals.month) {
    const days = Math.floor(diffInSeconds / intervals.day);
    if (language === 'am') {
      return days === 1 ? 'ቀን በፊት' : `${days} ቀናት በፊት`;
    }
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  // For older dates, just show the date
  return then.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US');
};

export const formatPrice = (price: number, currency = 'ETB', language: 'en' | 'am') => {
  const formatted = new Intl.NumberFormat(language === 'am' ? 'am-ET' : 'en-US').format(price);
  return `${currency} ${formatted}`;
};

export const formatNumber = (num: number, language: 'en' | 'am') => {
  if (num >= 1000000) {
    const millions = (num / 1000000).toFixed(1);
    return language === 'am' ? `${millions}ሚ` : `${millions}M`;
  }
  if (num >= 1000) {
    const thousands = (num / 1000).toFixed(1);
    return language === 'am' ? `${thousands}ሺ` : `${thousands}K`;
  }
  return num.toString();
};
