import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { Bell, GraduationCap, ClipboardCheck, BookOpen } from 'lucide-react';

export default function AdminNotifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNotifications() {
      const notes = [];
      try {
        const qStu = query(collection(db, 'students'), orderBy('admissionDate', 'desc'), limit(5));
        const sSnap = await getDocs(qStu);
        sSnap.forEach(d => {
          notes.push({
            id: d.id + '_stu',
            type: 'admission',
            message: `New student admitted: ${d.data().name} (${d.data().studentId})`,
            date: new Date(d.data().admissionDate).toISOString()
          });
        });

        const qAtt = query(collection(db, 'attendance'), orderBy('date', 'desc'), limit(5));
        const aSnap = await getDocs(qAtt);
        aSnap.forEach(d => {
          notes.push({
            id: d.id + '_att',
            type: 'attendance',
            message: `Attendance recorded for class ${d.data().classId} on ${d.data().date}`,
            date: new Date(d.data().date).toISOString()
          });
        });

        notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotifications(notes);
      } catch (err) {
        console.error(err);
      }
    }
    fetchNotifications();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold font-urdu text-emerald-900 border-b pb-2 mb-6 flex items-center space-x-2 space-x-reverse">
        <Bell className="w-6 h-6 text-emerald-600" />
        <span>{t('System Notifications', 'سسٹم نوٹیفکیشنز')}</span>
      </h2>

      <div className="space-y-4">
        {notifications.map((note) => (
          <div key={note.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4 space-x-reverse">
            <div className={`p-3 rounded-full ${note.type === 'admission' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {note.type === 'admission' ? <GraduationCap className="w-6 h-6" /> : <ClipboardCheck className="w-6 h-6" />}
            </div>
            <div>
              <p className="font-sans text-gray-800" dir="ltr">{note.message}</p>
              <p className="text-sm text-gray-500 mt-1 font-sans" dir="ltr">{new Date(note.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center text-gray-500 font-urdu py-8">
            {t('No notifications found.', 'کوئی نوٹیفکیشن نہیں ملا۔')}
          </div>
        )}
      </div>
    </div>
  );
}
