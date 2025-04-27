import React from 'react';
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
  Tooltip
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = ({ user: userProp }) => {
  const [user, setUser] = React.useState(userProp || null);
  const [editingUsername, setEditingUsername] = React.useState('');
  const [editingEmail, setEditingEmail] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');

  const fetchUser = async () => {
    if (!API_BASE_URL) {
      setSnackbarMessage('Configuration error: API URL not set.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setUser(null);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/user`, { withCredentials: true });
      const fetchedUser = response.data.user;
      setUser(fetchedUser);
      setEditingUsername(fetchedUser.username || '');
      setEditingEmail(fetchedUser.email || '');
    } catch (error) {
      setSnackbarMessage('Failed to fetch user data.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setUser(null);
    }
  };

  React.useEffect(() => {
    if (userProp) {
      setUser(userProp);
      setEditingUsername(userProp.username || '');
      setEditingEmail(userProp.email || '');
    } else {
      fetchUser();
    }
  }, [userProp]);

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

    try {
      const response = await axios.put(`${API_BASE_URL}/api/profile/update`, updatePayload, { withCredentials: true });
      setSnackbarMessage('Profile updated successfully!');
      setSnackbarSeverity('success');
      await fetchUser();
    } catch (error) {
      setSnackbarMessage('Error updating profile.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading user profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Current User Info Display */}
      <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <Grid item>
          <Tooltip title="Click to edit" arrow>
            <Avatar sx={{ width: 120, height: 120, fontSize: 32 }}>
              {user.username ? user.username.split(' ').map(word => word[0]).join('').toUpperCase() : '?'}
            </Avatar>
          </Tooltip>
        </Grid>
        <Grid item>
          <Typography variant="h6">Current Name: {user.username || 'N/A'}</Typography>
          <Typography variant="h6">Current Email: {user.email || 'N/A'}</Typography>
          <Typography variant="h6">Current Role: {user.role || 'N/A'}</Typography>
        </Grid>
      </Grid>

      {/* Editable Profile Form */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Edit Profile</Typography>

        <TextField
          fullWidth
          label="Username"
          value={editingUsername}
          onChange={(e) => setEditingUsername(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Email"
          value={editingEmail}
          onChange={(e) => setEditingEmail(e.target.value)}
          margin="normal"
          type="email"
        />

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleUpdateProfile}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
        >
          {isSaving ? 'Saving...' : 'UPDATE PROFILE'}
        </Button>
      </Box>

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
    </Box>
  );
};

export default Profile;