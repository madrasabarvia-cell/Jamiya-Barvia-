import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserCircle, Calendar, BookOpen, KeyRound, Menu, X, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { getAuth, updatePassword } from 'firebase/auth';

export default function StudentDashboard() {
  const { userData, user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Change Password state
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (userData?.studentId) {
        try {
          const { doc: firestoreDoc, getDoc } = await import('firebase/firestore');
          const docRef = firestoreDoc(db, 'students', userData.studentId);
          const stuSnap = await getDoc(docRef);
          
          if (stuSnap.exists()) {
            setProfile({ id: stuSnap.id, ...stuSnap.data() });
            fetchRecords(stuSnap.id);
          }
        } catch (err) {
          console.error("Error fetching student profile:", err);
        }
      }
    }
    fetchData();
  }, [userData]);

  const fetchRecords = async (studentDocId: string) => {
    const qAtt = query(collection(db, 'attendance'), where('studentId', '==', studentDocId));
    const attSnap = await getDocs(qAtt);
    setAttendances(attSnap.docs.map(d => d.data()));

    const qRep = query(collection(db, 'daily_reports'), where('studentId', '==', studentDocId));
    const repSnap = await getDocs(qRep);
    setReports(repSnap.docs.map(d => d.data()));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setMessage(t('Password changed successfully.', 'پاس ورڈ کامیابی کے ساتھ تبدیل ہو گیا۔'));
        setNewPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Error changing password.');
    }
  };

  const menuItems = [
    { id: 'profile', icon: UserCircle, label: t('My Profile', 'میری پروفائل') },
    { id: 'attendance', icon: Calendar, label: t('My Attendance', 'میری حاضری') },
    { id: 'lessons', icon: BookOpen, label: t('My Lessons', 'میرے اسباق') },
    { id: 'namaz', icon: BookOpen, label: t('My Namaz Record', 'میری نماز کا ریکارڈ') },
    { id: 'reports', icon: LayoutDashboard, label: t('My Reports', 'میری رپورٹس') },
    { id: 'password', icon: KeyRound, label: t('Change Password', 'پاس ورڈ تبدیل کریں') },
  ];

  if (!profile) {
    return <div className="p-8 text-center font-urdu text-gray-500">{t('Loading profile or no profile found.', 'پروفائل لوڈ ہو رہا ہے یا کوئی پروفائل نہیں ملا۔')}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-12rem)]">
      
      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
        <span className="font-bold font-urdu text-emerald-900">{t('Student Menu', 'طالب علم مینو')}</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-emerald-700">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
        <nav className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors font-urdu text-base ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-emerald-100 p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold font-urdu text-emerald-900 mb-6 border-b pb-2">
          {menuItems.find(m => m.id === activeTab)?.label}
        </h2>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-emerald-50/30 p-6 rounded-xl border border-emerald-100">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
              <UserCircle className="w-16 h-16" />
            </div>
            <div className="flex-1 space-y-3 text-center sm:text-right">
              <h3 className="text-2xl font-bold font-urdu">{profile.nameUrdu}</h3>
              <p className="text-gray-600 font-urdu">{t('Name (English):', 'نام (انگریزی):')} <span className="font-sans" dir="ltr">{profile.name}</span></p>
              <p className="text-gray-600 font-urdu">{t('Father:', 'والد کا نام:')} {profile.fatherName}</p>
              <p className="text-gray-600 font-urdu">{t('Address:', 'پتہ:')} {profile.address}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-4">
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-sans font-medium" dir="ltr">ID: {profile.studentId}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-sans font-medium" dir="ltr">{profile.mobileNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            {attendances.sort((a,b) => b.date.localeCompare(a.date)).map((att, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-sans font-medium text-gray-700" dir="ltr">{format(new Date(att.date), 'dd MMM yyyy')}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-urdu font-medium shadow-sm ${
                  att.status === 'present' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  att.status === 'absent' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {att.status === 'present' ? t('Present', 'حاضر') :
                   att.status === 'absent' ? t('Absent', 'غیر حاضر') : t('Leave', 'چھٹی')}
                </span>
              </div>
            ))}
            {attendances.length === 0 && <p className="text-gray-500 font-urdu text-center py-8">{t('No attendance records found.', 'حاضری کا کوئی ریکارڈ نہیں ملا۔')}</p>}
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {reports.sort((a,b) => b.date.localeCompare(a.date)).map((rep, i) => (
              <div key={i} className="p-5 bg-emerald-50/50 rounded-lg border border-emerald-100 shadow-sm">
                <div className="font-bold font-sans text-sm text-emerald-800 mb-3 border-b border-emerald-100 pb-2" dir="ltr">{format(new Date(rep.date), 'dd MMMM yyyy')}</div>
                
                <div>
                  <h5 className="font-bold font-urdu text-gray-700 mb-2">{t('Lessons (Sabq, Sabqi, Manzil)', 'اسباق (سبق، سبقی، منزل)')}</h5>
                  <div className="flex flex-wrap gap-2 text-sm font-urdu">
                    <span className={`px-3 py-1.5 rounded-md border ${rep.sabq ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{t('Sabq', 'سبق')}</span>
                    <span className={`px-3 py-1.5 rounded-md border ${rep.sabqi ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{t('Sabqi', 'سبقی')}</span>
                    <span className={`px-3 py-1.5 rounded-md border ${rep.manzil ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{t('Manzil', 'منزل')}</span>
                    <span className={`px-3 py-1.5 rounded-md border ${rep.duas ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{t('Duas', 'دعائیں')}</span>
                  </div>
                </div>
              </div>
            ))}
            {reports.length === 0 && <p className="text-gray-500 font-urdu text-center py-8">{t('No lessons records found.', 'کوئی اسباق کا ریکارڈ نہیں ملا۔')}</p>}
          </div>
        )}

        {/* Namaz Tab */}
        {activeTab === 'namaz' && (
          <div className="space-y-4">
            {reports.sort((a,b) => b.date.localeCompare(a.date)).map((rep, i) => (
              <div key={i} className="p-5 bg-emerald-50/50 rounded-lg border border-emerald-100 shadow-sm">
                <div className="font-bold font-sans text-sm text-emerald-800 mb-3 border-b border-emerald-100 pb-2" dir="ltr">{format(new Date(rep.date), 'dd MMMM yyyy')}</div>
                
                <div>
                  <h5 className="font-bold font-urdu text-gray-700 mb-2">{t('Namaz Record', 'نماز کا ریکارڈ')}</h5>
                  <div className="flex flex-wrap gap-2 text-xs font-sans" dir="ltr">
                    {['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].map(namaz => {
                      const namazNames: Record<string, string> = {
                        fajr: 'Fajr', zuhr: 'Zuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha'
                      };
                      return (
                        <span key={namaz} className={`px-2 py-1 rounded-md border ${
                          rep[namaz] === 'performed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                          rep[namaz] === 'missed' ? 'bg-red-100 text-red-800 border-red-200' : 
                          'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          {namazNames[namaz]}: {rep[namaz] === 'performed' ? 'Performed' : rep[namaz] === 'missed' ? 'Missed' : 'N/A'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {reports.length === 0 && <p className="text-gray-500 font-urdu text-center py-8">{t('No namaz records found.', 'نماز کا کوئی ریکارڈ نہیں ملا۔')}</p>}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reports.sort((a,b) => b.date.localeCompare(a.date)).map((rep, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="font-bold font-sans text-emerald-800" dir="ltr">{format(new Date(rep.date), 'dd MMM yyyy')}</div>
                <div className="flex-1">
                  {rep.remarks ? (
                     <div className="text-gray-700 text-sm font-urdu">
                       <span className="font-bold">{t('Remarks:', 'ریمارکس:')}</span> {rep.remarks}
                     </div>
                  ) : (
                    <div className="text-gray-400 text-sm font-urdu italic">{t('No remarks for this day.', 'اس دن کے لیے کوئی تبصرہ نہیں۔')}</div>
                  )}
                </div>
              </div>
            ))}
            {reports.length === 0 && <p className="text-gray-500 font-urdu text-center py-8">{t('No reports found.', 'کوئی رپورٹ نہیں ملی۔')}</p>}
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="max-w-md">
            {message && <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 rounded-lg">{message}</div>}
            {error && <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('New Password', 'نیا پاس ورڈ')}</label>
                <input 
                  type="password" 
                  required
                  title={t("Must be at least 6 characters", "کم از کم 6 حروف پر مشتمل ہونا چاہیے")}
                  minLength={6}
                  className="w-full border rounded-lg px-3 py-2 text-left font-sans focus:ring-2 focus:ring-emerald-500" 
                  dir="ltr"
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-sm mt-4"
              >
                <span className="font-urdu">{t('Update Password', 'پاس ورڈ اپ ڈیٹ کریں')}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
