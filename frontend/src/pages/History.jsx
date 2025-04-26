import React from 'react';
import { Box, Stack, Typography, Card, CardContent } from '@mui/material';

const notifications = [
  { id: 1, title: 'Stock masuk berhasil', date: '2025-04-20' },
  { id: 2, title: 'Stok habis untuk produk A', date: '2025-04-21' },
  { id: 3, title: 'Penyesuaian stok telah diproses', date: '2025-04-22' },
  { id: 4, title: 'Transaksi baru diterima', date: '2025-04-23' },
  { id: 5, title: 'Pengiriman barang sukses', date: '2025-04-24' },
];

const History = () => {
  return (
    <Box sx={{ minHeight: '100vh', p: 4, bgcolor: 'grey.100' }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>
        History
      </Typography>

      <Stack spacing={2}>
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardContent>
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
