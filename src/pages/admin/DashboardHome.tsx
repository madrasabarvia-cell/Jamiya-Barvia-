import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Users, UserCheck, UserMinus, HandCoins, MinusCircle } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function DashboardHome() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  });

  useEffect(() => {
    async function loadStats() {
      // Very basic aggregate - in a real app would use aggregations or cache
      const studentsSnap = await getDocs(collection(db, 'students'));
      const totalStudents = studentsSnap.size;

      const today = format(new Date(), 'yyyy-MM-dd');
      const qAttend = query(collection(db, 'attendance'), where('date', '==', today));
      const attendSnap = await getDocs(qAttend);
      
      let present = 0;
      let absent = 0;
      attendSnap.forEach(doc => {
        if (doc.data().status === 'present') present++;
        if (doc.data().status === 'absent') absent++;
      });

      // Income and Expenses (all time for now, or you could filter month)
      const qIncome = await getDocs(collection(db, 'income'));
      let tInc = 0;
      qIncome.forEach(d => tInc += Number(d.data().amount || 0));

      const qExpense = await getDocs(collection(db, 'expenses'));
      let tExp = 0;
      qExpense.forEach(d => tExp += Number(d.data().amount || 0));

      setStats({
        totalStudents,
        presentToday: present,
        absentToday: absent,
        monthlyIncome: tInc,
        monthlyExpenses: tExp,
      });
    }
    loadStats();
  }, []);

  const financialData = [
    { name: t('Income', 'آمدنی'), value: stats.monthlyIncome },
    { name: t('Expense', 'اخراجات'), value: stats.monthlyExpenses },
  ];
  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div>
      <h2 className="text-2xl font-bold font-urdu text-emerald-900 mb-6 border-b pb-2">
        {t('Overview Dashboard', 'ڈیش بورڈ کا جائزہ')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center space-x-4 space-x-reverse">
          <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-urdu">{t('Total Students', 'کل طلباء')}</p>
            <p className="text-2xl font-bold text-emerald-900">{stats.totalStudents}</p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center space-x-4 space-x-reverse">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-urdu">{t('Present Today', 'آج حاضر')}</p>
            <p className="text-2xl font-bold text-blue-900">{stats.presentToday}</p>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center space-x-4 space-x-reverse">
          <div className="bg-red-100 p-3 rounded-lg text-red-600">
            <UserMinus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-urdu">{t('Absent Today', 'آج غیر حاضر')}</p>
            <p className="text-2xl font-bold text-red-900">{stats.absentToday}</p>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center space-x-4 space-x-reverse">
          <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
            <HandCoins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-urdu">{t('Balance', 'بیلنس')}</p>
            <p className="text-2xl font-bold text-amber-900 font-sans" dir="ltr">RS {stats.monthlyIncome - stats.monthlyExpenses}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold font-urdu text-center mb-4">{t('Financial Overview', 'مالیاتی جائزہ')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={financialData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {financialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `RS ${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
