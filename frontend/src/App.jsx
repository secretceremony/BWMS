import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Use an environment variable for the API base URL
// This variable will be set via your .env file locally and Vercel settings publicly
// For Vite:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// For Create React App:
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Optional: Add a check/fallback or error display if the variable isn't set
if (!API_BASE_URL) {
  console.error("Frontend Error: API_BASE_URL environment variable is not set!");
  // You might want to add a visible error message in the UI,
  // or ensure your build process fails if it's missing in production.
}


// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile'; // Assuming Profile also uses API_BASE_URL correctly now
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
    // Check if API_BASE_URL is available before attempting to fetch
    if (!API_BASE_URL) {
         setInitialLoading(false);
         // Handle the configuration error, maybe set a state to show an error message
         console.error("API_BASE_URL not configured, cannot check session.");
         return; // Exit useEffect if URL is missing
    }

    const checkSession = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user`, { withCredentials: true });
        if (res.data.user) {
          setIsAuthenticated(true);
          setUser(res.data.user);
        } else {
          // Should theoretically not happen if 200 is returned, but good practice
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        // A 401 is expected here if not authenticated, others indicate an issue
        if (err.response && err.response.status !== 401) {
            console.error('Session check failed unexpectedly:', err.response?.data?.error || err.message);
            // Optionally set a persistent app-level error state for unexpected errors
        } else {
             // 401 is normal for unauthenticated, no console error needed unless debugging
             console.log('Session check: Not authenticated (401)');
        }
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setInitialLoading(false);
      }
    };
    checkSession();
  }, []); // Empty dependency array means this runs once on mount

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(''); // Clear previous errors

     // Check if API_BASE_URL is available before attempting login
    if (!API_BASE_URL) {
       setError("Application configuration error: API URL not set.");
       setLoading(false);
       console.error("API_BASE_URL not configured, cannot login.");
       return; // Exit if URL is missing
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, { email, password }, { withCredentials: true });
      if (res.data.message === "Login successful" && res.data.user) {
        setIsAuthenticated(true);
        setUser(res.data.user);
         // Optionally redirect here if not using Navigate components
      } else {
        // This case indicates a successful request but unexpected response body
        setError("Login response error: User data not received.");
        setIsAuthenticated(false);
        setUser(null);
        console.error("Login successful but user data missing in response:", res.data);
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
     // Check if API_BASE_URL is available before attempting logout
    if (!API_BASE_URL) {
       console.error("API_BASE_URL not configured, cannot logout.");
        setIsAuthenticated(false); // Assume logged out on frontend anyway
        setUser(null);
       return; // Exit if URL is missing
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
       // No need to redirect here, Navigate handles it
    } catch (err) {
      console.error('Logout error:', err.response?.data || err.message);
       // Even if logout fails on backend, often best to clear frontend auth state
       setIsAuthenticated(false);
       setUser(null);
       // Optionally show a message that logout failed on the server
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    // You might want a better loading indicator
    return <div>Checking session...</div>;
  }

  // If API_BASE_URL is not configured even after initial loading, show error
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
        {/* Login Page - Redirects to /dashboard if authenticated */}
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

        {/* Protected Routes - Requires authentication */}
        {/* Using a parent Route with element={} for Layout simplifies things */}
         <Route
            path="/"
            element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Layout onLogout={handleLogout} user={user}> {/* Pass user to Layout if needed for sidebar/header */}
                         {/* Children will be rendered here */}
                    </Layout>
                </ProtectedRoute>
            }
        >
            {/* Define index route for '/' */}
             <Route index element={<Dashboard user={user} />} />
            <Route path="dashboard" element={<Dashboard user={user} />} />
            <Route path="profile" element={<Profile user={user} />} />
            <Route path="stock-management" element={<StockManagement user={user} />} />
            <Route path="reports" element={<Report user={user} />} />
            <Route path="history" element={<History user={user} />} />
        </Route>


        {/* Not Found Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;