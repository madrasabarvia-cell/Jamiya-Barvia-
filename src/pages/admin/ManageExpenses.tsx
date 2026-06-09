import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageExpenses() {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });

  const loadExpenses = async () => {
    try {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const openAddModal = () => {
    setEditExpense(null);
    setFormData({ title: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (expense: any) => {
    setEditExpense(expense);
    setFormData({
      title: expense.title || '',
      amount: expense.amount || '',
      date: expense.date || format(new Date(), 'yyyy-MM-dd'),
      description: expense.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('Are you sure you want to delete this record?', 'کیا آپ واقعی اس ریکارڈ کو حذف کرنا چاہتے ہیں؟'))) {
      await deleteDoc(doc(db, 'expenses', id));
      loadExpenses();
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
      
      if (editExpense) {
        await updateDoc(doc(db, 'expenses', editExpense.id), dataToSave);
      } else {
        await addDoc(collection(db, 'expenses'), dataToSave);
      }
      setIsModalOpen(false);
      loadExpenses();
    } catch (err) {
      console.error(err);
      alert('Error saving data');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-urdu text-emerald-900 border-b pb-2">
          {t('Manage Expenses', 'اخراجات کا انتظام')}
        </h2>
        <button onClick={openAddModal} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-emerald-700">
          <PlusCircle className="w-5 h-5" />
          <span className="font-urdu">{t('Add Expense', 'خرچ شامل کریں')}</span>
        </button>
      </div>

      <div className="overflow-x-auto shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr className="font-urdu text-gray-700 text-right">
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Date', 'تاریخ')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Expense Title', 'خرچ کا عنوان')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Amount', 'رقم')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Description', 'تفصیل')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-center">{t('Actions', 'اقدامات')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-gray-50 font-urdu">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 font-sans" dir="ltr">{format(new Date(exp.date), 'dd MMM yyyy')}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{exp.title}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-red-600 font-bold font-sans" dir="ltr">RS {exp.amount}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{exp.description}</td>
                <td className="relative whitespace-nowrap px-4 py-3 text-sm text-center">
                  <div className="flex justify-center space-x-3 space-x-reverse">
                    <button onClick={() => openEditModal(exp)} className="text-blue-600 hover:text-blue-900"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(exp.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-urdu">{t('No expense records found.', 'اخراجات کا کوئی ریکارڈ نہیں ملا۔')}</td>
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
                {editExpense ? t('Edit Expense', 'خرچ میں ترمیم کریں') : t('Add Expense', 'خرچ شامل کریں')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-sans text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Expense Title', 'خرچ کا عنوان')}</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
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
                <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Description', 'تفصیل')}</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
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
