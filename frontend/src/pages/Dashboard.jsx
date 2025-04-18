import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import SummaryCard from '../components/SummaryCard';
import ChartContainer from '../components/ChartContainer';
import TransactionTable from '../components/TransactionTable';

// Mock data for charts and stats
const pieData = [
  { name: 'Warehouse A', value: 400 },
  { name: 'Warehouse B', value: 300 },
  { name: 'Warehouse C', value: 200 },
  { name: 'Warehouse D', value: 100 },
];

const lineData = [
  { name: 'Jan', incoming: 400, outgoing: 240 },
  { name: 'Feb', incoming: 300, outgoing: 139 },
  { name: 'Mar', incoming: 200, outgoing: 980 },
  { name: 'Apr', incoming: 278, outgoing: 390 },
  { name: 'May', incoming: 189, outgoing: 480 },
  { name: 'Jun', incoming: 239, outgoing: 380 },
];

const recentTransactions = [
  { id: 1, item: 'Item A', quantity: 50, type: 'Incoming', date: '2025-04-18' },
  { id: 2, item: 'Item B', quantity: 30, type: 'Outgoing', date: '2025-04-17' },
  { id: 3, item: 'Item C', quantity: 20, type: 'Incoming', date: '2025-04-16' },
];

const trendData = [
  { name: 'Week 1', value: 1000 },
  { name: 'Week 2', value: 1200 },
  { name: 'Week 3', value: 900 },
  { name: 'Week 4', value: 1500 },
];

function Dashboard({ username, userRole, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/dashboard' } } });
    }
  }, [navigate]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar 
        username={username} 
        userRole={userRole} 
        toggleDrawer={toggleDrawer} 
      />
      
      <Sidebar 
        open={drawerOpen} 
        onClose={toggleDrawer} 
        onLogout={handleLogout} 
      />
      
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1, 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ pt: 8 }} /> {/* Space for fixed navbar */}
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {/* Summary Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Total Inventory" value="5,678" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Low Stock Alerts" value="12" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Incoming Shipments" value="24" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Outgoing Shipments" value="18" />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={8}>
              <ChartContainer 
                title="Inventory Movement Chart" 
                type="line"
                data={lineData} 
                dataKeys={['incoming', 'outgoing']}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ChartContainer 
                title="Storage Pie Chart" 
                type="pie"
                data={pieData} 
              />
            </Grid>
          </Grid>

          {/* Bottom Panels */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 300, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                <TransactionTable data={recentTransactions} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartContainer 
                title="Inventory Trend (Last 30 Days)" 
                type="line"
                data={trendData} 
                dataKeys={['value']}
              />
            </Grid>
          </Grid>
        </Container>
        
        <Footer />
      </Box>
    </Box>
  );
}

export default Dashboard;