import React from 'react';
import { Box } from '@mui/material';

function TransactionTable({ data }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', fontWeight: 'bold', borderBottom: '1px solid #ddd', pb: 1, mb: 1 }}>
        <Box sx={{ flex: '0 0 40%' }}>Item</Box>
        <Box sx={{ flex: '0 0 20%' }}>Quantity</Box>
        <Box sx={{ flex: '0 0 20%' }}>Type</Box>
        <Box sx={{ flex: '0 0 20%' }}>Date</Box>
      </Box>
      {data.map((row) => (
        <Box key={row.id} sx={{ display: 'flex', py: 1, borderBottom: '1px solid #eee' }}>
          <Box sx={{ flex: '0 0 40%' }}>{row.item}</Box>
          <Box sx={{ flex: '0 0 20%' }}>{row.quantity}</Box>
          <Box sx={{ flex: '0 0 20%' }}>{row.type}</Box>
          <Box sx={{ flex: '0 0 20%' }}>{row.date}</Box>
        </Box>
      ))}
    </Box>
  );
}

export default TransactionTable;