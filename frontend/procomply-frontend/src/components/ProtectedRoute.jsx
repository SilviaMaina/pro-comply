import { Navigate } from 'react-router-dom';
import { useAuthstore } from '../context/useAuthstore';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthstore();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render children
  return children;
}