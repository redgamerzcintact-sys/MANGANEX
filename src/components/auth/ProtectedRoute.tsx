import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole, ROLE_DEFAULT_ROUTES } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission
}) => {
  const { isAuthenticated, user, hasPermission } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin always has access to all routes
  if (user.role === 'ROLE_ADMIN') {
    return children;
  }

  // Role verification
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      const fallbackRoute = ROLE_DEFAULT_ROUTES[user.role] || '/dashboard';
      return <Navigate to={fallbackRoute} replace />;
    }
  }

  // Permission verification
  if (requiredPermission && !hasPermission(requiredPermission)) {
    const fallbackRoute = ROLE_DEFAULT_ROUTES[user.role] || '/dashboard';
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
};

