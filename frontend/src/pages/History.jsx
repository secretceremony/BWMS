import React, { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Card, CardContent, Avatar, useTheme, CircularProgress, Button, TextField
} from '@mui/material';
import {
  ArrowDownward as IncomingIcon,
  ArrowUpward as OutgoingIcon,
  NotificationsNone as DefaultIcon,
  InfoOutlined as InfoIcon // Icon for empty state
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Get Backend URL from environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL; // Rely on App.js for config error check

// Helper to get authentication token (should be consistent across your app)
const getAuthToken = () => {
    return localStorage.getItem('token');
};

const History = ({ user }) => {
  const theme = useTheme();

  // State for fetched history data
  const [historyData, setHistoryData] = useState([]);
  // State for items data (untuk menyimpan data item/barang)
  const [itemsData, setItemsData] = useState({});
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  // Tambahkan state search
  const [search, setSearch] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  // Fetch items data to map item_id to item names
  const fetchItems = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/stock`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        console.error('Failed to fetch items data');
        return {};
      }
      const data = await response.json();
      // Convert array to object with id as keys for easier lookup
      const itemsMap = {};
      data.forEach(item => {
        itemsMap[item.id] = item;
      });
      return itemsMap;
    } catch (err) {
      console.error("Fetching items failed:", err);
      return {};
    }
  };

  // Fetch history data when the component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      if (!API_URL) {
        setError("Application configuration error: API URL is not set.");
        setSnackbarMessage("API URL belum diatur. Hubungi admin.");
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setSnackbarMessage("Sesi login habis atau belum login. Silakan login kembali.");
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
        setTimeout(() => window.location.href = '/login', 2000);
        return;
      }
      try {
        const items = await fetchItems(token);
        setItemsData(items);
        const response = await fetch(`${API_URL}/api/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          setSnackbarMessage(errorBody.error || errorBody.message || response.statusText);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          if (response.status === 401 || response.status === 403) {
            setError("Authentication error: Please login again.");
            setTimeout(() => window.location.href = '/login', 2000);
          } else {
            setError(`Failed to fetch history: ${errorBody.error || errorBody.message || response.statusText}`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHistoryData(data);
      } catch (err) {
        setSnackbarMessage("Gagal mengambil data history. Cek koneksi atau hubungi admin.");
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setError("Failed to load history. Network error or server issue.");
      } finally {
        setLoading(false);
      }
    };
    if (API_URL) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'incoming':
        return <IncomingIcon />;
      case 'outgoing':
        return <OutgoingIcon />;
      default:
        return <DefaultIcon />;
    }
  };

  // Function to get item name from item_id
  const getItemName = (itemId) => {
    if (itemsData && itemsData[itemId]) {
      return itemsData[itemId].name || `Item #${itemId}`;
    }
    return `Item #${itemId}`;
  };

  // Determine if there is data to display
  const hasHistory = historyData && historyData.length > 0;

  // Fungsi untuk set preset tanggal
  const setPresetRange = (days) => {
    setCustomMode(false);
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(end);
    start.setDate(end.getDate() - days + 1);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleCustom = () => {
    setCustomMode(true);
    setStartDate('');
    setEndDate('');
  };

  // Filter data history berdasarkan search
  const filteredHistory = historyData.filter(record => {
    if (!startDate || !endDate) return true;
    const tgl = new Date(record.transaction_date).toISOString().split('T')[0];
    const matchDate = tgl >= startDate && tgl <= endDate;
    const itemName = getItemName(record.item_id).toLowerCase();
    const matchSearch = !search || itemName.includes(search.toLowerCase()) || String(record.item_id).includes(search);
    return matchDate && matchSearch;
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        p: { xs: 1, sm: 4 }, // Responsive padding
      }}
    >
      {/* Loading State */}
      {loading && (
        <Box sx={{ textAlign: 'center', mt: theme.spacing(4) }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: theme.spacing(2) }}>Loading History...</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ textAlign: 'center', mt: theme.spacing(4) }}>
          <Typography color="error" variant="h6" sx={{ mb: 2 }}>Error: {error}</Typography>
          <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={() => window.location.reload()}>Coba Lagi</Button>
          <Button variant="outlined" color="secondary" onClick={() => window.location.href = '/login'}>Ke Login</Button>
        </Box>
      )}

      {/* Search & Filter */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} mb={2}>
        <TextField
          label="Cari barang (ID/Nama)"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="outlined" onClick={() => setPresetRange(7)} size="small">7 Hari Terakhir</Button>
          <Button variant="outlined" onClick={() => setPresetRange(30)} size="small">1 Bulan Terakhir</Button>
          <Button variant="outlined" onClick={() => setPresetRange(90)} size="small">3 Bulan Terakhir</Button>
          <Button variant="outlined" onClick={handleCustom} size="small">Custom</Button>
        </Stack>
      </Stack>

      {customMode && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
          <TextField
            label="Dari Tanggal"
            type="date"
            size="small"
            value={startDate || ''}
            onChange={e => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Sampai Tanggal"
            type="date"
            size="small"
            value={endDate || ''}
            onChange={e => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
        </Stack>
      )}

      {/* Display History Data or Empty State */}
      {!loading && !error && (
        hasHistory ? (
          <Stack spacing={2} direction="column">
            {filteredHistory.map((record) => {
              const itemName = (itemsData && itemsData[record.item_id] && itemsData[record.item_id].name) ? itemsData[record.item_id].name : '';
              return (
                <Card
                  key={record.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: theme.shadows[2],
                    transition: theme.transitions.create(['box-shadow', 'transform'], {
                      duration: theme.transitions.duration.standard,
                    }),
                    '&:hover': {
                      boxShadow: theme.shadows[5],
                      transform: 'translateY(-2px)',
                      cursor: 'pointer',
                    },
                    width: '100%',
                    maxWidth: 600,
                    mx: 'auto',
                    mb: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    p: { xs: 1, sm: 0 },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor:
                        record.transaction_type === 'incoming'
                          ? theme.palette.success.light
                          : theme.palette.error.light,
                      color:
                        record.transaction_type === 'incoming'
                          ? theme.palette.success.dark
                          : theme.palette.error.dark,
                      m: theme.spacing(2),
                    }}
                  >
                    {getIcon(record.transaction_type)}
                  </Avatar>
                  <CardContent
                    sx={{
                      flex: 1,
                      p: theme.spacing(2),
                      '&:last-child': { pb: theme.spacing(2) },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {`${record.transaction_type === 'incoming' ? 'Incoming' : 'Outgoing'}${itemName ? ' - ' + itemName : ''}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {record.quantity_change}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date(record.transaction_date).toLocaleDateString()}
                    </Typography>
                    {record.remarks && (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        Remarks: {record.remarks}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled">
                      Recorded At: {new Date(record.created_at).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        ) : (
          // Empty State Message Box
          <Box
            sx={{
              textAlign: 'center',
              mt: theme.spacing(4),
              color: theme.palette.text.secondary,
            }}
          >
            <InfoIcon sx={{ fontSize: 60, mb: theme.spacing(2) }} />
            <Typography variant="h6" gutterBottom>
              No transaction history yet.
            </Typography>
            <Typography variant="body1">
              Record incoming or outgoing goods from the Stock Management page to see history here.
            </Typography>
          </Box>
        )
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default History;