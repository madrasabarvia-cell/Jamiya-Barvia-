import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { format } from 'date-fns';
import { Check, X, Umbrella, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ManageAttendance() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<any[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<Record<string, string>>({}); // { studentId: status }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const stuSnap = await getDocs(collection(db, 'students'));
      const stuList = stuSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(stuList);

      const attSnap = await getDocs(collection(db, 'attendance'));
      const attMap: Record<string, string> = {};
      attSnap.forEach(d => {
        const data = d.data();
        if (data.date === date) {
          attMap[data.studentId] = data.status;
        }
      });
      setAttendance(attMap);
    }
    fetchData();
  }, [date]);

  const handleMark = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(attendance).map(([studentId, status]) => {
        const docId = `${studentId}_${date}`;
        return setDoc(doc(db, 'attendance', docId), {
          studentId,
          date,
          status,
          timestamp: new Date().toISOString()
        });
      });
      await Promise.all(promises);
      alert(t('Attendance saved successfully!', 'حاضری کامیابی سے محفوظ کی گئی!'));
    } catch (err) {
      console.error(err);
      alert('Error saving attendance');
    }
    setSaving(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['ID', 'Name', 'Status']],
      body: students.map(s => [s.studentId, s.name, attendance[s.id] || '-']),
    });
    doc.save(`Attendance_${date}.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(students.map(s => ({
      ID: s.studentId,
      Name: s.name,
      Status: attendance[s.id] || '-'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${date}.xlsx`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
        <h2 className="text-2xl font-bold font-urdu text-emerald-900 border-b pb-2">
          {t('Manage Attendance', 'حاضری کا انتظام')}
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
          <button onClick={exportPDF} className="p-2 border rounded-lg text-emerald-600 hover:bg-emerald-50" title={t('Export PDF', 'پی ڈی ایف ایکسپورٹ')}>
             <span className="text-xs font-bold font-sans">PDF</span>
          </button>
          <button onClick={exportExcel} className="p-2 border rounded-lg text-emerald-600 hover:bg-emerald-50" title={t('Export Excel', 'ایکسل ایکسپورٹ')}>
             <span className="text-xs font-bold font-sans">XLS</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr className="font-urdu text-gray-700 text-right">
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Name', 'نام')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-center">{t('Status', 'حالت')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 font-urdu">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                  <div className="font-bold text-base">{s.nameUrdu || s.name}</div>
                  <div className="text-gray-500 font-sans text-xs">{s.studentId}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm flex justify-center space-x-2 space-x-reverse">
                  <button 
                    onClick={() => handleMark(s.id, 'present')}
                    className={`flex items-center space-x-1 space-x-reverse px-3 py-1.5 rounded-md border transition-colors ${attendance[s.id] === 'present' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Check className="w-4 h-4" /> <span>{t('Present', 'حاضر')}</span>
                  </button>
                  <button 
                    onClick={() => handleMark(s.id, 'absent')}
                    className={`flex items-center space-x-1 space-x-reverse px-3 py-1.5 rounded-md border transition-colors ${attendance[s.id] === 'absent' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <X className="w-4 h-4" /> <span>{t('Absent', 'غیر حاضر')}</span>
                  </button>
                  <button 
                    onClick={() => handleMark(s.id, 'leave')}
                    className={`flex items-center space-x-1 space-x-reverse px-3 py-1.5 rounded-md border transition-colors ${attendance[s.id] === 'leave' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Umbrella className="w-4 h-4" /> <span>{t('Leave', 'چھٹی')}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-urdu font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? t('Saving...', 'محفوظ ہو رہا ہے...') : t('Save Attendance', 'حاضری محفوظ کریں')}
        </button>
      </div>
    </div>
  );
}
