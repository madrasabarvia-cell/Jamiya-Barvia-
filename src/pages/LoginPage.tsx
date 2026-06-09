import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { loginWithGoogle } from '../firebase';
import { ShieldAlert, LogIn, Users, ShieldCheck, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { t } = useLanguage();
  const { userData, user, isAdmin, isStudent, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect them
  React.useEffect(() => {
    if (user && userData) {
      if (isAdmin) {
        navigate('/admin');
      } else if (isTeacher) {
        navigate('/teacher');
      } else if (isStudent) {
        navigate('/student');
      } else if (userData.role === 'unverified') {
        navigate('/admission');
      }
    }
  }, [user, userData, isAdmin, isTeacher, isStudent, navigate]);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      // Role routing is handled by the useEffect above once auth state updates
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start space-x-2 space-x-reverse text-sm max-w-2xl w-full">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Admin Login Panel */}
        <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-emerald-600 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-urdu text-emerald-900 mb-2">
            {t('Admin Login', 'ایڈمن لاگ ان')}
          </h2>
          <p className="text-gray-500 font-urdu mb-8 flex-1">
            {t('Management portal access for administration.', 'انتظامیہ کے لیے مینجمنٹ پورٹل تک رسائی۔')}
          </p>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 space-x-reverse transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span className="font-urdu">
              {t('Admin Sign in via Google', 'ایڈمن لاگ ان (گوگل)')}
            </span>
          </button>
        </div>

        {/* Student Login Panel */}
        <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-gold-500 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-amber-50 text-gold-600 rounded-full flex items-center justify-center mb-6">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-urdu text-emerald-900 mb-2">
            {t('Student Login', 'طالب علم لاگ ان')}
          </h2>
          <p className="text-gray-500 font-urdu mb-8 flex-1">
            {t('Access attendance, reports, and academic records.', 'حاضری، رپورٹس اور تعلیمی ریکارڈ تک رسائی۔')}
          </p>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 space-x-reverse transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span className="font-urdu">
              {t('Student Sign in via Google', 'طالب علم لاگ ان (گوگل)')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
