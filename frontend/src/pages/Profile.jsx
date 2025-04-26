import React from 'react';
import axios from 'axios';
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  MenuItem, // Keep MenuItem even if not used currently, in case you add a select field
  Grid,
  Snackbar,
  Alert,
  CircularProgress // Add CircularProgress for button loading indicator
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material'; // Add an icon for the save button

// --- API Base URL Configuration ---
// Use an environment variable for the API base URL.
// This variable is set in your local .env file (e.g., VITE_API_BASE_URL=http://localhost:8080)
// and in your Vercel project settings (e.g., VITE_API_BASE_URL=https://your-railway-url.up.railway.app)

// For Vite:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// For Create React App:
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const Profile = ({ user: userProp }) => { // Receive user as a prop from App.js/Layout
  // We still manage user state internally for this component
  const [user, setUser] = React.useState(userProp || null);

  // New state for editable fields, initialized when user is loaded
  const [editingUsername, setEditingUsername] = React.useState('');
  const [editingEmail, setEditingEmail] = React.useState('');

  // Keep existing states for other form fields (remove if not needed in the form)
  // const [input1, setInput1] = React.useState('');
  // const [textarea, setTextarea] = React.useState('');
  // const [selectValue, setSelectValue] = React.useState('');

  // Loading state for form submission (renamed for clarity)
  const [isSaving, setIsSaving] = React.useState(false);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');

  // --- Fetch User Data ---
  // Fetches user data on mount or when userProp changes.
  const fetchUser = async () => {
    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not defined. Cannot fetch user in Profile.');
      setSnackbarMessage('Configuration error: API URL not set.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setUser(null); // Clear user state if config error prevents fetch
      return;
    }

    try {
      console.log("Profile fetching user from:", `${API_BASE_URL}/api/user`);
      // Make GET request to the /api/user endpoint, sending cookies
      const response = await axios.get(`${API_BASE_URL}/api/user`, { withCredentials: true });
      const fetchedUser = response.data.user; // Get the fetched user data

      setUser(fetchedUser); // Set the component's user state
      console.log("Profile fetched user successfully:", fetchedUser?.email);

      // --- Initialize editable fields with fetched user data ---
      // ONLY initialize if fetchedUser is valid, to avoid resetting form while editing
      if (fetchedUser) {
          setEditingUsername(fetchedUser.username || '');
          setEditingEmail(fetchedUser.email || '');
          // Initialize other fields from fetched data if they should be editable user properties
          // setInput1(fetchedUser.someOtherProperty || '');
      }

    } catch (error) {
      console.error('Profile failed to fetch user:', error.response?.data || error.message);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
          setSnackbarMessage('Session expired or not authenticated. Please log in.');
          // ** IMPORTANT: ** Redirect to login page here if needed
          // You would use `useNavigate()` from 'react-router-dom' here.
      } else {
          setSnackbarMessage('Failed to fetch user data.');
      }
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setUser(null); // Clear user state if fetch fails
    }
  };

  // --- useEffect Hook ---
  // This effect runs when the component mounts or the userProp changes.
  // It fetches user data or initializes state from the prop.
  React.useEffect(() => {
      // Fetch user data when the component mounts or userProp changes
      // This handles both initial load and potential updates from App.js
      // If userProp is available, initialize state from it. Otherwise, fetch.
      if (userProp) {
        setUser(userProp);
        setEditingUsername(userProp.username || '');
        setEditingEmail(userProp.email || '');
        console.log("Profile initialized with user prop:", userProp.email);
      } else {
         fetchUser(); // Fetch if prop is null (e.g., direct access or initial load)
      }
    }, [userProp]); // Depend on userProp


  // --- Handle Form Submission / Profile Update ---
  // This function handles submitting the form data to update the profile.
  const handleUpdateProfile = async () => { // Renamed function for clarity
    setIsSaving(true); // Start saving loading state

    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not defined. Cannot submit data.');
      setSnackbarMessage('Configuration error: API URL not set.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsSaving(false); // Stop loading
      return;
    }

    // Prepare the data payload to send to the backend update endpoint
    const updatePayload = {
      // Include fields you want to update
      username: editingUsername,
      email: editingEmail,
      // Include other form fields if they are part of the user profile
      // input1: input1,
      // textarea: textarea,
      // selectValue: selectValue,
      // ... potentially include password if you add password change fields
    };

    // --- Validate payload if needed ---
    if (!updatePayload.username || !updatePayload.email) {
        setSnackbarMessage('Username and email are required.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        setIsSaving(false);
        return;
    }
    // Add more robust validation here (e.g., email format regex)


    // --- Send data to a backend update endpoint ---
    // You need to create a POST or PUT endpoint on your backend like /api/profile/update
    const UPDATE_API_URL = `${API_BASE_URL}/api/profile/update`; // <-- Define or use a specific update URL

    console.log("Attempting to update profile. Sending payload:", updatePayload);
    console.log("Targeting API URL:", UPDATE_API_URL);

    try {
      // Use PUT or PATCH for updates, POST is also common but less semantic
      // **Double check the HTTP method (PUT/PATCH/POST) required by your backend!**
      const response = await axios.put(UPDATE_API_URL, updatePayload, { withCredentials: true }); // Or axios.patch or axios.post

      console.log("Profile update successful:", response.data);
      setSnackbarMessage('Profile updated successfully!');
      setSnackbarSeverity('success');

      // --- Refetch user data after successful update ---
      // This updates the displayed info on the page and potentially the session in App.js
      // **Important:** Call fetchUser to get the latest data from the server
      await fetchUser(); // Use await here to ensure fetch completes before ending 'saving' state (optional but can prevent flicker)


    } catch (error) {
      console.error('Error updating profile:', error); // Log the full error object
      console.error('Error response data:', error.response?.data); // Log response data if available
      console.error('Error status:', error.response?.status); // Log response status if available


      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update profile.';
      setSnackbarMessage(errorMessage);

      // Set severity based on status code if helpful
      if (axios.isAxiosError(error)) {
        if (error.response?.status >= 400 && error.response?.status < 500) {
            setSnackbarSeverity('warning'); // Client-side or validation error
        } else if (error.response?.status >= 500) {
            setSnackbarSeverity('error'); // Server error
        } else {
            setSnackbarSeverity('error'); // Network or other error
        }
      } else {
         setSnackbarSeverity('error'); // Non-Axios error
      }

    } finally {
      setSnackbarOpen(true); // Show snackbar regardless of success/failure
      setIsSaving(false); // End saving loading state
    }
  };

  // --- Snackbar Close Handler ---
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

    // --- Render Logic ---

    // Show configuration error if API_BASE_URL is missing
    if (!API_BASE_URL) {
        return (
            <Box sx={{ p: 3 }}>
             <Typography variant="h6" color="error">Configuration Error: API Base URL is not set.</Typography>
             <Typography variant="body2">Please check environment variables (VITE_API_BASE_URL).</Typography>
             {/* Display Snackbar immediately for config error */}
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000} // Longer duration for config error
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

  // Show a loading state while fetching the initial user data
  // This covers the case when userProp is null and fetchUser is running
  // Add a check for isSaving here too, so it doesn't show loading over the form when saving
  if (!user && !snackbarOpen) { // Don't show loading if a snackbar error is already displayed
    // You could potentially show a different message here if the error was a 401
    // (e.g., based on a separate state set in fetchUser)
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading user profile...</Typography>
         {/* Snackbar will show automatically if fetchUser fails */}
      </Box>
    );
  }

  // Render the profile content and form once user data is successfully loaded
  // Or if there was an error but we don't want to block rendering the form entirely (e.g., soft error)
  if (!user) {
      // If user is still null here, it means fetch failed and we shouldn't render the form
       return (
         <Box sx={{ p: 3 }}>
           <Typography variant="h6" color="error">Could not load user profile.</Typography>
             {/* Snackbar will show the specific error message */}
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>

      {/* Current User Info Display */}
        <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
          <Grid item>
            <Avatar sx={{ width: 120, height: 120, fontSize: 32 }}>
              {/* Display initials from current user state */}
              {user.username ? user.username.split(' ').map(word => word[0]).join('').toUpperCase() : '?' }
            </Avatar>
          </Grid>
          <Grid item>
            <Typography variant="h6">Current Name: {user.username || 'N/A'}</Typography>
            <Typography variant="h6">Current Email: {user.email || 'N/A'}</Typography>
            <Typography variant="h6">Current Role: {user.role || 'N/A'}</Typography> {/* Assuming 'role' exists */}
          </Grid>
        </Grid>


      {/* --- Editable Profile Form --- */}
      <Box sx={{ mt: 4 }}> {/* Use mt:0 if keeping current info display above */}
        <Typography variant="h5" gutterBottom>Edit Profile</Typography>

        {/* Username Field */}
        <TextField
          fullWidth
          label="Username"
          value={editingUsername}
          onChange={(e) => setEditingUsername(e.target.value)}
          margin="normal"
        />

        {/* Email Field */}
        <TextField
          fullWidth
          label="Email"
          value={editingEmail}
          onChange={(e) => setEditingEmail(e.target.value)}
          margin="normal"
          type="email" // Use email type for better mobile keyboards
        />

        {/* Password Field - Example (if you want to add password change) */}
         {/* <TextField
           fullWidth
           label="New Password"
           type="password"
           value={newPassword}
           onChange={(e) => setNewPassword(e.target.value)}
           margin="normal"
         />
          <TextField
           fullWidth
           label="Confirm New Password"
           type="password"
           value={confirmPassword}
           onChange={(e) => setConfirmPassword(e.target.value)}
           margin="normal"
         /> */}


        {/* Example other fields (remove if not needed for profile update) */}
        {/* <TextField
          fullWidth
          label="Some Other Field"
          value={input1}
          onChange={(e) => setInput1(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="About Me"
          value={textarea}
          onChange={(e) => setTextarea(e.target.value)}
          margin="normal"
          multiline
          rows={4}
        />
         <TextField
            fullWidth
            select
            label="Role"
            value={selectValue} // Or link to user.role if role is editable
            onChange={(e) => setSelectValue(e.target.value)}
            margin="normal"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField> */}


        {/* Update Profile Button */}
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleUpdateProfile} // Call the update handler
          disabled={isSaving} // Disable button while saving
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} // Add loading spinner or save icon
        >
          {isSaving ? 'Saving...' : 'UPDATE PROFILE'} {/* Change button text */}
        </Button>
      </Box>

      {/* Snackbar for showing success/error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000} // Increased duration slightly for readability
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position at the bottom center
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;