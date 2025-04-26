import React from 'react';
import {
  Box,
  Button,
  Card,
  InputBase,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const reports = [
  { id: '001', jenis: 'Stock In', tanggal: '2025-04-01' },
  { id: '002', jenis: 'Stock Out', tanggal: '2025-04-03' },
  { id: '003', jenis: 'Stock Adjustment', tanggal: '2025-04-05' },
];

const Report = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>
        Report
      </Typography>

      {/* Cards */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1, p: 4, minHeight: 100 }}>
          <Typography variant="h6" align="center">Stock Report</Typography>
        </Card>
        <Card sx={{ flex: 1, p: 4, minHeight: 100 }}>
          <Typography variant="h6" align="center">Transaction Report</Typography>
        </Card>
      </Stack>

      {/* Actions */}
      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="contained">Add</Button>
        <Box sx={{ flexGrow: 1 }} />
        <InputBase
          placeholder="Search..."
          sx={{
            bgcolor: 'white',
            px: 2,
            py: 1,
            border: '1px solid',
            borderColor: 'grey.400',
            borderRadius: 1,
            minWidth: 200,
          }}
        />
      </Stack>

      {/* Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>ID</TableCell>
                <TableCell>Jenis</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report, index) => (
                <TableRow key={index} hover>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{report.jenis}</TableCell>
                  <TableCell>{report.tanggal}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} mt={2}>
        <IconButton size="small">
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="body2">1</Typography>
        <IconButton size="small">
          <ArrowForward fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default Report;
