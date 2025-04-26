import React from 'react';
import axios from 'axios';
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';

// Use an environment variable for the API base URL
// For Vite: import.meta.env.VITE_API_BASE_URL
// For Create React App: process.env.REACT_APP_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fallback for development if the variable isn't set (optional but helpful)
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';


const Profile = () => {
  const [user, setUser] = React.useState(null);
  const [input1, setInput1] = React.useState('');
  const [textarea, setTextarea] = React.useState('');
  const [selectValue, setSelectValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');

  const fetchUser = async () => {
    try {
      // Ensure API_BASE_URL is defined before making the request
      if (!API_BASE_URL) {
         console.error('API_BASE_URL is not defined.');
         setSnackbarMessage('Application configuration error: API URL not set.');
         setSnackbarSeverity('error');
         setSnackbarOpen(true);
         return; // Stop execution if URL is missing
      }
      const response = await axios.get(`${API_BASE_URL}/api/user`, { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Provide more specific feedback if possible
      if (error.response && error.response.status === 401) {
          setSnackbarMessage('Not authenticated. Please log in.');
          // Optionally redirect to login page here
      } else {
          setSnackbarMessage('Failed to fetch user data.');
      }
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const payload = {
      input1,
      textarea,
      selectValue
    };

    try {
       // Ensure API_BASE_URL is defined before making the request
      if (!API_BASE_URL) {
         console.error('API_BASE_URL is not defined.');
         setSnackbarMessage('Application configuration error: API URL not set.');
         setSnackbarSeverity('error');
         setSnackbarOpen(true);
         setLoading(false); // Stop loading
         return; // Stop execution if URL is missing
      }
      const response = await axios.post(`${API_BASE_URL}/api/submit`, payload, { withCredentials: true });
      setSnackbarMessage('Data sent successfully!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Error sending data:', error);
       setSnackbarMessage('Failed to send data.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  React.useEffect(() => {
    fetchUser();
  }, []);

  // Add a check for API_BASE_URL being undefined during initial render
  if (!API_BASE_URL) {
      return (
         <Box sx={{ p: 3 }}>
            <Typography variant="h6" color="error">Configuration Error: API Base URL is not set.</Typography>
            <Typography variant="body2">Please check your environment variables.</Typography>
         </Box>
      );
  }


  if (!user) {
    // You might want to show a more specific message if the error was 401
     // For now, keeping the original loading state
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Loading user...</Typography>
        {/* Could potentially show a "Login Required" message here if fetchUser caught a 401 */}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>

      <Grid container spacing={3} alignItems="center">
        <Grid item>
          <Avatar sx={{ width: 120, height: 120, fontSize: 32 }}>
            {user.username ? user.username.split(' ').map(word => word[0]).join('').toUpperCase() : '?' } {/* Added check for user.username */}
          </Avatar>
        </Grid>
        <Grid item>
          <Typography variant="h6">Name: {user.username || 'N/A'}</Typography> {/* Added fallback */}
          <Typography variant="h6">Email: {user.email || 'N/A'}</Typography>   {/* Added fallback */}
          <Typography variant="h6">Role: {user.role || 'N/A'}</Typography>     {/* Added fallback */}
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="Input 1"
          value={input1}
          onChange={(e) => setInput1(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Textarea"
          value={textarea}
          onChange={(e) => setTextarea(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          inputProps={{ maxLength: 100 }}
          helperText={`${textarea.length}/100`}
        />
        <TextField
          fullWidth
          label="Select Option"
          value={selectValue}
          onChange={(e) => setSelectValue(e.target.value)}
          margin="normal"
          select
        >
          <MenuItem value="option1">Option 1</MenuItem>
          <MenuItem value="option2">Option 2</MenuItem>
          <MenuItem value="option3">Option 3</MenuItem>
        </TextField>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'ACTION'}
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
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