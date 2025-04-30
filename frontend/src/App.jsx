import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// --- Theme Setup ---
// Import createTheme and your theme options
import { ThemeProvider, createTheme, Box, CircularProgress, Typography } from '@mui/material';
import themeOptions from './theme'; // Ensure this path is correct

// Create the theme instance outside the component
const appTheme = createTheme(themeOptions);

// --- Define API Base URL ---
// Centralize API URL determination
const determineApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiUrl) {
     // Log a fatal error if the variable is not set in ANY environment
     // This relies on the App component's state to display an error UI
     console.error("FATAL ERROR: VITE_API_BASE_URL environment variable is not set!");
  } else {
     // Log the URL being used (helpful for debugging in dev)
     console.log("Using API_BASE_URL:", apiUrl);
  }

  // Return the value (will be null if not set)
  return apiUrl;
};

// Call the function immediately to get the API base URL
const API_BASE_URL = determineApiBaseUrl();


// --- Pages ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import StockManagement from './pages/StockManagement';
import Report from './pages/Reports'; // Assuming component name is Report, file is Reports.jsx
import History from './pages/History';

// --- Components ---
import Layout from './components/Layout'; // Assuming Layout is within components folder


// --- Helper for conditional logging (optional) ---
const log = import.meta.env.MODE !== 'production' ? console.log : () => {};
const errorLog = import.meta.env.MODE !== 'production' ? console.error : () => {};


// --- Protected Route Component ---
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    // Use Navigate for redirection
    return <Navigate to="/login" replace />;
  }
  return children;
};


