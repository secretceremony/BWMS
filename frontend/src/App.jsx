import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Protected Route component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // { id, email, username, role }
  const [loading, setLoading] = useState(false); // for login/logout only
  const [initialLoading, setInitialLoading] = useState(true); // for session check
  const [error, setError] = useState('');

  // Check existing user session when app loads
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/user', { withCredentials: true });
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

  // Handle login
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8080/api/login', { email, password }, { withCredentials: true });

      if (res.data.message === "Login successful" && res.data.user) {
        setIsAuthenticated(true);
        setUser(res.data.user);
      } else {
        setError("Login successful but user data not received.");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Login error', err.response?.data);
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen only during initial session check
  if (initialLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
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

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;