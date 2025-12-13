import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Dashboard/Overview';
import Clients from './pages/Dashboard/Clients';
import Projects from './pages/Dashboard/Projects';
import Goals from './pages/Dashboard/Goals';
import Finances from './pages/Dashboard/Financials';
import Team from './pages/Dashboard/Team';
import Tasks from './pages/Dashboard/Tasks';
import Meetings from './pages/Dashboard/Meetings';
import Settings from './pages/Dashboard/Settings';
import AuditLogs from './pages/Dashboard/AuditLogs';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="clients" element={<Clients />} />
            <Route path="projects" element={<Projects />} />
            <Route path="goals" element={<Goals />} />
            <Route path="finances" element={<Finances />} />
            <Route path="team" element={<Team />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
