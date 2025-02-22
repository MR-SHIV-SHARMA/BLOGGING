import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}; 