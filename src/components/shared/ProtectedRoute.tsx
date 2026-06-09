import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

// block access to certain page if not logged in
const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) => {
  const { currentUser, isAuthenticated } = useAuth();

  // redirect to signin if authentication fail
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  // Redirect to their own dashboard if wrong role
  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to={currentUser?.role === 'hirer' ? '/hirer' : '/vendor'} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;