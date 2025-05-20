import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, useTheme,
  List, ListItem, ListItemText, CircularProgress, Alert,
  Divider, Chip, Badge, Stack
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Warning as WarningIcon,
  ArrowDownward as IncomingIcon,
  ArrowUpward as OutgoingIcon
} from '@mui/icons-material';

// API URL dari environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper untuk mendapatkan token autentikasi
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Fungsi untuk membuat data statistik dari data stok
const generateStatsFromData = (stockData, historyData) => {
  // Total inventory
  const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0);
  
  // Low stock alerts (item dengan quantity <= 10)
  const lowStockCount = stockData.filter(item => item.quantity <= 10).length;
  
  // Incoming/outgoing dari history
  const incomingCount = historyData ? historyData.filter(item => item.transaction_type === 'incoming').length : 0;
  const outgoingCount = historyData ? historyData.filter(item => item.transaction_type === 'outgoing').length : 0;
  
  return [
    { title: 'Total Inventory', value: totalStock.toString() },
    { title: 'Low Stock Alerts', value: lowStockCount.toString() },
    { title: 'Incoming Shipments', value: incomingCount.toString() },
    { title: 'Outgoing Shipments', value: outgoingCount.toString() },
  ];
};

// Fungsi untuk menghasilkan data transaksi berdasarkan bulan dari history
const generateMonthlyTransactionData = (historyData) => {
  if (!historyData || historyData.length === 0) return [];
  
  // Buat mapping bulan untuk data
  const monthMap = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', 
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
  };

  // Inisialisasi data untuk semua bulan
  const monthlyData = {};
  Object.keys(monthMap).forEach(month => {
    monthlyData[month] = { month: monthMap[month], incoming: 0, outgoing: 0 };
  });

  // Hitunglah transaksi berdasarkan bulan
  historyData.forEach(record => {
    const transactionDate = new Date(record.transaction_date);
    const month = String(transactionDate.getMonth() + 1).padStart(2, '0');
    
    if (record.transaction_type === 'incoming') {
      monthlyData[month].incoming += Math.abs(record.quantity_change);
    } else if (record.transaction_type === 'outgoing') {
      monthlyData[month].outgoing += Math.abs(record.quantity_change);
    }
  });

  // Konversi object menjadi array
  return Object.values(monthlyData);
};

// Fungsi untuk membuat data kategori stok untuk diagram pie
const generateCategoryData = (stockData) => {
  if (!stockData || stockData.length === 0) return [];
  
  // Kelompokkan item berdasarkan kategori
  const categories = {};
  stockData.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category] += item.quantity;
  });
  
  // Konversi object menjadi array untuk digunakan di PieChart
  return Object.keys(categories).map(category => ({
    name: category,
    value: categories[category]
  }));
};

// Fungsi untuk membuat data transaksi terakhir
const generateRecentTransactions = (historyData, stockData) => {
  if (!historyData || historyData.length === 0) return [];
  
  // Buat mapping id item ke nama
  const itemMap = {};
  if (stockData) {
    stockData.forEach(item => {
      itemMap[item.id] = item.name;
    });
  }

  // Ambil 5 transaksi terakhir
  return historyData.slice(0, 5).map(record => ({
    item: itemMap[record.item_id] || `Item #${record.item_id}`,
    quantity: Math.abs(record.quantity_change),
    type: record.transaction_type,
    date: new Date(record.transaction_date).toISOString().split('T')[0]
  }));
};

// Fungsi untuk mendapatkan item dengan stok menipis (< 50)
const getLowStockItems = (stockData) => {
  if (!stockData || stockData.length === 0) return [];
  
  // Filter item dengan quantity < 50, urutkan dari terendah
  return stockData
    .filter(item => item.quantity < 50)
    .sort((a, b) => a.quantity - b.quantity)
    .map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      category: item.category || 'Uncategorized'
    }));
};

