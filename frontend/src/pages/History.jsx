import React, { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Card, CardContent, Avatar, useTheme, CircularProgress
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

const History = () => {
  const theme = useTheme();

  // State for fetched history data
  const [historyData, setHistoryData] = useState([]);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState(null);

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
        // TODO: Replace with your actual backend endpoint for history data
        // This endpoint should return a list of transaction objects
        const response = await fetch(`${API_URL}/api/history`, { // Assuming a /api/history endpoint
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
        // Assuming the backend returns an array of history records like:
        // { id, item_id, quantity_change, transaction_type, transaction_date, remarks, created_at }
        setHistoryData(data); // Set the fetched data to state

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

  // Determine if there is data to display
  const hasHistory = historyData && historyData.length > 0;

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

      {/* Display History Data or Empty State */}
      {!loading && !error && (
        hasHistory ? (
          <Stack spacing={theme.spacing(2)}>
            {historyData.map((record) => (
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
                  {/* Display transaction details */}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {`${record.transaction_type === 'incoming' ? 'Incoming' : 'Outgoing'} - Item Name: ${record.item_id}`} 
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