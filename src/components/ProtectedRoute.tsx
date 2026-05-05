import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'student';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    const isTryingAdmin = location.pathname.startsWith('/admin');
    const loginPath = isTryingAdmin ? '/admin/login' : '/app/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Cross-portal prevention
  if (user?.role === 'student' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (user?.role === 'admin' && location.pathname.startsWith('/app')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Specific role check
  if (role && user?.role !== role) {
    const target = user?.role === 'admin' ? '/admin/dashboard' : '/app/dashboard';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};
