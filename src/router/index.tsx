import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { Areas } from '@/pages/Areas';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
    <p className="text-lg font-medium">{title}</p>
    <p className="text-sm mt-1">Em breve</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'session/:id', element: <ComingSoon title="Sessão de Estudo" /> },
      { path: 'review', element: <ComingSoon title="Revisão de Flashcards" /> },
      { path: 'areas', element: <Areas /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
