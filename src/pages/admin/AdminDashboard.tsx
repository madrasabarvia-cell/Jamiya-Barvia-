import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, ClipboardList, BookOpen, HandCoins, MinusCircle, FileBarChart, LayoutDashboard, Bell, Video } from 'lucide-react';
import DashboardHome from './DashboardHome';
import ManageStudents from './ManageStudents';
import ManageAttendance from './ManageAttendance';
import ManageReports from './ManageReports';
import ManageIncome from './ManageIncome';
import ManageExpenses from './ManageExpenses';
import ReportsDashboard from './ReportsDashboard';
import AdminNotifications from './AdminNotifications';
import ManageVideos from './ManageVideos';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const location = useLocation();
  const { isAdmin, isTeacher } = useAuth();
  
  const basePath = isTeacher && !isAdmin ? '/teacher' : '/admin';

  const adminNavigation = [
    { name: t('Dashboard', 'ڈیش بورڈ'), href: basePath, icon: LayoutDashboard, exact: true },
    { name: t('Notifications', 'نوٹیفکیشنز'), href: `${basePath}/notifications`, icon: Bell, exact: false },
    { name: t('Students', 'طلباء'), href: `${basePath}/students`, icon: Users, exact: false },
    { name: t('Attendance', 'حاضری'), href: `${basePath}/attendance`, icon: ClipboardList, exact: false },
    { name: t('Daily Reports', 'روزانہ رپورٹ'), href: `${basePath}/daily-reports`, icon: BookOpen, exact: false },
    { name: t('Educational Videos', 'تعلیمی ویڈیوز'), href: `${basePath}/videos`, icon: Video, exact: false },
    { name: t('Income', 'آمدنی'), href: `${basePath}/income`, icon: HandCoins, exact: false },
    { name: t('Expenses', 'اخراجات'), href: `${basePath}/expenses`, icon: MinusCircle, exact: false },
    { name: t('Exports & Analytics', 'رپورٹس اور تجزیہ'), href: `${basePath}/reports`, icon: FileBarChart, exact: false },
  ];

  const teacherNavigation = [
    { name: t('Dashboard', 'ڈیش بورڈ'), href: basePath, icon: LayoutDashboard, exact: true },
    { name: t('Notifications', 'نوٹیفکیشنز'), href: `${basePath}/notifications`, icon: Bell, exact: false },
    { name: t('Students', 'طلباء'), href: `${basePath}/students`, icon: Users, exact: false },
    { name: t('Attendance', 'حاضری'), href: `${basePath}/attendance`, icon: ClipboardList, exact: false },
    { name: t('Daily Reports', 'روزانہ رپورٹ'), href: `${basePath}/daily-reports`, icon: BookOpen, exact: false },
  ];

  const navigation = isAdmin ? adminNavigation : teacherNavigation;

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-12rem)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 bg-white rounded-xl shadow-sm border border-emerald-100 p-4 h-fit">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.href 
              : location.pathname.startsWith(item.href);
              
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors font-urdu font-medium ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-emerald-100 p-6 overflow-x-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/notifications/*" element={<AdminNotifications />} />
          <Route path="/students/*" element={<ManageStudents />} />
          <Route path="/attendance/*" element={<ManageAttendance />} />
          <Route path="/daily-reports/*" element={<ManageReports />} />
          <Route path="/videos/*" element={<ManageVideos />} />
          {isAdmin && (
            <>
              <Route path="/income/*" element={<ManageIncome />} />
              <Route path="/expenses/*" element={<ManageExpenses />} />
              <Route path="/reports/*" element={<ReportsDashboard />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}
