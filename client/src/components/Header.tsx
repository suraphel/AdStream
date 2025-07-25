import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus, Menu, ChevronDown, User } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('header.home'), href: '/', current: location === '/' },
    { name: t('header.categories'), href: '/categories', current: location.startsWith('/categories') },
    { name: 'External Listings', href: '/external', current: location === '/external', auth: true },
    { name: t('header.myAds'), href: '/my-ads', current: location === '/my-ads', auth: true },
    { name: t('header.messages'), href: '/messages', current: location === '/messages', auth: true },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer">EthioMarket</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              if (item.auth && !isAuthenticated) return null;
              return (
                <Link key={item.name} href={item.href}>
                  <span className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    item.current
                      ? 'text-secondary-800'
                      : 'text-secondary-600 hover:text-primary'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center space-x-1 bg-secondary-100 rounded-full p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  language === 'en'
                    ? 'bg-white text-secondary-800 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('am')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  language === 'am'
                    ? 'bg-white text-secondary-800 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-800'
                }`}
              >
                አማ
              </button>
            </div>

            {/* Post Ad Button */}
            {isAuthenticated && (
              <Link href="/select-category">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('header.postAd')}
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-ads">My Ads</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">Favorites</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/api/logout">{t('header.logout')}</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/register">Register</Link>
                </Button>
                <Button asChild>
                  <a href="/api/login">{t('header.login')}</a>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => {
                    if (item.auth && !isAuthenticated) return null;
                    return (
                      <Link key={item.name} href={item.href}>
                        <a
                          className={`block px-3 py-2 text-base font-medium transition-colors ${
                            item.current
                              ? 'text-secondary-800'
                              : 'text-secondary-600 hover:text-primary'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </a>
                      </Link>
                    );
                  })}
                  
                  {/* Mobile Language Toggle */}
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <span className="text-sm text-secondary-600">Language:</span>
                    <div className="flex items-center space-x-1 bg-secondary-100 rounded-full p-1">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          language === 'en'
                            ? 'bg-white text-secondary-800'
                            : 'text-secondary-600'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage('am')}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          language === 'am'
                            ? 'bg-white text-secondary-800'
                            : 'text-secondary-600'
                        }`}
                      >
                        አማ
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
