import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  || (import.meta.env.MODE === 'development' ? 'http://localhost:8080' : 'https://bwms-production.up.railway.app/');

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not configured!");
}

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import StockManagement from './pages/StockManagement';
import Report from './pages/Reports';
import History from './pages/History';

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
  const [error, setError] = useState(''); // For login error message

  useEffect(() => {
    if (!API_BASE_URL) {
      setInitialLoading(false);
      console.error("API_BASE_URL not configured, cannot check session.");
      return; 
    }

    const checkSession = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user`, { withCredentials: true });
        if (res.data && res.data.user && res.data.token) {
          setIsAuthenticated(true);
          setUser(res.data.user);
          if (res.data.token) {
            localStorage.setItem('token', res.data.token); 
            setIsAuthenticated(true);
            setUser(res.data.user); 
          }
        
        } else {
          setError("Login response error: User data or token missing.");
          setIsAuthenticated(false);
          setUser(null);
          console.error("Login failed, missing user or token:", res.data);
        }
      } catch (err) {
        if (err.response && err.response.status !== 401) {
          console.error('Session check failed unexpectedly:', err.response?.data?.error || err.message);
        } else {
          console.log('Session check: Not authenticated (401)');
        }
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
    
    if (!API_BASE_URL) {
      setError("Application configuration error: API URL not set.");
      setLoading(false);
      console.error("API_BASE_URL not configured, cannot login.");
      return;
    }
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, { email, password }, { withCredentials: true });
      
      console.log("Login Response:", res.data); 
  localStorage.setItem('token', res.data.token);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setIsAuthenticated(true);
        setUser(res.data.user); 
      } else {
        setError("Login response error: User data not received.");
        setIsAuthenticated(false);
        setUser(null);
        console.error("Login response tidak berisi token atau data user:", res.data);
      }
    } catch (err) {
      console.error('Login request error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || 'An unexpected login error occurred';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };  

  const handleLogout = async () => {
    if (!API_BASE_URL) {
      console.error("API_BASE_URL not configured, cannot logout.");
      setIsAuthenticated(false);
      setUser(null);
      return; 
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err.response?.data || err.message);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div>Checking session...</div>;
  }

  if (!API_BASE_URL) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        Application Configuration Error: API Base URL is not set.
        Please check environment variables on Vercel or your local `.env` file.
      </div>
    );
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
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} user={user}>
              </Layout>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard user={user} />} />
          <Route path="dashboard" element={<Dashboard user={user} />} />
          <Route path="profile" element={<Profile user={user} />} />
          <Route path="stock-management" element={<StockManagement user={user} />} />
          <Route path="reports" element={<Report user={user} />} />
          <Route path="history" element={<History user={user} />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
