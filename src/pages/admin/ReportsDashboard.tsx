import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { FileDown, Printer, FileSpreadsheet } from 'lucide-react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

export default function ReportsDashboard() {
  const { t } = useLanguage();
  const [reportType, setReportType] = useState('financial'); // financial, students
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any[]>([]);

  const fetchFinancials = async () => {
    try {
      const qInc = query(collection(db, 'income'), orderBy('date', 'desc'));
      const sInc = await getDocs(qInc);
      setIncomeData(sInc.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const qExp = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const sExp = await getDocs(qExp);
      setExpenseData(sExp.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, 'students'));
      const s = await getDocs(q);
      setStudentData(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (reportType === 'financial') {
      fetchFinancials();
    } else {
      fetchStudents();
    }
  }, [reportType]);

  const filteredIncome = incomeData.filter(i => i.date >= startDate && i.date <= endDate);
  const filteredExpense = expenseData.filter(e => e.date >= startDate && e.date <= endDate);
  const filteredStudents = studentData.filter(s => {
    if (!s.admissionDate) return false;
    return s.admissionDate >= startDate && s.admissionDate <= endDate;
  });

  const totalIncome = filteredIncome.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpense = filteredExpense.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  
  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'financial') {
      csvContent += "Type,Date,Title/Donor,Amount,Remarks\n";
      filteredIncome.forEach(i => {
        csvContent += `Income,${i.date},"${i.donorName}",${i.amount},"${i.remarks || ''}"\n`;
      });
      filteredExpense.forEach(e => {
        csvContent += `Expense,${e.date},"${e.title}",${e.amount},"${e.description || ''}"\n`;
      });
      csvContent += `\nTotal Income,,,${totalIncome}\n`;
      csvContent += `Total Expense,,,${totalExpense}\n`;
      csvContent += `Net Balance,,,${totalIncome - totalExpense}\n`;
    } else {
      csvContent += "ID,Name,Father Name,Mobile,Admission Date\n";
      filteredStudents.forEach(s => {
        csvContent += `"${s.studentId}","${s.name}","${s.fatherName}","${s.mobile}","${s.admissionDate}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${reportType}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="print-container">
      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-2xl font-bold font-urdu text-emerald-900 border-b pb-2">
          {t('Exports & Analytics', 'رپورٹس اور تجزیہ')}
        </h2>
        <div className="flex space-x-2 space-x-reverse">
          <button onClick={exportCSV} className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-emerald-200">
            <FileSpreadsheet className="w-5 h-5" />
            <span className="font-urdu">{t('Export CSV', 'ایکسل (CSV) ڈاؤنلوڈ')}</span>
          </button>
          <button onClick={handlePrint} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-emerald-700">
            <Printer className="w-5 h-5" />
            <span className="font-urdu">{t('Print / PDF', 'پرنٹ / پی ڈی ایف')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 no-print bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Report Type', 'رپورٹ کی قسم')}</label>
          <select 
            value={reportType} 
            onChange={e => setReportType(e.target.value)}
            className="w-full border p-2 rounded-lg font-urdu"
          >
            <option value="financial">{t('Financial Report', 'مالیاتی رپورٹ')}</option>
            <option value="students">{t('Students Admission Report', 'طلباء کے داخلے کی رپورٹ')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Filters', 'فلٹرز')}</label>
          <select 
            className="w-full border p-2 rounded-lg font-urdu text-gray-500"
            onChange={(e) => {
              const val = e.target.value;
              const today = new Date();
              if (val === 'today') {
                setStartDate(format(today, 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
              } else if (val === 'week') {
                const lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 7);
                setStartDate(format(lastWeek, 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
              } else if (val === 'month') {
                setStartDate(format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
              } else if (val === 'year') {
                setStartDate(format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'));
                setEndDate(format(today, 'yyyy-MM-dd'));
              }
            }}
          >
            <option value="custom">{t('Custom', 'اپنی مرضی')}</option>
            <option value="today">{t('Today', 'آج')}</option>
            <option value="week">{t('Last 7 Days', 'پچھلے 7 دن')}</option>
            <option value="month">{t('This Month', 'اس ماہ')}</option>
            <option value="year">{t('This Year', 'اس سال')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('From Date', 'تاریخ سے')}</label>
          <input type="date" className="w-full border p-2 rounded-lg font-sans" dir="ltr" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('To Date', 'تاریخ تک')}</label>
          <input type="date" className="w-full border p-2 rounded-lg font-sans" dir="ltr" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="print-area bg-white p-6 rounded-xl border border-gray-200">
        <div className="text-center mb-6 hidden print:block">
          <h1 className="text-3xl font-bold font-urdu mb-2">Jamiya Naqshbandia Management</h1>
          <h2 className="text-xl font-urdu">{reportType === 'financial' ? t('Financial Report', 'مالیاتی رپورٹ') : t('Students Report', 'طلباء کی رپورٹ')}</h2>
          <p className="text-gray-500 font-sans" dir="ltr">{startDate} to {endDate}</p>
        </div>

        {reportType === 'financial' && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-50 p-4 rounded-lg text-center border border-emerald-100">
                <p className="text-emerald-700 font-urdu">{t('Total Income', 'کل آمدنی')}</p>
                <p className="text-2xl font-bold font-sans text-emerald-900" dir="ltr">RS {totalIncome}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
                <p className="text-red-700 font-urdu">{t('Total Expenses', 'کل اخراجات')}</p>
                <p className="text-2xl font-bold font-sans text-red-900" dir="ltr">RS {totalExpense}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                <p className="text-blue-700 font-urdu">{t('Net Balance', 'موجودہ بیلنس')}</p>
                <p className={`text-2xl font-bold font-sans ${totalIncome - totalExpense >= 0 ? 'text-blue-900' : 'text-red-600'}`} dir="ltr">RS {totalIncome - totalExpense}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold font-urdu text-emerald-900 mb-2">{t('Income Details', 'آمدنی کی تفصیلات')}</h3>
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr className="font-urdu text-gray-700 text-right">
                    <th className="px-4 py-2">{t('Date', 'تاریخ')}</th>
                    <th className="px-4 py-2">{t('Donor', 'عطیہ دہندہ')}</th>
                    <th className="px-4 py-2 text-left">{t('Amount', 'رقم')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIncome.map(inc => (
                    <tr key={inc.id}>
                      <td className="px-4 py-2 font-sans" dir="ltr">{inc.date}</td>
                      <td className="px-4 py-2 font-urdu">{inc.donorName}</td>
                      <td className="px-4 py-2 font-sans text-left font-bold" dir="ltr">{inc.amount}</td>
                    </tr>
                  ))}
                  {filteredIncome.length === 0 && <tr><td colSpan={3} className="px-4 py-4 text-center font-urdu text-gray-500">{t('No records found.', 'کوئی ریکارڈ نہیں ملا۔')}</td></tr>}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-bold font-urdu text-red-900 mb-2">{t('Expense Details', 'اخراجات کی تفصیلات')}</h3>
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr className="font-urdu text-gray-700 text-right">
                    <th className="px-4 py-2">{t('Date', 'تاریخ')}</th>
                    <th className="px-4 py-2">{t('Title', 'عنوان')}</th>
                    <th className="px-4 py-2 text-left">{t('Amount', 'رقم')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpense.map(exp => (
                    <tr key={exp.id}>
                      <td className="px-4 py-2 font-sans" dir="ltr">{exp.date}</td>
                      <td className="px-4 py-2 font-urdu">{exp.title}</td>
                      <td className="px-4 py-2 font-sans text-left font-bold" dir="ltr">{exp.amount}</td>
                    </tr>
                  ))}
                  {filteredExpense.length === 0 && <tr><td colSpan={3} className="px-4 py-4 text-center font-urdu text-gray-500">{t('No records found.', 'کوئی ریکارڈ نہیں ملا۔')}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'students' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold font-urdu text-emerald-900 mb-2">{t('Admissions within date range', 'مخصوص تاریخ میں داخلے')} ({filteredStudents.length})</h3>
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr className="font-urdu text-gray-700 text-right">
                    <th className="px-4 py-2">{t('ID', 'آئی ڈی')}</th>
                    <th className="px-4 py-2">{t('Name', 'نام')}</th>
                    <th className="px-4 py-2">{t('Father Name', 'والد کا نام')}</th>
                    <th className="px-4 py-2">{t('Date', 'تاریخ')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map(stu => (
                    <tr key={stu.id}>
                      <td className="px-4 py-2 font-sans" dir="ltr">{stu.studentId}</td>
                      <td className="px-4 py-2 font-urdu">{stu.name}</td>
                      <td className="px-4 py-2 font-urdu">{stu.fatherName}</td>
                      <td className="px-4 py-2 font-sans" dir="ltr">{stu.admissionDate}</td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && <tr><td colSpan={4} className="px-4 py-4 text-center font-urdu text-gray-500">{t('No records found.', 'کوئی ریکارڈ نہیں ملا۔')}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
