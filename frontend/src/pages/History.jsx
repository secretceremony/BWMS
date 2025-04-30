import React from 'react';
import {
  Box, Stack, Typography, Card, CardContent, Avatar, useTheme
} from '@mui/material';
import {
  ArrowDownward as IncomingIcon,
  ArrowUpward as OutgoingIcon,
  NotificationsNone as DefaultIcon,
  InfoOutlined as InfoIcon // Icon for empty state
} from '@mui/icons-material';

// Assuming notifications data will come from an API in a real app
// Using static data for layout improvisation
const notifications = [
  { id: 1, title: 'Stock masuk berhasil', date: '2025-04-20', type: 'incoming' },
  { id: 2, title: 'Stok habis untuk produk A', date: '2025-04-21', type: 'outgoing' },
  { id: 3, title: 'Penyesuaian stok telah diproses', date: '2025-04-22', type: 'incoming' },
  { id: 4, title: 'Transaksi baru diterima', date: '2025-04-23', type: 'incoming' },
  { id: 5, title: 'Pengiriman barang sukses', date: '2025-04-24', type: 'outgoing' },
];

// Example of an empty state notification array
// const notifications = [];


const History = () => {
  const theme = useTheme();

  const getIcon = (type) => {
    switch (type) {
      case 'incoming':
        // Icons color is set by the Avatar's 'color' prop
        return <IncomingIcon />;
      case 'outgoing':
        // Icons color is set by the Avatar's 'color' prop
        return <OutgoingIcon />;
      default:
        // Default icon, uses Avatar's default or inherited color (often action)
        return <DefaultIcon />;
    }
  };

  // Check if notifications array is empty
  const hasNotifications = notifications && notifications.length > 0;

return (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      p: 0,
    }}
  >
    {/* Add a title for the page */}
    <Typography variant="h4" component="h1" gutterBottom sx={{ mb: theme.spacing(3) }}>
      Notification History
    </Typography>

    {hasNotifications ? (
      // Stack for the list of notifications
      <Stack spacing={theme.spacing(2)}>
        {notifications.map((notification) => (
          <Card
            key={notification.id}
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
            }}
          >
            <Avatar
              sx={{
                bgcolor:
                  notification.type === 'incoming'
                    ? theme.palette.success.light
                    : theme.palette.error.light,
                color:
                  notification.type === 'incoming'
                    ? theme.palette.success.dark
                    : theme.palette.error.dark,
                m: theme.spacing(2),
              }}
            >
              {getIcon(notification.type)}
            </Avatar>
            <CardContent
              sx={{
                flex: 1,
                p: theme.spacing(2),
                '&:last-child': { pb: theme.spacing(2) },
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {notification.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notification.date}
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
          No notifications yet.
        </Typography>
        <Typography variant="body1">
          Check back later for updates on stock movements and system events.
        </Typography>
      </Box>
    )}
  </Box>
);
}

export default History;