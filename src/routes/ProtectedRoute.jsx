import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but wrong role, redirect to their proper dashboard
    const defaultDash = user.role === 'admin' ? '/admin/dashboard' : '/department/dashboard';
    return <Navigate to={defaultDash} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
