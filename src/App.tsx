/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

  // Admin has access to teacher routes
  const hasAccess = user && userData && (
    userData.role === role || 
    (role === 'teacher' && userData.role === 'admin')
  );

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
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
