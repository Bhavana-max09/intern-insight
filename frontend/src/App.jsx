import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SkillMatcher from './pages/SkillMatcher';
import Compare from './pages/Compare';
import Tracker from './pages/Tracker';
import Roadmap from './pages/Roadmap';
import Login from './pages/Login';
import Register from './pages/Register';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="text-4xl mb-4">🎯</div>
        <p className="text-gray-500">Loading InternInsight...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Navbar />
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/match" element={
            <PrivateRoute>
              <Navbar />
              <SkillMatcher />
            </PrivateRoute>
          } />
          <Route path="/compare" element={
            <PrivateRoute>
              <Navbar />
              <Compare />
            </PrivateRoute>
          } />
          <Route path="/tracker" element={
            <PrivateRoute>
              <Navbar />
              <Tracker />
            </PrivateRoute>
          } />
          <Route path="/roadmap" element={
            <PrivateRoute>
              <Navbar />
              <Roadmap />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}