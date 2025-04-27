import React from 'react';
import {
  Box, Stack, Typography, Card, CardContent, Avatar, useTheme
} from '@mui/material';
import {
  ArrowDownward as IncomingIcon,
  ArrowUpward as OutgoingIcon,
  NotificationsNone as DefaultIcon,
} from '@mui/icons-material';

const notifications = [
  { id: 1, title: 'Stock masuk berhasil', date: '2025-04-20', type: 'incoming' },
  { id: 2, title: 'Stok habis untuk produk A', date: '2025-04-21', type: 'outgoing' },
  { id: 3, title: 'Penyesuaian stok telah diproses', date: '2025-04-22', type: 'incoming' },
  { id: 4, title: 'Transaksi baru diterima', date: '2025-04-23', type: 'incoming' },
  { id: 5, title: 'Pengiriman barang sukses', date: '2025-04-24', type: 'outgoing' },
];

const History = () => {
  const theme = useTheme();

  const getIcon = (type) => {
    switch (type) {
      case 'incoming':
        return <IncomingIcon sx={{ color: theme.palette.success.main }} />;
      case 'outgoing':
        return <OutgoingIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <DefaultIcon color="action" />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', p: { xs: 2, md: 4 }, bgcolor: 'grey.100' }}>
      <Stack spacing={2}>
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              boxShadow: 2,
              transition: '0.3s',
              '&:hover': {
                boxShadow: 5,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: notification.type === 'incoming'
                  ? theme.palette.success.light
                  : theme.palette.error.light,
                color: notification.type === 'incoming'
                  ? theme.palette.success.dark
                  : theme.palette.error.dark,
                m: 2,
              }}
            >
              {getIcon(notification.type)}
            </Avatar>

            <CardContent sx={{ flex: 1 }}>
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
    </Box>
  );
};

export default History;