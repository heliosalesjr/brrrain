import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { Concepts } from '@/pages/Concepts';
import { Session } from '@/pages/Session';
import { Review } from '@/pages/Review';
import { History } from '@/pages/History';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

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
      { index: true,             element: <Dashboard /> },
      { path: 'concepts',        element: <Concepts /> },
      { path: 'history',         element: <History /> },
      { path: 'review',          element: <Review /> },
      { path: 'session/:id',     element: <Session /> },
      { path: 'areas',           element: <Navigate to="/concepts" replace /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
