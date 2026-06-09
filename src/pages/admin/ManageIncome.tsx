import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageIncome() {
  const { t } = useLanguage();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIncome, setEditIncome] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    donorName: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    remarks: '',
  });

  const loadIncomes = async () => {
    try {
      const q = query(collection(db, 'income'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncomes(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  const openAddModal = () => {
    setEditIncome(null);
    setFormData({ donorName: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), remarks: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (income: any) => {
    setEditIncome(income);
    setFormData({
      donorName: income.donorName || '',
      amount: income.amount || '',
      date: income.date || format(new Date(), 'yyyy-MM-dd'),
      remarks: income.remarks || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('Are you sure you want to delete this record?', 'کیا آپ واقعی اس ریکارڈ کو حذف کرنا چاہتے ہیں؟'))) {
      await deleteDoc(doc(db, 'income', id));
      loadIncomes();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        amount: Number(formData.amount),
        createdAt: new Date().toISOString()
      };
      
      if (editIncome) {
        await updateDoc(doc(db, 'income', editIncome.id), dataToSave);
      } else {
        await addDoc(collection(db, 'income'), dataToSave);
      }
      setIsModalOpen(false);
      loadIncomes();
    } catch (err) {
      console.error(err);
      alert('Error saving data');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-urdu text-emerald-900 border-b pb-2">
          {t('Manage Income', 'آمدنی کا انتظام')}
        </h2>
        <button onClick={openAddModal} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-emerald-700">
          <PlusCircle className="w-5 h-5" />
          <span className="font-urdu">{t('Add Income', 'آمدنی شامل کریں')}</span>
        </button>
      </div>

      <div className="overflow-x-auto shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr className="font-urdu text-gray-700 text-right">
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Date', 'تاریخ')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Donor Name', 'عطیہ دہندہ کا نام')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Amount', 'رقم')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Remarks', 'ریمارکس')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-center">{t('Actions', 'اقدامات')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {incomes.map((inc) => (
              <tr key={inc.id} className="hover:bg-gray-50 font-urdu">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 font-sans" dir="ltr">{format(new Date(inc.date), 'dd MMM yyyy')}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{inc.donorName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-emerald-700 font-bold font-sans" dir="ltr">RS {inc.amount}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{inc.remarks}</td>
                <td className="relative whitespace-nowrap px-4 py-3 text-sm text-center">
                  <div className="flex justify-center space-x-3 space-x-reverse">
                    <button onClick={() => openEditModal(inc)} className="text-blue-600 hover:text-blue-900"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(inc.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {incomes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-urdu">{t('No income records found.', 'آمدنی کا کوئی ریکارڈ نہیں ملا۔')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-emerald-50 rounded-t-xl">
              <h3 className="text-xl font-bold font-urdu text-emerald-900">
                {editIncome ? t('Edit Income', 'آمدنی میں ترمیم کریں') : t('Add Income', 'آمدنی شامل کریں')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-sans text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Donor Name', 'عطیہ دہندہ کا نام')}</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right" value={formData.donorName} onChange={e => setFormData({...formData, donorName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Amount (RS)', 'رقم (RS)')}</label>
                <input required type="number" min="0" className="w-full border rounded-lg px-3 py-2 font-sans" dir="ltr" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Date', 'تاریخ')}</label>
                <input required type="date" className="w-full border rounded-lg px-3 py-2 font-sans" dir="ltr" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Remarks', 'ریمارکس')}</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-urdu">{t('Cancel', 'منسوخ کریں')}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-urdu">{t('Save', 'محفوظ کریں')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
