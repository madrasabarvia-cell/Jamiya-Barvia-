/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import WelcomePage from './pages/WelcomePage';
import FaizanNazarPage from './pages/FaizanNazarPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import AdmissionForm from './pages/auth/AdmissionForm';
import Layout from './components/Layout';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: 'admin' | 'student' | 'teacher' | 'staff' }) {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div></div>;
  }

  if (!user || !userData) {
    return <Navigate to="/login" replace />;
  }

  // Admin has access to teacher routes
  const hasAccess = 
    userData.role === role || 
    (role === 'teacher' && userData.role === 'admin');

  if (!hasAccess) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}

function AccessDenied() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">⚠️</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('Access Denied', 'رسائی سے انکار')}</h1>
      <p className="text-gray-600 font-urdu mb-6 max-w-md">
        {t('You do not have permission to view this page. If you believe this is an error, please contact administration.', 'آپ کو اس صفحہ کو دیکھنے کی اجازت نہیں ہے۔ اگر آپ کو لگتا ہے کہ یہ ایک خرابی ہے تو براہ کرم انتظامیہ سے رابطہ کریں۔')}
      </p>
      <Link to="/" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-urdu transition">
        {t('Go Home', 'ہوم پر جائیں')}
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/faizan-nazar" element={<FaizanNazarPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admission" element={<AdmissionForm />} />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teacher/*" 
                element={
                  <ProtectedRoute role="teacher">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/*" 
                element={
                  <ProtectedRoute role="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
