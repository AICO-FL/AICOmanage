import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { adminApi } from '../utils/api';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      try {
        if (isAuthenticated) {
          await adminApi.post('/auth/validate');
        }
      } catch (error) {
        console.error('Token validation failed:', error);
      }
    };

    validateToken();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}