import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { loginWithEmail, registerWithEmail } from '../firebase';
import { ShieldAlert, LogIn, UserPlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const { t } = useLanguage();
  const { userData, user, isAdmin, isStudent, isTeacher } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultTab = location.state?.defaultTab || 'student';
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUP, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUP) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      // Role routing is handled by the useEffect above once auth state updates
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError(t('Email is already registered.', 'ای میل پہلے ہی رجسٹرڈ ہے۔'));
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(t('Invalid email or password.', 'غلط ای میل یا پاس ورڈ۔'));
      } else if (err.code === 'auth/weak-password') {
        setError(t('Password should be at least 6 characters.', 'پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے۔'));
      } else {
        setError(err.message || 'Authentication failed');
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start space-x-2 space-x-reverse text-sm max-w-md w-full">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-emerald-600 flex flex-col w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-urdu text-emerald-900 mb-2">
            {defaultTab === 'admin' && !isSignUP ? t('Admin Login', 'ایڈمن لاگ ان') : 
             isSignUP ? t('Create an Account', 'اکاؤنٹ بنائیں') : t('Student Login', 'طالب علم لاگ ان')}
          </h2>
          <p className="text-gray-500 font-urdu">
            {isSignUP 
              ? t('Sign up to submit admission request.', 'داخلہ کی درخواست جمع کرنے کے لیے رجسٹر کریں۔') 
              : t('Login to access your dashboard.', 'ڈیش بورڈ تک رسائی کے لیے لاگ ان کریں۔')
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Email Address', 'ای میل ایڈریس')}</label>
            <input 
              type="email" 
              required
              className="w-full border rounded-lg px-3 py-2 text-left font-sans focus:ring-2 focus:ring-emerald-500" 
              dir="ltr"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Password', 'پاس ورڈ')}</label>
            <input 
              type="password" 
              required
              className="w-full border rounded-lg px-3 py-2 text-left font-sans focus:ring-2 focus:ring-emerald-500" 
              dir="ltr"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 space-x-reverse transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : isSignUP ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            <span className="font-urdu">
              {isSignUP ? t('Sign Up', 'رجسٹر کریں') : t('Sign In', 'لاگ ان کریں')}
            </span>
          </button>
        </form>

        {defaultTab !== 'admin' && (
          <div className="mt-6 text-center">
            <button 
              type="button" 
              onClick={() => { setIsSignUp(!isSignUP); setError(null); }}
              className="text-emerald-600 hover:text-emerald-800 font-urdu focus:outline-none"
            >
              {isSignUP 
                ? t('Already have an account? Sign In', 'پہلے سے ہی ایک اکاؤنٹ ہے؟ لاگ ان کریں') 
                : t("Don't have an account? Sign Up", 'اکاؤنٹ نہیں ہے؟ رجسٹر کریں')
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
