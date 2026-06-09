import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { format } from 'date-fns';

export default function ManageReports() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<any[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reports, setReports] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const stuSnap = await getDocs(collection(db, 'students'));
      const stuList = stuSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(stuList);

      const repSnap = await getDocs(collection(db, 'daily_reports'));
      const repMap: Record<string, any> = {};
      repSnap.forEach(d => {
        const data = d.data();
        if (data.date === date) {
          repMap[data.studentId] = data;
        }
      });
      setReports(repMap);
    }
    fetchData();
  }, [date]);

  const handleChange = (studentId: string, field: string, value: any) => {
    setReports(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(reports).map(([studentId, data]) => {
        const docId = `${studentId}_${date}`;
        return setDoc(doc(db, 'daily_reports', docId), {
          studentId,
          date,
          ...data,
          timestamp: new Date().toISOString()
        });
      });
      await Promise.all(promises);
      alert(t('Reports saved successfully!', 'رپورٹس کامیابی سے محفوظ کی گئیں!'));
    } catch (err) {
      console.error(err);
      alert('Error saving reports');
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
        <h2 className="text-2xl font-bold font-urdu text-emerald-900">
          {t('Manage Daily Reports', 'روزانہ رپورٹس کا انتظام')}
        </h2>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          <label className="font-urdu text-gray-700 font-medium">{t('Date:', 'تاریخ:')}</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="border rounded-lg px-3 py-2 font-sans"
            dir="ltr"
          />
        </div>
      </div>

      <div className="overflow-x-auto shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg border border-gray-200 hide-scrollbar pb-4 block">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr className="font-urdu text-gray-700 text-right">
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Name', 'نام')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-center border-r border-gray-200">{t('Sabq', 'سبق')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-center">{t('Sabqi', 'سبقی')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-center">{t('Manzil', 'منزل')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-center">{t('Duas', 'دعائیں')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-center border-l border-gray-200">{t('Namaz (Fajr-Isha)', 'نماز')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-center">{t('Remarks', 'ریمارکس')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {students.map((s) => {
              const rep = reports[s.id] || {};
              return (
                <tr key={s.id} className="hover:bg-gray-50 font-urdu">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 border-l border-gray-200">
                    <div className="font-bold text-base">{s.nameUrdu || s.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-center border-r border-gray-100">
                    <input type="checkbox" checked={!!rep.sabq} onChange={e => handleChange(s.id, 'sabq', e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-center border-r border-gray-100">
                    <input type="checkbox" checked={!!rep.sabqi} onChange={e => handleChange(s.id, 'sabqi', e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-center border-r border-gray-100">
                    <input type="checkbox" checked={!!rep.manzil} onChange={e => handleChange(s.id, 'manzil', e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-center border-r border-gray-100">
                    <input type="checkbox" checked={!!rep.duas} onChange={e => handleChange(s.id, 'duas', e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-sm text-center border-l border-gray-100">
                    <div className="flex space-x-1 space-x-reverse justify-center">
                      {['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].map(namaz => (
                        <select 
                          key={namaz} 
                          value={rep[namaz] || ''} 
                          onChange={e => handleChange(s.id, namaz, e.target.value)}
                          className="text-xs border p-1 rounded font-sans"
                          title={namaz}
                        >
                          <option value="">-</option>
                          <option value="performed">P</option>
                          <option value="missed">M</option>
                        </select>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-center">
                    <input type="text" value={rep.remarks || ''} onChange={e => handleChange(s.id, 'remarks', e.target.value)} className="w-full min-w-[120px] border px-2 py-1 rounded" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-urdu font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? t('Saving...', 'محفوظ ہو رہا ہے...') : t('Save Reports', 'رپورٹس محفوظ کریں')}
        </button>
      </div>
    </div>
  );
}
