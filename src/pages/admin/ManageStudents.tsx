import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { PlusCircle, Search, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';

export default function ManageStudents() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');

  // Form State
  const [formData, setFormData] = useState({
    nameUrdu: '',
    name: '',
    fatherName: '',
    caste: '',
    age: '',
    address: '',
    mobileNumber: '',
    gmail: '',
    admissionDate: '',
    reference: '',
    status: 'approved',
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    try {
      const snap = await getDocs(collection(db, 'students'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openAddModal = () => {
    setEditStudent(null);
    setFormData({ nameUrdu: '', name: '', fatherName: '', caste: '', age: '', address: '', mobileNumber: '', gmail: '', admissionDate: '', reference: '', status: 'approved' });
    setPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setEditStudent(student);
    setFormData({
      nameUrdu: student.nameUrdu || '',
      name: student.name || '',
      fatherName: student.fatherName || '',
      caste: student.caste || '',
      age: student.age || '',
      address: student.address || '',
      mobileNumber: student.mobileNumber || '',
      gmail: student.gmail || '',
      admissionDate: student.admissionDate || '',
      reference: student.reference || '',
      status: student.status || 'approved',
    });
    setPassword('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('Are you sure you want to delete this student?', 'کیا آپ واقعی اس طالب علم کو حذف کرنا چاہتے ہیں؟'))) {
      await deleteDoc(doc(db, 'students', id));
      loadStudents();
    }
  };

  const handleApprove = async (student: any) => {
    const confirmation = confirm(t('Approve this admission? This will assign a Student ID and grant them access.', 'کیا آپ اس داخلے کی منظوری دینا چاہتے ہیں؟'));
    if (!confirmation) return;

    try {
      const genId = 'ST-' + Math.floor(1000 + Math.random() * 9000);
      
      // Update student document status & id
      await updateDoc(doc(db, 'students', student.id), {
        status: 'approved',
        studentId: genId,
      });

      // Update user role to 'student' and assign studentId
      if (student.userId) {
        await setDoc(doc(db, 'users', student.userId), {
          role: 'student',
          studentId: genId,
        }, { merge: true });
      }

      alert('Student Approved!');
      loadStudents();
    } catch (err) {
      console.error("Error approving:", err);
      alert('Error approving student');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editStudent) {
        await updateDoc(doc(db, 'students', editStudent.id), formData);
      } else {
        let authUser = null;
        if (formData.gmail && password) {
          const { createStudentUser } = await import('../../firebase');
          try {
            authUser = await createStudentUser(formData.gmail, password);
          } catch (err: any) {
            alert('Error creating user account: ' + err.message);
            setLoading(false);
            return;
          }
        }

        const genId = 'ST-' + Math.floor(1000 + Math.random() * 9000);
        const studentDocInfo: any = { ...formData, studentId: genId, createdAt: new Date().toISOString() };
        
        if (authUser) {
           studentDocInfo.userId = authUser.uid;
           await setDoc(doc(db, 'users', authUser.uid), {
             role: formData.status === 'approved' ? 'student' : 'unverified',
             studentId: genId,
             email: formData.gmail
           });
        }

        await addDoc(collection(db, 'students'), studentDocInfo);
      }
      setIsModalOpen(false);
      loadStudents();
    } catch (err) {
      console.error(err);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s => 
    (s.status || 'approved') === activeTab &&
    ((s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.nameUrdu || '').includes(searchTerm) ||
    (s.studentId || '').includes(searchTerm))
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold font-urdu text-emerald-900 border-b pb-2">
          {t('Manage Students', 'طلباء کا انتظام')}
        </h2>
        
        <div className="flex space-x-4 space-x-reverse w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('Search...', 'تلاش کریں...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 font-urdu"
            />
          </div>
          {isAdmin && (
            <button onClick={openAddModal} className="shrink-0 bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-emerald-700">
              <PlusCircle className="w-5 h-5" />
              <span className="font-urdu hidden sm:inline">{t('Add Student', 'طالب علم شامل کریں')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-urdu font-medium text-sm flex items-center space-x-2 space-x-reverse border-b-2 transition-colors ${
            activeTab === 'approved' 
              ? 'border-emerald-600 text-emerald-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('approved')}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{t('Approved Students', 'منظور شدہ طلباء')}</span>
        </button>
        {isAdmin && (
          <button
            className={`px-4 py-2 font-urdu font-medium text-sm flex items-center space-x-2 space-x-reverse border-b-2 transition-colors ${
              activeTab === 'pending' 
                ? 'border-emerald-600 text-emerald-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            <Clock className="w-4 h-4" />
            <span>{t('Pending Admissions', 'زیر التواء داخلے')}</span>
            {students.filter(s => s.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">
                {students.filter(s => s.status === 'pending').length}
              </span>
            )}
          </button>
        )}
      </div>

      <div className="overflow-x-auto shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr className="font-urdu text-gray-700 text-right">
              {activeTab === 'approved' && <th scope="col" className="px-4 py-3 text-sm font-semibold">ID</th>}
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Name', 'نام')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Father Name', 'والد کا نام')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold">{t('Mobile', 'موبائل')}</th>
              <th scope="col" className="px-4 py-3 text-sm font-semibold text-center">{t('Actions', 'اقدامات')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 font-urdu">
                {activeTab === 'approved' && <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 font-sans">{s.studentId}</td>}
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{s.nameUrdu || s.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{s.fatherName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500" dir="ltr">{s.mobileNumber}</td>
                <td className="relative whitespace-nowrap px-4 py-3 text-sm text-center">
                  <div className="flex justify-center space-x-3 space-x-reverse">
                    {activeTab === 'pending' && isAdmin && (
                      <button onClick={() => handleApprove(s)} className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded">
                        {t('Approve', 'منظور کریں')}
                      </button>
                    )}
                    <button onClick={() => openEditModal(s)} className="text-blue-600 hover:text-blue-900"><Edit className="w-5 h-5" /></button>
                    {isAdmin && (
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-urdu">
                  {t('No students found.', 'کوئی طالب علم نہیں ملا۔')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-emerald-50 rounded-t-xl">
              <h3 className="text-xl font-bold font-urdu text-emerald-900">
                {editStudent ? t('Edit Student', 'طالب علم میں ترمیم کریں') : t('Add Student', 'طالب علم شامل کریں')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-sans text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                   <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Status', 'سٹیٹس')}</label>
                   <select 
                     className="w-full border rounded-lg px-3 py-2 font-urdu" 
                     value={formData.status} 
                     onChange={e => setFormData({...formData, status: e.target.value})}
                   >
                     <option value="approved">{t('Approved', 'منظور شدہ')}</option>
                     <option value="pending">{t('Pending', 'زیر التواء')}</option>
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Name (Urdu)', 'نام (اردو)')}</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right" value={formData.nameUrdu} onChange={e => setFormData({...formData, nameUrdu: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Name (English)', 'نام (انگریزی)')}</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 font-sans text-left" dir="ltr" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Father Name', 'والد کا نام')}</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Caste', 'قوم')}</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right" value={formData.caste} onChange={e => setFormData({...formData, caste: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Age', 'عمر')}</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 font-sans" dir="ltr" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Mobile Number', 'موبائل نمبر')}</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 font-sans" dir="ltr" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Address', 'پتہ')}</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 font-urdu text-right" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Email (Gmail)', 'ای میل (جی میل)')}</label>
                  <input type="email" className="w-full border rounded-lg px-3 py-2 font-sans text-left" dir="ltr" value={formData.gmail} onChange={e => setFormData({...formData, gmail: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Admission Date', 'تاریخ داخلہ')}</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 font-sans" dir="ltr" value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} />
                </div>
                {!editStudent && (
                  <div>
                    <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Login Password', 'لاگ ان پاس ورڈ')}</label>
                    <input type="text" placeholder={t('Assign a initial password', 'ابتدائی پاس ورڈ تفویض کریں')} className="w-full border rounded-lg px-3 py-2 font-sans" dir="ltr" minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
                    <p className="text-xs text-gray-500 mt-1 font-urdu">{t('If email is provided, filling this will create a login account for the student.', 'اگر ای میل فراہم کی گئی ہے، تو اسے پُر کرنے سے طالب علم کا لاگ ان اکاؤنٹ بن جائے گا۔')}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-urdu">{t('Cancel', 'منسوخ کریں')}</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-urdu disabled:opacity-70">{loading ? t('Saving...', 'محفوظ کر رہا ہے...') : t('Save', 'محفوظ کریں')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
