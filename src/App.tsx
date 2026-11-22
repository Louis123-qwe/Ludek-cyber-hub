import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { ToastProvider } from './components/ui/ToastContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoadingState } from './components/ui/DesignSystem';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';

const LessonPage = lazy(() => import('./pages/LessonPage').then((m) => ({ default: m.LessonPage })));
const CodeLabPage = lazy(() => import('./pages/CodeLabPage').then((m) => ({ default: m.CodeLabPage })));
const VisualizersPage = lazy(() => import('./pages/VisualizersPage').then((m) => ({ default: m.VisualizersPage })));
const ProjectWorkspacePage = lazy(() =>
  import('./pages/ProjectWorkspacePage').then((m) => ({ default: m.ProjectWorkspacePage }))
);
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090B10]">
      <LoadingState label="Loading workspace..." />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Entry & Exploration */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/curriculum" element={<CurriculumPage />} />
                  <Route path="/learn/:lessonId" element={<LessonPage />} />
                  <Route path="/lab" element={<CodeLabPage />} />
                  <Route path="/visualizers" element={<VisualizersPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:projectId" element={<ProjectWorkspacePage />} />
                  <Route path="/assessments/:quizId" element={<AssessmentPage />} />
                  <Route path="/search" element={<SearchPage />} />

                  {/* Learner Authenticated Views (also gracefully reachable in Local Dev Mode) */}
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Role-Based Admin Studio */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
