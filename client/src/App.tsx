import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ReloadPrompt from './components/ReloadPrompt';

// Eagerly loaded (critical path)
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import WorkoutPage from './features/workouts/pages/WorkoutPage';

// Lazy loaded (code splitting)
const ProgressPage = lazy(() => import('./features/progress/pages/ProgressPage'));
const StatsPage = lazy(() => import('./features/stats/pages/StatsPage'));
const ProfilePage = lazy(() => import('./features/auth/pages/ProfilePage'));
const AIPage = lazy(() => import('./features/ai/pages/AIPage'));
const WorkoutsHistoryPage = lazy(() => import('./features/workouts/pages/WorkoutsHistoryPage'));
const RoutinesPage = lazy(() => import('./features/routines/pages/RoutinesPage'));
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage'));
const NotificationsPage = lazy(() => import('./features/notifications/pages/NotificationsPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/workout" element={<ProtectedRoute><WorkoutPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><WorkoutsHistoryPage /></ProtectedRoute>} />
        <Route path="/routines" element={<ProtectedRoute><RoutinesPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <ReloadPrompt />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
