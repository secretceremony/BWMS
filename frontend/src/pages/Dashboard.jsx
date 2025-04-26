import React from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import Layout from '../components/Layout';

const Dashboard = ({ user, onLogout }) => {
  return (
    <Layout onLogout={onLogout}>
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {/* Top cards */}
        <Grid container spacing={3}>
          {['Total Inventory', 'Low Stock Alerts', 'Incoming Shipments', 'Outgoing Shipments'].map((title, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="h4">XXXX</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Middle charts */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6">Inventory Movement Chart</Typography>
              <Box sx={{ mt: 2, height: '80%', backgroundColor: '#eee', textAlign: 'center', lineHeight: '240px' }}>
                Chart Placeholder
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6">Storage Pie Chart</Typography>
              <Box sx={{ mt: 2, height: '80%', backgroundColor: '#eee', textAlign: 'center', lineHeight: '240px' }}>
                Pie Placeholder
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom tables */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6">Recent Transactions</Typography>
              <Box sx={{ mt: 2 }}>
                <ul>
                  <li>Item A - 50 - Incoming - 2025-04-18</li>
                  <li>Item B - 30 - Outgoing - 2025-04-17</li>
                  <li>Item C - 20 - Incoming - 2025-04-16</li>
                </ul>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6">Inventory Trend (Last 30 Days)</Typography>
              <Box sx={{ mt: 2, height: '80%', backgroundColor: '#eee', textAlign: 'center', lineHeight: '240px' }}>
                Trend Placeholder
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Dashboard;