// Fungsi untuk membuat data trend stok selama 30 hari terakhir
const generateInventoryTrendData = (historyData) => {
  if (!historyData || historyData.length === 0) return [];

  // Urutkan history berdasarkan tanggal
  const sortedHistory = [...historyData].sort((a, b) => 
    new Date(a.transaction_date) - new Date(b.transaction_date)
  );

  // Ambil data untuk 30 hari terakhir
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Filter data untuk 30 hari terakhir
  const recentHistory = sortedHistory.filter(
    record => new Date(record.transaction_date) >= thirtyDaysAgo
  );

  // Buat data trend (asumsi stok awal 0)
  let currentStock = 0;
  const trendData = [];
  
  recentHistory.forEach(record => {
    const date = new Date(record.transaction_date).toISOString().split('T')[0];
    currentStock += record.quantity_change; // Incoming positif, outgoing negatif
    
    trendData.push({
      date,
      quantity: currentStock
    });
  });

  return trendData;
};

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

  // State untuk data
  const [stockData, setStockData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk data dashboard yang akan dihasilkan
  const [stats, setStats] = useState([]);
  const [inventoryMovementData, setInventoryMovementData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [inventoryTrendData, setInventoryTrendData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Efek untuk mengambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      if (!API_URL) {
        setError("Konfigurasi API URL tidak ditemukan");
        setLoading(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setError("Token autentikasi tidak ditemukan");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch stock data
        const stockResponse = await fetch(`${API_URL}/api/stock`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!stockResponse.ok) {
          throw new Error(`Error mengambil data stok: ${stockResponse.statusText}`);
        }

        const stockDataResult = await stockResponse.json();
        setStockData(stockDataResult);

        // Fetch history data
        const historyResponse = await fetch(`${API_URL}/api/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!historyResponse.ok) {
          throw new Error(`Error mengambil data history: ${historyResponse.statusText}`);
        }

        const historyDataResult = await historyResponse.json();
        setHistoryData(historyDataResult);

        // Generate dashboard data dari hasil API
        setStats(generateStatsFromData(stockDataResult, historyDataResult));
        setInventoryMovementData(generateMonthlyTransactionData(historyDataResult));
        setPieData(generateCategoryData(stockDataResult));
        setRecentTransactions(generateRecentTransactions(historyDataResult, stockDataResult));
        setInventoryTrendData(generateInventoryTrendData(historyDataResult));
        setLowStockItems(getLowStockItems(stockDataResult));

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ p: { xs: theme.spacing(2), sm: theme.spacing(3) } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: theme.spacing(4) }}>
        Dashboard Overview
      </Typography>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      {!loading && !error && (
        <>
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

          {/* Notifikasi Stok Menipis */}
          {lowStockItems.length > 0 && (
            <Box mb={theme.spacing(4)}>
              <Card
                sx={{
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[2],
                  borderLeft: `4px solid ${theme.palette.warning.main}`
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <WarningIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                    <Typography variant="h6" component="div" fontWeight="bold">
                      Stok Menipis
                    </Typography>
                    <Chip 
                      label={`${lowStockItems.length} item`}
                      size="small"
                      color="warning"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    {lowStockItems.slice(0, 6).map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            bgcolor: theme.palette.background.default,
                            '&:hover': {
                              boxShadow: theme.shadows[3],
                              cursor: 'pointer'
                            }
                          }}
                        >
                          <CardContent sx={{ padding: '8px 16px !important' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body1" component="div" fontWeight="medium" noWrap sx={{ maxWidth: '70%' }}>
                                {item.name}
                              </Typography>
                              <Chip 
                                label={item.quantity}
                                size="small"
                                color={item.quantity <= 10 ? "error" : "warning"}
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {item.category}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {lowStockItems.length > 6 && (
                    <Typography 
                      variant="body2" 
                      align="center" 
                      sx={{ mt: 2, color: theme.palette.primary.main, cursor: 'pointer' }}
                    >
                      Lihat semua {lowStockItems.length} item stok menipis
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Charts */}
          <Grid container spacing={theme.spacing(3)}>
            {/* Inventory Movement Chart */}
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
                    <BarChart data={inventoryMovementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        name="Incoming" 
                        dataKey="incoming" 
                        fill={theme.palette.success.main}
                      />
                      <Bar 
                        name="Outgoing" 
                        dataKey="outgoing" 
                        fill={theme.palette.error.main}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Category Distribution Chart */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                minHeight: 350,
                borderRadius: theme.shape.borderRadius, 
                boxShadow: theme.shadows[2] 
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Category Distribution
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

            {/* Recent Transactions */}
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
                    {recentTransactions.length > 0 ? recentTransactions.map((tx, index) => (
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
                    )) : (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                        Tidak ada transaksi terbaru.
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Inventory Trend */}
            <Grid item xs={12} md={2}>
              <Card sx={{ 
                height: '100%', 
                minHeight: 350,
                borderRadius: theme.shape.borderRadius, 
                boxShadow: theme.shadows[2] 
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Inventory Trend (30 Hari)
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
        </>
      )}
    </Box>
  );
};

export default Dashboard;