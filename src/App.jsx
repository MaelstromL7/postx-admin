import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import UsersPage from './pages/UsersPage';
import ActivityPage from './pages/ActivityPage';
import AILogsPage from './pages/AILogsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import TermsAcceptancesPage from './pages/TermsAcceptancesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-logs"
            element={
              <ProtectedRoute>
                <AILogsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <AnnouncementsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/terms-acceptances"
            element={
              <ProtectedRoute>
                <TermsAcceptancesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
