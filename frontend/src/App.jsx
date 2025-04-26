import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import StockManagement from './pages/StockManagement';
import Report from './pages/Reports';
import History from './pages/History'; // ✅ Tambahkan import History

// Components
import Layout from './components/Layout';

// Protected Route
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get('https://bwms-production.up.railway.app/api/user', { withCredentials: true });
        if (res.data.user) {
          setIsAuthenticated(true);
          setUser(res.data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.log('Session check failed:', err.response?.data?.error || err.message);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setInitialLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('https://bwms-production.up.railway.app/api/login', { email, password }, { withCredentials: true });
      if (res.data.message === "Login successful" && res.data.user) {
        setIsAuthenticated(true);
        setUser(res.data.user);
      } else {
        setError("Login successful but user data not received.");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Login error:', err.response?.data);
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post('https://bwms-production.up.railway.app/api/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} error={error} loading={loading} />
            )
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout}>
                <Dashboard user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout}>
                <Dashboard user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout}>
                <Profile user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock-management"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout}>
                <StockManagement user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout}>
                <Report user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout}>
                <History user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Not Found Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
