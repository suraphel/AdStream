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

// Enhanced Admin translations with comprehensive localization
export const adminTranslations = {
  en: {
    title: "Admin Panel",
    subtitle: "Manage users, listings, and content",
    logout: "Logout",
    viewSite: "View Site",
    menu: {
      dashboard: "Dashboard",
      users: "Users",
      listings: "Listings",
      flagged: "Flagged Content",
      settings: "Settings"
    },
    dashboard: {
      welcome: "Welcome to Admin Dashboard",
      subtitle: "Monitor your registered users and listing activities",
      totalUsers: "Total Users",
      totalListings: "Total Listings",
      activeListings: "Active Listings",
      flaggedContent: "Flagged Content",
      today: "today",
      pending: "pending",
      needsReview: "needs review",
      recentActivity: "Recent Activity",
      quickActions: "Quick Actions",
      manageUsers: "Manage Users",
      reviewListings: "Review Listings",
      viewFlagged: "View Flagged Content",
      viewReports: "View Reports",
      systemStatus: "System Status",
      database: "Database",
      api: "API",
      storage: "Storage",
      healthy: "Healthy",
      error: "Error Loading Dashboard",
      errorMessage: "Failed to load dashboard data",
      noActivity: "No recent activity"
    },
    users: {
      title: "Users",
      totalUsers: "Total users",
      filters: "Filters",
      searchPlaceholder: "Search users...",
      allRoles: "All Roles",
      allStatus: "All Status",
      active: "Active",
      suspended: "Suspended",
      unverified: "Unverified",
      clear: "Clear",
      view: "View",
      suspend: "Suspend",
      unsuspend: "Unsuspend",
      userDetails: "User Details",
      name: "Name",
      email: "Email",
      phone: "Phone",
      role: "Role",
      notProvided: "Not provided",
      joined: "Joined",
      emailStatus: "Email Status",
      verified: "Verified",
      suspensionReason: "Suspension Reason",
      listings: "Listings",
      previous: "Previous",
      next: "Next",
      admin: "Admin",
      moderator: "Moderator",
      user: "User",
      success: "Success",
      error: "Error",
      roleUpdated: "User role updated successfully",
      roleUpdateFailed: "Failed to update user role",
      userSuspended: "User suspended successfully",
      suspendFailed: "Failed to suspend user",
      userUnsuspended: "User unsuspended successfully",
      unsuspendFailed: "Failed to unsuspend user",
      loadError: "Failed to load users",
      enterSuspensionReason: "Enter suspension reason:",
      removeSuspension: "Remove Suspension"
    },
    listings: {
      title: "Listings",
      totalListings: "Total listings",
      filters: "Filters",
      searchPlaceholder: "Search listings...",
      status: "Status",
      category: "Category",
      flagged: "Flagged",
      allCategories: "All Categories",
      flaggedOnly: "Flagged Only",
      featuredOnly: "Featured Only",
      all: "All",
      clear: "Clear",
      listing: "Listing",
      price: "Price",
      owner: "Owner",
      views: "Views",
      date: "Date",
      actions: "Actions",
      view: "View",
      active: "Active",
      draft: "Draft",
      sold: "Sold",
      expired: "Expired",
      deleted: "Deleted",
      delete: "Delete",
      flaggedBadge: "Flagged",
      negotiable: "neg",
      previous: "Previous",
      next: "Next",
      listingDetails: "Listing Details",
      listingTitle: "Title",
      location: "Location",
      condition: "Condition",
      description: "Description",
      created: "Created",
      regular: "Regular",
      featured: "Featured",
      flagReason: "Flag Reason",
      adminNotes: "Admin Notes",
      success: "Success",
      error: "Error",
      statusUpdated: "Listing status updated successfully",
      statusUpdateFailed: "Failed to update listing status",
      featuredSuccess: "Listing featured successfully",
      unfeaturedSuccess: "Listing unfeatured successfully",
      featureUpdateFailed: "Failed to update listing feature status",
      loadError: "Failed to load listings",
      enterDeletionReason: "Enter deletion reason:",
      new: "New",
      likeNew: "Like New",
      good: "Good",
      fair: "Fair",
      poor: "Poor"
    },
    common: {
      loading: "Loading...",
      noData: "No data available",
      retry: "Retry",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      confirm: "Confirm",
      yes: "Yes",
      no: "No"
    }
  },
  am: {
    title: "አድሚን ፓነል",
    subtitle: "ተጠቃሚዎችን፣ ማስታወቂያዎችን እና ይዘቶችን ያስተዳድሩ",
    logout: "ውጣ",
    viewSite: "ድህረ ገጹን ይመልከቱ",
    menu: {
      dashboard: "ዳሽቦርድ",
      users: "ተጠቃሚዎች",
      listings: "ማስታወቂያዎች",
      flagged: "የተሰየሙ ይዘቶች",
      settings: "ቅንብሮች"
    },
    dashboard: {
      welcome: "እንኳን ወደ አድሚን ዳሽቦርድ በደህና መጡ",
      subtitle: "የድርጅትዎን የተመዝገቡ እና ማስታወቂያ ክንውኖች ይከታተሉ",
      totalUsers: "ጠቅላላ ተጠቃሚዎች",
      totalListings: "ጠቅላላ ማስታወቂያዎች",
      activeListings: "ንቁ ማስታወቂያዎች",
      flaggedContent: "የተሰየሙ ይዘቶች",
      today: "ዛሬ",
      pending: "በመጠባበቅ ላይ",
      needsReview: "ግምገማ ያስፈልጋል",
      recentActivity: "የቅርብ ጊዜ እንቅስቃሴዎች",
      quickActions: "ፈጣን እርምጃዎች",
      manageUsers: "ተጠቃሚዎችን ይቆጣጠሩ",
      reviewListings: "ማስታወቂያዎችን ይገምግሙ",
      viewFlagged: "የተሰየሙ ይዘቶችን ይመልከቱ",
      viewReports: "ሪፖርቶችን ይመልከቱ",
      systemStatus: "የስርዓት ሁኔታ",
      database: "ዳታቤዝ",
      api: "ኤፒአይ",
      storage: "ማከማቻ",
      healthy: "ጤናማ",
      error: "ዳሽቦርድ መጫን ሳይሳካ ቀረ",
      errorMessage: "የዳሽቦርድ መረጃ መጫን አልተሳካም",
      noActivity: "ምንም የቅርብ ጊዜ እንቅስቃሴ የለም"
    },
    users: {
      title: "ተጠቃሚዎች",
      totalUsers: "ጠቅላላ ተጠቃሚዎች",
      filters: "አጣሪዎች",
      searchPlaceholder: "ተጠቃሚ ይፈልጉ...",
      allRoles: "ሁሉም ሚናዎች",
      allStatus: "ሁሉም ሁኔታዎች",
      active: "ንቁ",
      suspended: "የታገደ",
      unverified: "ያልተረጋገጠ",
      clear: "ፅዳ",
      view: "ይመልከቱ",
      suspend: "ይግደቡ",
      unsuspend: "ቅጣቱን ያንሱ",
      userDetails: "የተጠቃሚ ዝርዝሮች",
      name: "ስም",
      email: "ኢሜይል",
      phone: "ስልክ",
      role: "ሚና",
      notProvided: "አልተሰጠም",
      joined: "የተቀላቀለበት ቀን",
      emailStatus: "ኢሜይል ማረጋገጥ",
      verified: "የተረጋገጠ",
      suspensionReason: "የታገደበት ምክንያት",
      listings: "ማስታወቂያዎች",
      previous: "ቀዳሚ",
      next: "ቀጣይ",
      admin: "አድሚን",
      moderator: "ሞዴሬተር",
      user: "ተጠቃሚ",
      success: "ተሳክቷል",
      error: "ስህተት",
      roleUpdated: "የተጠቃሚ ሚና ተሻሽሏል",
      roleUpdateFailed: "የተጠቃሚ ሚና ማሻሻል አልተሳካም",
      userSuspended: "ተጠቃሚ ታግዷል",
      suspendFailed: "ተጠቃሚን መግደብ አልተሳካም",
      userUnsuspended: "ተጠቃሚ ቅጣቱ ተነስቷል",
      unsuspendFailed: "ተጠቃሚን መልሰው መፍቀድ አልተሳካም",
      loadError: "ተጠቃሚዎችን መጫን አልተሳካም",
      enterSuspensionReason: "የማግደብ ምክንያት ያስገቡ:",
      removeSuspension: "ማገጃን አስወግድ"
    },
    listings: {
      title: "ማስታወቂያዎች",
      totalListings: "ጠቅላላ ማስታወቂያዎች",
      filters: "አጣሪዎች",
      searchPlaceholder: "ማስታወቂያ ይፈልጉ...",
      status: "ሁኔታ",
      category: "ምድብ",
      flagged: "የተሰየሙ",
      allCategories: "ሁሉም ምድቦች",
      flaggedOnly: "የተሰየሙ ብቻ",
      featuredOnly: "የተለዩ ብቻ",
      all: "ሁሉም",
      clear: "ፅዳ",
      listing: "ማስታወቂያ",
      price: "ዋጋ",
      owner: "ባለቤት",
      views: "እይታዎች",
      date: "ቀን",
      actions: "እርምጃዎች",
      view: "ይመልከቱ",
      active: "ንቁ",
      draft: "ረቂቅ",
      sold: "ተሽጧል",
      expired: "ጊዜው አልፏል",
      deleted: "ተሰርዟል",
      delete: "ሰርዝ",
      flaggedBadge: "ተሰይሟል",
      negotiable: "ተደራሽ",
      previous: "ቀዳሚ",
      next: "ቀጣይ",
      listingDetails: "የማስታወቂያ ዝርዝሮች",
      listingTitle: "ርዕስ",
      location: "አካባቢ",
      condition: "ሁኔታ",
      description: "መግለጫ",
      created: "የተፈጠረበት",
      regular: "መደበኛ",
      featured: "የተለየ",
      flagReason: "የተሰየመበት ምክንያት",
      adminNotes: "የአድሚን ማስታወሻዎች",
      success: "ተሳክቷል",
      error: "ስህተት",
      statusUpdated: "የማስታወቂያ ሁኔታ ተሻሽሏል",
      statusUpdateFailed: "የማስታወቂያ ሁኔታ ማሻሻል አልተሳካም",
      featuredSuccess: "ማስታወቂያው ተለይቷል",
      unfeaturedSuccess: "ማስታወቂያው አልተለየም",
      featureUpdateFailed: "የማስታወቂያ ባህሪ ማሻሻል አልተሳካም",
      loadError: "ማስታወቂያዎችን መጫን አልተሳካም",
      enterDeletionReason: "የመሰረዝ ምክንያት ያስገቡ:",
      new: "አዲስ",
      likeNew: "እንደ አዲስ",
      good: "ጥሩ",
      fair: "መጠኑን",
      poor: "መጥፎ"
    },
    common: {
      loading: "በመጫን ላይ...",
      noData: "ምንም መረጃ የለም",
      retry: "እንደገና ሞክር",
      cancel: "ሰርዝ",
      save: "አስቀምጥ",
      delete: "ሰርዝ",
      edit: "አርትዕ",
      close: "ዝጋ",
      confirm: "አረጋግጥ",
      yes: "አዎ",
      no: "አይ"
    }
  }
};