// --- App Component ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for login/logout actions
  const [initialLoading, setInitialLoading] = useState(true); // Loading state for initial session check
  const [loginError, setLoginError] = useState(''); // Renamed 'error' to 'loginError' for clarity
  const [configError, setConfigError] = useState(''); // For API config error


  // --- Effect Hook for Initial Session Check ---
  useEffect(() => {
    if (!API_BASE_URL) {
        // This case should ideally not be hit due to determineApiBaseUrl,
        // but acts as a final safeguard.
        setConfigError("API Base URL is not configured!");
        setInitialLoading(false);
        return;
    }

    const checkSession = async () => {
      const token = localStorage.getItem('token'); // Get token from localStorage

      if (!token) {
        log('Session check: No token found in localStorage.');
        setIsAuthenticated(false);
        setUser(null);
        setInitialLoading(false);
        return; // Stop if no token exists
      }

      try {
        // Ensure Authorization header is included for authenticated endpoints
        const res = await axios.get(`${API_BASE_URL}/api/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.data && res.data.user) {
          setIsAuthenticated(true);
          setUser(res.data.user);
          log('Session check successful.');
        } else {
          // Should theoretically not happen if 200 OK, but good safety check
          errorLog('Session check failed: User data missing in response.', res.data);
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('token'); // Clear token if response is odd
        }
      } catch (err) {
        errorLog('Session check failed:', err.response?.data?.error || err.message);
        // Handle specific authentication errors (e.g., token expired/invalid)
        if (err.response?.status === 401 || err.response?.status === 403) {
             log('Session check: Authentication failed (401/403).');
             localStorage.removeItem('token'); // Clear invalid token
        } else {
             errorLog('Session check failed unexpectedly:', err);
        }
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setInitialLoading(false);
      }
    };

    checkSession();

    // Empty dependency array means this effect runs only once on mount
  }, []);

  // --- Login Handler ---
  const handleLogin = async (email, password) => {
    setLoading(true);
    setLoginError(''); // Clear previous login errors

    if (configError) { // Prevent login if there's a config error
        setLoading(false);
        errorLog("Config error prevents login.");
        return;
    }

    try {
      // Send login credentials
      const res = await axios.post(`${API_BASE_URL}/api/login`, { email, password });

      log("Login Response:", res.data);

      if (res.data && res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token); // Store token
        setIsAuthenticated(true);
        setUser(res.data.user);
        log('Login successful, token and user data received.');
      } else {
        // Handle cases where the API login call succeeded (200 OK) but response data is missing
        const message = "Login failed: Invalid response from server.";
        errorLog(message, res.data);
        setLoginError(message); // Set the error message for the Login component
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token'); // Ensure token is not stored if data is missing
      }

    } catch (err) {
      // Handle API request errors (e.g., network issues, 401, 404, 500)
      errorLog('Login request error:', err.response?.data || err.message);
      const apiErrorMessage = err.response?.data?.error || 'An unexpected login error occurred';
      // Map specific API errors to user-friendly messages if needed
      // e.g., if (err.response?.status === 401) apiErrorMessage = "Invalid credentials";
      setLoginError(apiErrorMessage); // Set the error message for the Login component
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token'); // Ensure any old token is removed on login failure
    } finally {
      setLoading(false);
    }
  };

  // --- Logout Handler ---
  const handleLogout = async () => {
    // Note: Making a backend logout call is optional if client-side token removal is sufficient
    // for stateless JWTs. If using session cookies or server-side token invalidation, keep the call.
    // Assuming a backend logout endpoint that might clear server-side session/refresh tokens.

    // --- Client-side cleanup (do this first for responsiveness) ---
    localStorage.removeItem('token'); // Crucially remove the token
    setIsAuthenticated(false);
    setUser(null);
    setLoading(true); // Set loading for the logout process (optional, but good for UI)
    log('Client-side logout initiated.');


    if (configError) {
        errorLog("Config error, skipping logout API call.");
        setLoading(false); // End loading if no API call is made
    } else {
        try {
           // No need for Authorization header here typically, as it's logging out
           // If backend requires token even for logout, add headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          await axios.post(`${API_BASE_URL}/api/logout`, {});
           log('Logout API call successful.');
        } catch (err) {
          errorLog('Logout API call error:', err.response?.data || err.message);
          // Decide if you show an error or just proceed with client-side logout
          // We've already done client-side cleanup, just log the API error.
       } finally {
           setLoading(false); // End loading after API call attempt
       }
    }
  };

  // --- Render Initial Loading State ---
  if (initialLoading) {
    return (
      // Wrap the loading screen with ThemeProvider
      // This is important if App is the root and not wrapped elsewhere
      <ThemeProvider theme={appTheme}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: appTheme.palette.background.default, // Use theme background
            color: appTheme.palette.text.primary, // Use theme text color
          }}
        >
          <CircularProgress sx={{ mb: 2 }} /> {/* Use theme spacing */}
          <Typography variant="h6">Checking session...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // --- Render Configuration Error State ---
  if (configError) {
    return (
       // Wrap the error screen with ThemeProvider
       // This is important if App is the root and not wrapped elsewhere
       <ThemeProvider theme={appTheme}>
         <Box
           sx={{
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             justifyContent: 'center',
             minHeight: '100vh',
             bgcolor: appTheme.palette.background.default, // Use theme background
             color: appTheme.palette.error.main, // Use theme error color
             p: appTheme.spacing(3), // Use theme spacing
             textAlign: 'center',
           }}
         >
           <Typography variant="h5" gutterBottom>
             Application Configuration Error
           </Typography>
           <Typography variant="body1">
             {configError}
           </Typography>
           <Typography variant="body2" sx={{ mt: appTheme.spacing(2), color: appTheme.palette.text.secondary }}> {/* Use theme spacing and color */}
              Please ensure your API Base URL is correctly set in your environment variables.
           </Typography>
         </Box>
       </ThemeProvider>
    );
  }

  // --- Main Application Render ---
  return (
    // Recommended: Wrap your entire App component with ThemeProvider in your entry file (main.jsx/index.jsx)
    // If you cannot do that, uncomment the <ThemeProvider theme={appTheme}> wrapper below.
    // <ThemeProvider theme={appTheme}>
      <Router>
        <Routes>
          {/* Login Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                /* Pass login error and loading state to Login component */
                <Login onLogin={handleLogin} error={loginError} loading={loading} /> /* Pass loginError */
              )
            }
          />

          {/* Protected Routes */}
          {/* The / route renders the Layout, and child routes render inside Layout's Outlet */}
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {/* Pass user and logout handler to Layout */}
                <Layout onLogout={handleLogout} user={user}>
                  {/* Children routes will be rendered in Layout's Outlet */}
                </Layout>
              </ProtectedRoute>
            }
          >
            {/* Nested Protected Routes */}
            {/* 'index' route makes / render Dashboard when the parent route is matched */}
            <Route index element={<Dashboard user={user} />} />
            {/* Kept redundant path="dashboard" route as a common pattern */}
            <Route path="dashboard" element={<Dashboard user={user} />} />
            <Route path="profile" element={<Profile user={user} />} />
            <Route path="stock-management" element={<StockManagement user={user} />} />
            <Route path="reports" element={<Report user={user} />} /> {/* Use Report component name */}
            <Route path="history" element={<History user={user} />} />
          </Route>

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    // </ThemeProvider> // Close ThemeProvider if uncommented above
  );
}

export default App;