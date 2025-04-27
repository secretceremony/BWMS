import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
// Import ResponsiveContainer from recharts
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

// Dummy data (keep as is)
const stats = [
  { title: 'Total Inventory', value: '5,678' },
  { title: 'Low Stock Alerts', value: '12' },
  { title: 'Incoming Shipments', value: '24' },
  { title: 'Outgoing Shipments', value: '18' },
];

const inventoryMovementData = [
  { month: 'Jan', incoming: 300, outgoing: 400 },
  { month: 'Feb', incoming: 200, outgoing: 300 },
  { month: 'Mar', incoming: 400, outgoing: 600 },
  { month: 'Apr', incoming: 700, outgoing: 1000 },
  { month: 'May', incoming: 350, outgoing: 500 },
  { month: 'Jun', incoming: 400, outgoing: 450 },
];

const pieData = [
  { name: 'Warehouse A', value: 400 },
  { name: 'Warehouse B', value: 300 },
  { name: 'Warehouse C', value: 300 },
  { name: 'Warehouse D', value: 200 },
];

const recentTransactions = [
  { item: 'Item A', quantity: 50, type: 'Incoming', date: '2025-04-18' },
  { item: 'Item B', quantity: 30, type: 'Outgoing', date: '2025-04-17' },
  { item: 'Item C', quantity: 20, type: 'Incoming', date: '2025-04-16' },
];

const inventoryTrendData = [
  { date: 'Day 1', quantity: 800 },
  { date: 'Day 10', quantity: 1200 },
  { date: 'Day 20', quantity: 1100 },
  { date: 'Day 30', quantity: 1600 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}> {/* Adjusted padding for smaller screens */}

      {/* Stats Section */}
      <Grid container spacing={2} mb={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  {stat.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Movement Chart
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={inventoryMovementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="incoming" stroke="#8884d8" />
                  <Line type="monotone" dataKey="outgoing" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Pie Chart
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" // Center the pie chart horizontally
                    cy="50%" // Center the pie chart vertically
                    outerRadius={80} // Adjust radius as needed
                    fill="#8884d8"
                    label // Show labels on pie slices
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions and Trend Section */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {recentTransactions.map((tx, index) => (
                  <li key={index}>
                    {tx.item} - {tx.quantity} - {tx.type} - {tx.date}
                  </li>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Trend (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={inventoryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="quantity" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;