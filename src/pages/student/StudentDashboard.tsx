import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserCircle, Calendar, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { userData } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

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

  if (!profile) {
    return <div className="p-8 text-center font-urdu text-gray-500">{t('Loading profile or no profile found.', 'پروفائل لوڈ ہو رہا ہے یا کوئی پروفائل نہیں ملا۔')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold font-urdu text-emerald-900 border-b-2 border-gold-400 pb-4">
        {t('Student Dashboard', 'طالب علم کا ڈیش بورڈ')}
      </h2>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
          <UserCircle className="w-16 h-16" />
        </div>
        <div className="flex-1 space-y-2 text-center sm:text-right">
          <h3 className="text-2xl font-bold font-urdu">{profile.nameUrdu || profile.name}</h3>
          <p className="text-gray-500 font-urdu">{t('Father:', 'والد:')} {profile.fatherName}</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm border border-emerald-200" dir="ltr">ID: {profile.studentId}</span>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200" dir="ltr">{profile.mobileNumber}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4 border-b pb-2">
            <Calendar className="text-emerald-600 w-6 h-6" />
            <h4 className="text-xl font-bold font-urdu">{t('Recent Attendance', 'حالیہ حاضری')}</h4>
          </div>
          <div className="space-y-3">
            {attendances.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5).map((att, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-sans" dir="ltr">{format(new Date(att.date), 'dd MMM yyyy')}</span>
                <span className={`px-2 py-1 rounded text-sm font-urdu font-medium ${
                  att.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                  att.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {att.status === 'present' ? t('Present', 'حاضر') :
                   att.status === 'absent' ? t('Absent', 'غیر حاضر') : t('Leave', 'چھٹی')}
                </span>
              </div>
            ))}
            {attendances.length === 0 && <p className="text-gray-500 font-urdu">{t('No records found.', 'کوئی ریکارڈ نہیں ملا۔')}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center space-x-3 space-x-reverse mb-4 border-b pb-2">
            <BookOpen className="text-emerald-600 w-6 h-6" />
            <h4 className="text-xl font-bold font-urdu">{t('Daily Reports', 'روزانہ رپورٹ')}</h4>
          </div>
          <div className="space-y-4">
            {reports.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5).map((rep, i) => (
              <div key={i} className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="font-bold font-sans text-sm mb-2" dir="ltr">{format(new Date(rep.date), 'dd MMM yyyy')}</div>
                <div className="flex flex-wrap gap-2 text-sm font-urdu mb-2">
                  <span className={`px-2 py-1 rounded ${rep.sabq ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>{t('Sabq', 'سبق')}</span>
                  <span className={`px-2 py-1 rounded ${rep.sabqi ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>{t('Sabqi', 'سبقی')}</span>
                  <span className={`px-2 py-1 rounded ${rep.manzil ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>{t('Manzil', 'منزل')}</span>
                  <span className={`px-2 py-1 rounded ${rep.duas ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>{t('Duas', 'دعائیں')}</span>
                </div>
                <div className="flex space-x-2 space-x-reverse text-xs font-sans mb-2" dir="ltr">
                  {['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].map(namaz => (
                    <span key={namaz} title={namaz} className={`px-1 rounded ${rep[namaz] === 'performed' ? 'bg-emerald-100 text-emerald-700' : rep[namaz] === 'missed' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                      {namaz.charAt(0).toUpperCase()}: {rep[namaz] === 'performed' ? 'P' : rep[namaz] === 'missed' ? 'M' : '-'}
                    </span>
                  ))}
                </div>
                {rep.remarks && (
                  <div className="text-gray-600 text-sm font-urdu mt-2 relative pl-2 pr-2 border-r-2 border-emerald-300">
                    <span className="font-bold">{t('Remarks:', 'ریمارکس:')}</span> {rep.remarks}
                  </div>
                )}
              </div>
            ))}
            {reports.length === 0 && <p className="text-gray-500 font-urdu">{t('No records found.', 'کوئی ریکارڈ نہیں ملا۔')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
