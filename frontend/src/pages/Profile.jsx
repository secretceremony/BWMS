import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Card, // Import Card
  CardContent, // Import CardContent
  Divider, // Import Divider for separation
  useTheme, // Import useTheme
  IconButton, // Import untuk tombol ikon
  Tabs,
  Tab,
  Stack
} from '@mui/material';
import { Save as SaveIcon, Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import EditProfileForm from '../components/EditProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import UserManagement from '../components/UserManagement';

// Base URL for your backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = ({ user: userProp }) => {
  const theme = useTheme(); // Use the theme hook

  // Use the userProp if provided, otherwise fetch from API
  const [user, setUser] = React.useState(userProp || null);
  const [editingUsername, setEditingUsername] = React.useState('');
  const [editingEmail, setEditingEmail] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
  
  // State untuk form ganti password
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [tab, setTab] = React.useState(0);

  // Function to fetch user data - Modified to include Authorization header
  const fetchUser = async () => {
    if (!API_BASE_URL) {
      setSnackbarMessage('Configuration error: API URL not set.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setUser(null); // Clear user state on config error
      return;
    }

    // --- ADDED: Retrieve Token for fetching user data ---
    const token = localStorage.getItem('token'); // Get the token from localStorage
    if (!token) {
      // If no token, user is not authenticated for this route
      console.warn("No token found for fetching user profile.");
      setUser(null); // Ensure user state is null if not authenticated
      // Optionally set a message or redirect to login
      setSnackbarMessage('Please login to view profile.');
      setSnackbarSeverity('info'); // Changed severity to info
      setSnackbarOpen(true);
      return; // Stop execution if no token
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}` // Include the token in the Authorization header
      },
      // withCredentials: true // Keep if needed for cookies alongside JWT, but often not necessary
    };
    // --- END ADDED ---


    try {
      // --- MODIFIED: Pass config to axios.get ---
      const response = await axios.get(`${API_BASE_URL}/api/user`, config);
      // --- END MODIFIED ---

      const fetchedUser = response.data.user;
      setUser(fetchedUser);
      setEditingUsername(fetchedUser.username || '');
      setEditingEmail(fetchedUser.email || '');
      // Snackbar success for fetch is usually not needed unless it's manual refresh
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      let errorMessage = 'Failed to fetch user data.';
      if (error.response) {
         if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = 'Authentication failed. Please login again.';
            localStorage.removeItem('token'); // Clear invalid/expired token
            // *** Redirect to login page here if you have one ***
            setUser(null); // Clear user state on auth failure
         } else if (error.response.data && error.response.data.error) {
            errorMessage = `Error fetching profile: ${error.response.data.error}`;
         }
      } else if (error.request) {
         errorMessage = 'Network error fetching user data.';
      }

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setUser(null); // Ensure user is null on any fetch error
    }
  };

  React.useEffect(() => {
    // If userProp is passed (e.g., from an outer authentication context), use it.
    // Otherwise, fetch the user data from the API.
    if (userProp) {
      setUser(userProp);
      setEditingUsername(userProp.username || '');
      setEditingEmail(userProp.email || '');
    } else {
      fetchUser();
    }
  }, [userProp]); // Depend on userProp

  // Function to handle profile update - Modified to include Authorization header
  const handleUpdateProfile = async () => {
    setIsSaving(true);

    if (!API_BASE_URL) {
      setSnackbarMessage('Configuration error: API URL not set.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsSaving(false);
      return;
    }

    const updatePayload = {
      username: editingUsername,
      email: editingEmail,
    };

    if (!updatePayload.username || !updatePayload.email) {
      setSnackbarMessage('Username and email are required.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      setIsSaving(false);
      return;
    }

    // --- IMPORTANT: Retrieve Token and include in Header ---
    const token = localStorage.getItem('token'); // Get the token from localStorage
    if (!token) {
       // Handle case where token is not found (user not logged in)
       setSnackbarMessage('Authentication token not found. Please login.');
       setSnackbarSeverity('error');
       setSnackbarOpen(true);
       setIsSaving(false);
       // *** Redirect the user to the login page here if you have one ***
       return; // Stop the update process
    }

    // Define the request configuration, including the Authorization header
    const config = {
        headers: {
            'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            // 'Content-Type': 'application/json' // axios often adds this automatically
        },
        // withCredentials: true // Keep if needed for cookies alongside JWT
    };
    // --- END OF IMPORTANT PART ---


    try {
      // --- MODIFIED: Pass updatePayload and config object to axios.put ---
      const response = await axios.put(`${API_BASE_URL}/api/profile/update`, updatePayload, config);
      // --- END MODIFIED ---

      setSnackbarMessage('Profile updated successfully!');
      setSnackbarSeverity('success');

      // Update the user state with the data returned from the backend
      if (response.data && response.data.user) {
          setUser(response.data.user);
          // No need to reset editing fields if you update from the response
          // setEditingUsername(response.data.user.username || '');
          // setEditingEmail(response.data.user.email || '');
      }

      // If the backend returns a new token upon profile update, update localStorage
      if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
      }


    } catch (error) {
       console.error("Profile update error:", error);
       let errorMessage = 'Error updating profile.';
       // --- BETTER ERROR HANDLING for API responses ---
       if (error.response) {
           if (error.response.status === 401) {
               errorMessage = 'Unauthorized. Please login again.';
               // *** Clear token and redirect to login page here ***
               localStorage.removeItem('token');
               setUser(null); // Clear user state on auth failure
           } else if (error.response.status === 403) {
               errorMessage = 'Forbidden. You do not have permission.';
           } else if (error.response.data && error.response.data.error) {
               // Display specific backend error message if available
               errorMessage = `Update failed: ${error.response.data.error}`;
           } else {
               errorMessage = `Server responded with status: ${error.response.status}`;
           }
       } else if (error.request) {
           // The request was made but no response was received
           errorMessage = 'Network Error: Could not connect to server.';
       } else {
           // Something happened in setting up the request that triggered an Error
           errorMessage = `Request setup error: ${error.message}`;
       }
       // --- END BETTER ERROR HANDLING ---

       setSnackbarMessage(errorMessage);
       setSnackbarSeverity('error');
    } finally {
       setSnackbarOpen(true);
       setIsSaving(false);
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    // Validasi input
    if (!currentPassword) {
      setSnackbarMessage('Password saat ini harus diisi.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    if (!newPassword) {
      setSnackbarMessage('Password baru harus diisi.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbarMessage('Password baru dan konfirmasi tidak sama.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setIsChangingPassword(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbarMessage('Authentication token not found. Please login.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsChangingPassword(false);
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/profile/change-password`,
        {
          currentPassword,
          newPassword
        },
        config
      );

      // Reset form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Show success message
      setSnackbarMessage('Password berhasil diubah!');
      setSnackbarSeverity('success');

      // If the backend returns a new token, update localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

    } catch (error) {
      console.error("Password change error:", error);
      let errorMessage = 'Error mengubah password.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Password saat ini tidak sesuai.';
        } else if (error.response.status === 403) {
          errorMessage = 'Forbidden. You do not have permission.';
          localStorage.removeItem('token');
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = `Server responded with status: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Network Error: Could not connect to server.';
      } else {
        errorMessage = `Request setup error: ${error.message}`;
      }

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setIsChangingPassword(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Render loading state if user is null and no userProp was provided
  if (!user && !userProp) {
    return (
      <Box sx={{ p: theme.spacing(3), textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Gagal mengambil data user. Silakan cek koneksi atau login ulang.
        </Typography>
        <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={() => window.location.reload()}>Coba Lagi</Button>
        <Button variant="outlined" color="secondary" onClick={() => window.location.href = '/login'}>Ke Login</Button>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Render profile form if user data is available
  if (!user) {
      // This case handles when user is null after fetch fails (e.g., 401)
      return (
          <Box sx={{ p: theme.spacing(3), textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Could not load profile. Please login.</Typography>
              {/* Keep Snackbar visible for error message */}
              <Snackbar
                  open={snackbarOpen}
                  autoHideDuration={6000}
                  onClose={handleSnackbarClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                  <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                      {snackbarMessage}
                  </Alert>
              </Snackbar>
          </Box>
      );
  }


  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}> {/* Responsive padding */}
      {/* Section 1: Profile Overview (Read-only) */}
      <Card elevation={3} sx={{ mb: { xs: 2, sm: 4 } }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Profile Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Tooltip title="User Avatar" arrow>
              <Avatar sx={{ width: 80, height: 80, fontSize: 28, mb: { xs: 2, sm: 0 } }}>
                {user.username ? user.username.split(' ').map(word => word[0]).join('').toUpperCase() : '?'}
              </Avatar>
            </Tooltip>
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Username:</strong> {user.username || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {user.email || 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Role:</strong> {user.role || 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, minHeight: 40 }} variant="fullWidth">
        <Tab label="Edit Profile" sx={{ fontSize: { xs: 12, sm: 16 } }} />
        <Tab label="Ubah Password" sx={{ fontSize: { xs: 12, sm: 16 } }} />
      </Tabs>
      {tab === 0 && <EditProfileForm user={user} onUserUpdate={setUser} />}
      {tab === 1 && <ChangePasswordForm user={user} />}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {user && user.role === 'admin' && (
        <UserManagement />
      )}
    </Box>
  );
};

export default Profile;