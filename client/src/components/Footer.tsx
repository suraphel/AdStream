import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Linkedin, Shield, CheckCircle } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">EthioMarket</h3>
            <p className="text-gray-300 mb-4">
              Ethiopia's premier classified ads platform connecting buyers and sellers nationwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/electronics">
                  <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                    {t('categories.electronics')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/category/vehicles">
                  <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                    {t('categories.vehicles')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/category/real-estate">
                  <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                    {t('categories.realEstate')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/category/jobs">
                  <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                    {t('categories.jobs')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/category/fashion">
                  <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                    {t('categories.fashion')}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Safety Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Report Issue
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-300 text-sm">
            © 2024 EthioMarket. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="flex items-center space-x-2 text-gray-300 text-sm">
              <Shield className="w-4 h-4" />
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Verified Sellers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
