import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const ExperimentLab = lazy(() => import('./pages/student/ExperimentLab'));
const ARViewer = lazy(() => import('./pages/student/ARViewer'));
const StudentProgress = lazy(() => import('./pages/student/StudentProgress'));

const EducatorDashboard = lazy(() => import('./pages/educator/EducatorDashboard'));
const ClassAnalytics = lazy(() => import('./pages/educator/ClassAnalytics'));
const StudentDetail = lazy(() => import('./pages/educator/StudentDetail'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const ExperimentManager = lazy(() => import('./pages/admin/ExperimentManager'));

const LandingPage = lazy(() => import('./pages/LandingPage'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/experiments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ExperimentLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/experiments/:id/ar"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ARViewer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/progress"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProgress />
                </ProtectedRoute>
              }
            />

            {/* Educator Routes */}
            <Route
              path="/educator"
              element={
                <ProtectedRoute allowedRoles={['educator']}>
                  <EducatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/educator/class/:classGroup"
              element={
                <ProtectedRoute allowedRoles={['educator']}>
                  <ClassAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/educator/student/:studentId"
              element={
                <ProtectedRoute allowedRoles={['educator', 'admin']}>
                  <StudentDetail />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/experiments"
              element={
                <ProtectedRoute allowedRoles={['admin', 'educator']}>
                  <ExperimentManager />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
