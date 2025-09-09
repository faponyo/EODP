import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'internal' | 'external';
  requiredRoles?: ('admin' | 'internal' | 'external')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredRoles 
}) => {
  const { isAuthenticated, user, requiresPasswordReset } = useAuth();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // User needs password reset - redirect to password reset
  if (requiresPasswordReset) {
    return <Navigate to="/reset-password" replace />;
  }

  // Check role-based access
  if (requiredRole || requiredRoles) {
    const allowedRoles = requiredRoles || (requiredRole ? [requiredRole] : []);
    
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/no-access" replace />;
    }
  }

  // Check if user account is disabled
  if (user.status === 'disabled') {
    return <Navigate to="/account-disabled" replace />;
  }

  // Check if external user has assigned events
  if (user.role === 'external' && (!user.assignedEventIds || user.assignedEventIds.length === 0)) {
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;