import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AdmissionForm() {
  const { user, userData } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nameUrdu: '',
    name: '',
    fatherName: '',
    caste: '',
    age: '',
    address: '',
    mobileNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'students'), {
        ...formData,
        gmail: user.email,
        userId: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        admissionDate: new Date().toISOString().split('T')[0]
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error submitting application.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (userData && userData.role !== 'unverified')) {
    // If not unverified, they shouldn't be here
    return (
      <div className="flex flex-col items-center justify-center p-10 font-urdu text-center">
        <p>{t('You are already verified or not logged in.', 'آپ پہلے سے ہی تصدیق شدہ ہیں یا لاگ ان نہیں ہیں۔')}</p>
        <button onClick={() => navigate('/login')} className="mt-4 text-emerald-600 underline">
          {t('Go to Login', 'لاگ ان پر جائیں')}
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-emerald-600 max-w-xl w-full text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-urdu text-emerald-900 mb-4">
            {t('Application Submitted successfully', 'درخواست کامیابی کے ساتھ جمع ہو گئی')}
          </h2>
          <p className="text-gray-600 font-urdu mb-8">
            {t('Your admission request is currently pending. Please wait for the admin to review and approve your application.', 'آپ کے داخلے کی درخواست اس وقت زیر التواء ہے۔ براہ کرم انتظامیہ کے جائزے اور منظوری کا انتظار کریں۔')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-emerald-600 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-urdu text-emerald-900">
            {t('Student Admission Form', 'طالب علم کے داخلے کا فارم')}
          </h2>
          <p className="text-gray-500 font-urdu mt-2">
            {t('Please fill out this form to request admission.', 'داخلے کی درخواست کے لیے براہ کرم یہ فارم پُر کریں۔')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start space-x-2 space-x-reverse text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Name (Urdu)', 'نام (اردو)')}</label>
              <input required type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right focus:ring-2 focus:ring-emerald-500" value={formData.nameUrdu} onChange={e => setFormData({...formData, nameUrdu: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Name (English)', 'نام (انگریزی)')}</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2 font-sans text-left focus:ring-2 focus:ring-emerald-500" dir="ltr" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Father Name', 'والد کا نام')}</label>
              <input required type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right focus:ring-2 focus:ring-emerald-500" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Mobile Number', 'موبائل نمبر')}</label>
              <input required type="text" className="w-full border rounded-lg px-3 py-2 font-sans focus:ring-2 focus:ring-emerald-500" dir="ltr" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Age', 'عمر')}</label>
              <input type="number" min="0" className="w-full border rounded-lg px-3 py-2 font-sans focus:ring-2 focus:ring-emerald-500" dir="ltr" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Caste', 'قوم')}</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right focus:ring-2 focus:ring-emerald-500" value={formData.caste} onChange={e => setFormData({...formData, caste: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Address', 'پتہ')}</label>
            <input required type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right focus:ring-2 focus:ring-emerald-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-70 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <span className="font-urdu">{t('Submit Application', 'درخواست جمع کروائیں')}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
