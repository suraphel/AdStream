import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import useAdminTranslation from "@/hooks/useAdminTranslation";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Flag, 
  Settings,
  LogOut,
  Menu,
  X,
  Globe
} from "lucide-react";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useAdminTranslation();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if user doesn't have admin or moderator role
  useEffect(() => {
    if (!isAuthenticated || !user || ((user as any).role !== 'Admin' && (user as any).role !== 'Moderator')) {
      window.location.href = '/';
    }
  }, [isAuthenticated, user]);

  // Don't render if not authenticated or not admin/moderator
  if (!isAuthenticated || !user || ((user as any).role !== 'Admin' && (user as any).role !== 'Moderator')) {
    return null;
  }

  const menuItems = [
    {
      href: "/admin/dashboard",
      label: t("admin.menu.dashboard"),
      labelAm: "ዳሽቦርድ",
      icon: LayoutDashboard,
      active: location === "/admin/dashboard"
    },
    {
      href: "/admin/users",
      label: t("admin.menu.users"),
      labelAm: "ተጠቃሚዎች",
      icon: Users,
      active: location?.startsWith("/admin/users")
    },
    {
      href: "/admin/listings",
      label: t("admin.menu.listings"),
      labelAm: "ማስታወቂያዎች",
      icon: FileText,
      active: location?.startsWith("/admin/listings")
    },
    {
      href: "/admin/flagged",
      label: t("admin.menu.flagged"),
      labelAm: "የተሰየሙ",
      icon: Flag,
      active: location?.startsWith("/admin/flagged")
    },
    {
      href: "/admin/settings",
      label: t("admin.menu.settings"),
      labelAm: "ቅንብሮች",
      icon: Settings,
      active: location?.startsWith("/admin/settings"),
      adminOnly: true
    }
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {t("admin.title")}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            if (item.adminOnly && (user as any).role !== 'Admin') {
              return null;
            }

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${item.active 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{language === 'am' ? item.labelAm : item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                {(user as any).firstName?.[0] || (user as any).email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {(user as any).firstName} {(user as any).lastName}
              </p>
              <Badge variant={(user as any).role === 'Admin' ? 'default' : 'secondary'} className="text-xs">
                {(user as any).role}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={toggleLanguage}
            >
              <Globe className="h-4 w-4 mr-2" />
              {language === 'en' ? 'አማርኛ' : 'English'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t("admin.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("admin.title")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("admin.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                {t("admin.viewSite")}
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;