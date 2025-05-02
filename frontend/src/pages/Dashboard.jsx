import React from 'react';
import {
  Box, Card, CardContent, Typography, Grid, useTheme,
  List, ListItem, ListItemText
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';

// Data tetap sama seperti sebelumnya
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

const getChartColors = (theme) => [
  theme.palette.primary.main,
  theme.palette.secondary.main,
  theme.palette.error.main,
  theme.palette.success.main,
  theme.palette.warning.main,
  theme.palette.info.main,
];

const Dashboard = () => {
  const theme = useTheme();
  const chartColors = getChartColors(theme);

  return (
    <Box sx={{ p: { xs: theme.spacing(2), sm: theme.spacing(3) } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: theme.spacing(4) }}>
        Dashboard Overview
      </Typography>

      {/* Stats - TIDAK DIUBAH */}
      <Grid container spacing={theme.spacing(3)} mb={theme.spacing(4)}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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

      {/* 4 Komponen yang Diubah */}
      <Grid container spacing={theme.spacing(3)}>
        {/* 1. Inventory Movement Chart - DIUBAH (Lebih Lebar) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            minHeight: 350,
            borderRadius: theme.shape.borderRadius, 
            boxShadow: theme.shadows[2] 
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                Inventory Movement
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={inventoryMovementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="incoming" 
                    stroke={theme.palette.success.main} 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="outgoing" 
                    stroke={theme.palette.error.main} 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 2. Storage Distribution Chart - DIUBAH (Lebih Lebar) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            minHeight: 350,
            borderRadius: theme.shape.borderRadius, 
            boxShadow: theme.shadows[2] 
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                Storage Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
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

        {/* 3. Recent Transactions - DIUBAH (Lebih Sempit) */}
        <Grid item xs={12} md={2}>
          <Card sx={{ 
            height: '100%', 
            minHeight: 350,
            borderRadius: theme.shape.borderRadius, 
            boxShadow: theme.shadows[2] 
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                Recent Transactions
              </Typography>
              <List dense sx={{ 
                maxHeight: 230, 
                overflow: 'auto',
                '& .MuiListItem-root': {
                  py: 1.5,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }
              }}>
                {recentTransactions.map((tx, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="medium">
                          {tx.item} - {tx.quantity} - {tx.type}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {tx.date}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {recentTransactions.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    No recent transactions.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 4. Inventory Trend - DIUBAH (Lebih Sempit) */}
        <Grid item xs={12} md={2}>
          <Card sx={{ 
            height: '100%', 
            minHeight: 350,
            borderRadius: theme.shape.borderRadius, 
            boxShadow: theme.shadows[2] 
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                Inventory Trend (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={inventoryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="quantity"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ stroke: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
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