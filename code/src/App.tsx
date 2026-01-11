import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthActionsProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GamificationProvider } from './contexts/GamificationContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ViewerDashboard from './pages/dashboards/ViewerDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import FacultyDashboard from './pages/dashboards/FacultyDashboard';
import ProjectDetails from './pages/projects/ProjectDetails';
import StudentProjects from './pages/projects/StudentProjects';
import NewProject from './components/projects/NewProject';
import EditProject from './components/projects/EditProject';
import AuthLayout from './components/layouts/AuthLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import NotFound from './pages/NotFound';
import { UserRole } from './types';
import StudentFeedback from './pages/dashboards/StudentFeedback';
import Header from './components/layouts/Header';
import AdminDashboard from './pages/admin/AdminDashboard';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import AchievementPanel from './components/gamification/AchievementPanel';
import AdvancedSearch from './components/search/AdvancedSearch';
import NotificationCenter from './components/notifications/NotificationCenter';
import ThemeToggle from './components/ui/ThemeToggle';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

const FacultyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'faculty') {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  const getDashboardRouteForRole = (role: UserRole) => {
    switch (role) {
      case 'admin': return '/dashboard/admin';
      case 'viewer': return '/dashboard/viewer';
      case 'student': return '/dashboard/student';
      case 'faculty': return '/dashboard/faculty';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-white transition-colors">
      <Header />
      <main className="w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route element={<AuthLayout />}>
            <Route path="/login" element={
              user ? <Navigate to={getDashboardRouteForRole(user.role as UserRole)} replace /> : <LoginPage />
            } />
            <Route path="/register" element={
              user ? <Navigate to={getDashboardRouteForRole(user.role as UserRole)} replace /> : <RegisterPage />
            } />
          </Route>
          
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/viewer" element={
              <ProtectedRoute>
                <ViewerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/student" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/student/projects" element={
              <ProtectedRoute>
                <StudentProjects />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/student/projects/new" element={
              <ProtectedRoute>
                <NewProject />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/student/feedback" element={
              <ProtectedRoute>
                <StudentFeedback />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/faculty" element={
              <FacultyRoute>
                <FacultyDashboard />
              </FacultyRoute>
            } />
            <Route path="/dashboard/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/dashboard/analytics" element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/achievements" element={
              <ProtectedRoute>
                <AchievementPanel />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <AdvancedSearch />
              </ProtectedRoute>
            } />
           
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            } />
            <Route path="/projects/:id/edit" element={
              <ProtectedRoute>
                <EditProject />
              </ProtectedRoute>
            } />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* Global Components */}
      <NotificationCenter />
      <ThemeToggle />
    </div>
  );
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <AuthActionsProvider>
                <ProjectProvider>
                  <NotificationProvider>
                    <GamificationProvider>
                      <AppContent />
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          style: {
                            background: '#363636',
                            color: '#fff',
                          },
                          success: {
                            duration: 3000,
                            iconTheme: {
                              primary: '#4ade80',
                              secondary: '#fff',
                            },
                          },
                          error: {
                            duration: 5000,
                            iconTheme: {
                              primary: '#ef4444',
                              secondary: '#fff',
                            },
                          },
                        }}
                      />
                    </GamificationProvider>
                  </NotificationProvider>
                </ProjectProvider>
              </AuthActionsProvider>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;