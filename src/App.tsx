import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TerminalsPage } from './pages/TerminalsPage';
import { LogsPage } from './pages/LogsPage';
import { FilesPage } from './pages/FilesPage';
import { ActionsPage } from './pages/ActionsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { UsersPage } from './pages/UsersPage';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
      gcTime: 300000, // 5 minutes
    },
  },
});

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/terminals" element={<TerminalsPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/files" element={<FilesPage />} />
              <Route path="/actions" element={<ActionsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/settings" element={<UsersPage />} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}