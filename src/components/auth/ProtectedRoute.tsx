import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isConfigured } from '@/firebase/config';
import { Brain } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Firebase not configured → dev mode, allow access with mock data
  if (!isConfigured) return <>{children}</>;

  // Auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Brain className="w-8 h-8 animate-pulse text-brand-500" />
          <p className="text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
