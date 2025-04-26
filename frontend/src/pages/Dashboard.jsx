import React from 'react'; // useEffect and useState might not be needed anymore
import { Container, Grid, Paper, Typography, Box, Button } from '@mui/material';
// useNavigate is not needed for programmatic navigation away from Dashboard
// import { useNavigate } from 'react-router-dom';


// Accept user object and onLogout function as props
const Dashboard = ({ user, onLogout }) => {
  // loading state is likely not needed here anymore, managed in App.jsx
  // const [loading, setLoading] = useState(false);
  // useNavigate is not needed here anymore, navigation is handled by App state change
  // const navigate = useNavigate();

  // Remove the useEffect that checks localStorage
  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem('user'));
  //   if (!user) {
  //     navigate('/login');
  //   }
  // }, [navigate]);

  const handleLogout = () => {
    // Call the onLogout function passed from App.jsx
    // App.jsx will handle the API call, state update, and navigation
    onLogout();
    // Remove direct navigation from here
    // navigate('/login');
  };

  // Use user data from props
  const username = user?.username || 'User'; // Provide a fallback if user is null/undefined

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#3f51b5', color: '#fff' }}>
        {/* Display username from props */}
        <Typography variant="h6">Welcome, {username}</Typography>
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          {/* ... (rest of your dashboard UI) */}
           <Grid item xs={12} sm={6} md={3}>
             <Paper sx={{ p: 2, textAlign: 'center' }}>
               <Typography variant="h6">Total Inventory</Typography>
               <Typography variant="h4">5,678</Typography>
             </Paper>
           </Grid>
           <Grid item xs={12} sm={6} md={3}>
             <Paper sx={{ p: 2, textAlign: 'center' }}>
               <Typography variant="h6">Low Stock Alerts</Typography>
               <Typography variant="h4">12</Typography>
             </Paper>
           </Grid>
           <Grid item xs={12} sm={6} md={3}>
             <Paper sx={{ p: 2, textAlign: 'center' }}>
               <Typography variant="h6">Incoming Shipments</Typography>
               <Typography variant="h4">24</Typography>
             </Paper>
           </Grid>
           <Grid item xs={12} sm={6} md={3}>
             <Paper sx={{ p: 2, textAlign: 'center' }}>
               <Typography variant="h6">Outgoing Shipments</Typography>
               <Typography variant="h4">18</Typography>
             </Paper>
           </Grid>
        </Grid>

        {/* Recent Transactions */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
              <ul>
                <li>Item A - 50 - Incoming - 2025-04-18</li>
                <li>Item B - 30 - Outgoing - 2025-04-17</li>
                <li>Item C - 20 - Incoming - 2025-04-16</li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Inventory Trend</Typography>
              {/* Simple placeholder chart */}
              <Box sx={{ height: 150, backgroundColor: '#eee', textAlign: 'center', lineHeight: '150px' }}>
                Trend Chart
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;