/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// Student Portal
import { StudentLayout } from './components/Layout/StudentLayout';
import { Dashboard as StudentDashboard } from './pages/student/Dashboard';
import { QuizPage } from './pages/student/QuizPage';
import { QuizResult } from './pages/student/QuizResult';
import { Certifications } from './pages/student/Certifications';
import { Profile } from './pages/student/Profile';

// Admin Portal
import { AdminLayout } from './components/Layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminActivity } from './pages/admin/AdminActivity';
import { AdminSecurity } from './pages/admin/AdminSecurity';
import { AdminQuizzes } from './pages/admin/AdminQuizzes';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/Settings';

// Auth
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/app/login" element={<Login />} />
        <Route path="/app/register" element={<Register />} />
        <Route path="/app/verify-email" element={<VerifyEmail />} />
        <Route path="/app/forgot-password" element={<ForgotPassword />} />
        <Route path="/app/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<Login isAdmin />} />

        {/* Student Portal */}
        <Route
          path="/app"
          element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="quizzes" element={<StudentDashboard />} />
          <Route path="quiz/:id" element={<QuizPage />} />
          <Route path="quiz/:id/result" element={<QuizResult />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="security" element={<AdminSecurity />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/app/login" replace />} />
        <Route path="*" element={<Navigate to="/app/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

