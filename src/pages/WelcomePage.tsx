import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen, User, Users } from 'lucide-react';

export default function WelcomePage() {
  const { t, language } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12">
      <div className="text-center space-y-6 max-w-3xl border-b-2 border-gold-400 pb-12">
        <h2 className="text-3xl font-urdu text-emerald-800 font-semibold mb-4">
          بسم اللہ الرحمن الرحیم
        </h2>
        <h1 className="text-5xl md:text-6xl font-urdu font-bold text-emerald-900 leading-tight">
          {t('Jamiya Naqshbandia Barvia Rizvia', 'جامعہ نقشبندیہ بارویہ رضویہ')}
        </h1>
        <p className="text-lg md:text-xl text-gray-700 font-urdu mt-4">
          {t(
            'Address: Chak No. 109 GB Bajajanwala, Jaranwala, Faisalabad',
            'پتہ: چک نمبر 109 گ ب بجاجانوالہ، جڑانوالہ، فیصل آباد'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link
          to="/faizan-nazar"
          className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-emerald-100 transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1 ring-1 ring-black/5"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
            <BookOpen className="w-10 h-10 text-emerald-600 group-hover:text-white" />
          </div>
          <h3 className="text-2xl font-bold font-urdu text-gray-900 mb-2">
            {t('Faizan-e-Nazar', 'فیضان نظر')}
          </h3>
          <p className="text-gray-500 font-urdu">
            {t('Read profiles of our honorable scholars', 'ہمارے معزز علماء کے تعارفی سوانح پڑھیں')}
          </p>
        </Link>

        <Link
          to="/login"
          className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-emerald-100 transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1 ring-1 ring-black/5"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
            <Users className="w-10 h-10 text-emerald-600 group-hover:text-white" />
          </div>
          <h3 className="text-2xl font-bold font-urdu text-gray-900 mb-2">
            {t('Login Portal', 'لاگ ان پورٹل')}
          </h3>
          <p className="text-gray-500 font-urdu">
            {t('Access student and administration dashboards', 'طلباء اور انتظامیہ کے ڈیش بورڈ تک رسائی حاصل کریں')}
          </p>
        </Link>
      </div>
    </div>
  );
}
