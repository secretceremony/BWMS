import React from 'react';
import {
  Box, Card, CardContent, Typography, Grid, useTheme, // Import useTheme
  List, ListItem, ListItemText // Import List components
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

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

// Define colors using theme palette
// You might add these colors to your theme options directly for better centralisation
// For this example, we'll derive them from the theme palette
// Make sure your theme has sufficient colors defined (e.g., primary, secondary, error, success, info, warning)
// If not, you can define a custom 'chartColors' array in your themeOptions
const getChartColors = (theme) => [
  theme.palette.primary.main,
  theme.palette.secondary.main,
  theme.palette.error.main,
  theme.palette.success.main,
  theme.palette.warning.main,
  theme.palette.info.main,
];


const Dashboard = () => {
    const theme = useTheme(); // Use the theme hook
    const chartColors = getChartColors(theme); // Get theme-based chart colors

  return (
    <Box sx={{ p: { xs: theme.spacing(2), sm: theme.spacing(3) } }}>

        {/* Page Title */}
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: theme.spacing(4) }}> {/* Use theme spacing */}
            Dashboard Overview
        </Typography>

      {/* Stats Section */}
      <Grid container spacing={theme.spacing(3)} mb={theme.spacing(4)}> {/* Use theme spacing */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[2] }}> {/* Use theme styles */}
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom> {/* Use theme color, added gutterBottom */}
                  {stat.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold"> {/* fontWeight is already bold */}
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={theme.spacing(3)} mb={theme.spacing(4)}> {/* Use theme spacing */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[2] }}> {/* Use theme styles */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Movement Chart
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={inventoryMovementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} /> {/* Use theme divider color */}
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} /> {/* Use theme text color */}
                  <YAxis stroke={theme.palette.text.secondary} /> {/* Use theme text color */}
                  <Tooltip />
                  <Legend />
                  {/* Use theme colors for lines */}
                  <Line type="monotone" dataKey="incoming" stroke={theme.palette.success.main} strokeWidth={2} /> {/* Use theme color, added strokeWidth */}
                  <Line type="monotone" dataKey="outgoing" stroke={theme.palette.error.main} strokeWidth={2} /> {/* Use theme color, added strokeWidth */}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[2] }}> {/* Use theme styles */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Distribution
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
                    // fill="#8884d8" // Removed hardcoded fill
                    label // Show labels on pie slices
                  >
                    {/* Use theme colors for cells */}
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
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
      <Grid container spacing={theme.spacing(3)}> {/* Use theme spacing */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[2] }}> {/* Use theme styles */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {/* Use MUI List components for better styling */}
              <List dense> {/* dense makes the list items smaller */}
                {recentTransactions.map((tx, index) => (
                  <ListItem key={index} disablePadding> {/* disablePadding to control spacing */}
                    <ListItemText
                      primary={`${tx.item} - ${tx.quantity} - ${tx.type}`}
                      secondary={tx.date}
                      primaryTypographyProps={{ fontWeight: 'medium' }} // Make item/quantity/type bold
                      secondaryTypographyProps={{ color: 'text.secondary' }} // Ensure date uses secondary color
                    />
                  </ListItem>
                ))}
                {/* Add empty state for transactions if needed */}
                {recentTransactions.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: theme.spacing(2) }}>
                        No recent transactions.
                    </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[2] }}> {/* Use theme styles */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Trend (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={inventoryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} /> {/* Use theme divider color */}
                  <XAxis dataKey="date" stroke={theme.palette.text.secondary} /> {/* Use theme text color */}
                  <YAxis stroke={theme.palette.text.secondary} /> {/* Use theme text color */}
                  <Tooltip />
                  <Line
                        type="monotone"
                        dataKey="quantity"
                        stroke={theme.palette.primary.main} // Use theme primary color
                        strokeWidth={2}
                        dot={{ stroke: theme.palette.primary.main, strokeWidth: 2, r: 4 }} // Style dots with theme color
                    />
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