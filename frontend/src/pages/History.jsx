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

  // Fetch items data to map item_id to item names
  const fetchItems = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/items`, {
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
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null); // Reset error state

      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        // Consider redirecting to login page here if token is missing
        return;
      }

      try {
        // Fetch items data first to get the mapping of id to names
        const items = await fetchItems(token);
        setItemsData(items);

        // Then fetch history data
        const response = await fetch(`${API_URL}/api/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          console.error('Fetch history error details:', errorBody);
          if (response.status === 401 || response.status === 403) {
            setError("Authentication error: Please login again.");
          } else {
            setError(`Failed to fetch history: ${errorBody.error || errorBody.message || response.statusText}`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Assuming the backend returns an array of history records
        setHistoryData(data);

      } catch (err) {
        console.error("Fetching history failed:", err);
        if (!err.message.includes('HTTP error')) {
          setError("Failed to load history. Network error or server issue.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (API_URL) {
      fetchHistory();
    } else {
      setLoading(false); // Stop loading if API_URL is not set
    }

  }, []); // Empty dependency array means this effect runs only once on mount

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

  // Filter data history sesuai range tanggal
  const filteredHistory = historyData.filter(record => {
    if (!startDate || !endDate) return true;
    const tgl = new Date(record.transaction_date).toISOString().split('T')[0];
    return tgl >= startDate && tgl <= endDate;
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        p: theme.spacing(4), // Added padding for better layout
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
          <Typography color="error" variant="h6">Error: {error}</Typography>
        </Box>
      )}

      {/* Filter Preset */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => setPresetRange(7)}>7 Hari Terakhir</Button>
        <Button variant="outlined" onClick={() => setPresetRange(30)}>1 Bulan Terakhir</Button>
        <Button variant="outlined" onClick={() => setPresetRange(90)}>3 Bulan Terakhir</Button>
        <Button variant="outlined" onClick={handleCustom}>Custom</Button>
        {customMode && (
          <>
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
          </>
        )}
      </Box>

      {/* Display History Data or Empty State */}
      {!loading && !error && (
        hasHistory ? (
          <Stack spacing={theme.spacing(2)} direction="column">
            {filteredHistory.map((record) => (
              <Card
                key={record.id} // Use record.id from the database
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
                    cursor: 'pointer', // Indicate clickable, though not implemented yet
                  },
                  width: '100%',
                  maxWidth: 600,
                  mx: 'auto',
                  mb: 2,
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
                  {/* Display transaction details with item name instead of item_id */}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {`${record.transaction_type === 'incoming' ? 'Incoming' : 'Outgoing'} - ${getItemName(record.item_id)}`}
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
            ))}
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
    </Box>
  );
}

export default History;