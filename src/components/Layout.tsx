import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../firebase';

export default function Layout() {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, userData } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900 border-4 border-gold-400">
      <header className="bg-emerald-800 text-white shadow-md border-b border-gold-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex justify-between items-center w-full">
            <Link to="/" className="text-xl sm:text-2xl font-bold tracking-tight font-urdu">
              {t('Jamiya Naqshbandia Barvia Rizvia', 'جامعہ نقشبندیہ بارویہ رضویہ')}
            </Link>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-2 space-x-reverse px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
                title={t('Switch Language', 'زبان تبدیل کریں')}
              >
                <Languages className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">
                  {language === 'en' ? 'اردو' : 'English'}
                </span>
              </button>

              {user && (
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 space-x-reverse px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors text-white"
                  title={t('Logout', 'لاگ آؤٹ')}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">{t('Logout', 'لاگ آؤٹ')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative bg-islamic-pattern">
        <div className="absolute inset-0 bg-white/90"></div>
        <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
          <Outlet />
        </div>
      </main>

      <footer className="h-12 bg-gray-50 border-t border-gold-400 px-6 flex items-center justify-between text-[11px] text-emerald-800 z-10 relative">
        <div>&copy; 2024 Jamiya Naqshbandia Management | Bilingual Version</div>
        <div className="flex items-center gap-2">
          <span className="opacity-60 uppercase tracking-widest font-bold">Design By</span>
          <a
            href="https://share.google/YhQGYyA6qsLBTY0m6"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-gold-400 hover:underline"
          >
            Barvi Graphics Faisalabad
          </a>
        </div>
      </footer>
    </div>
  );
}
