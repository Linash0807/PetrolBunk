import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Login } from './../auth/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (path: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onNavigate }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login onNavigate={onNavigate} />;
  }

  return <>{children}</>;
};
