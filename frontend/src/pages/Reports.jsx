import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  // InputBase, // Hapus import InputBase jika sudah tidak dipakai langsung
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
  Divider,
} from '@mui/material';
import { ArrowBack, ArrowForward, Edit, Delete } from '@mui/icons-material';
// Import komponen SearchInput yang reusable
import SearchInput from '../components/SearchInput'; // Sesuaikan path

const reports = [
  { id: '001', jenis: 'Stock In', tanggal: '2025-04-01' },
  { id: '002', jenis: 'Stock Out', tanggal: '2025-04-03' },
  { id: '003', jenis: 'Stock Adjustment', tanggal: '2025-04-05' },
];

const Report = () => {
  // State untuk search query tetap di komponen induk
  const [searchQuery, setSearchQuery] = useState('');

  // Handler untuk update state (dipanggil dari komponen anak)
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Logika Filtering tetap di komponen induk
  const filteredReports = reports.filter(report => {
    const query = searchQuery.toLowerCase();
    return (
      report.id.toLowerCase().includes(query) ||
      report.jenis.toLowerCase().includes(query) ||
      report.tanggal.includes(query)
    );
  });

  return (
    <Box sx={{ p: 4 }}>
      {/* Cards */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={4}>
        <Card sx={{ flex: 1, p: 3, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
          <Typography variant="h6">Total Transactions</Typography>
          <Typography variant="h4" fontWeight="bold" mt={1}>120</Typography>
        </Card>
        <Card sx={{ flex: 1, p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
          <Typography variant="h6">Total Stock Items</Typography>
          <Typography variant="h4" fontWeight="bold" mt={1}>350</Typography>
        </Card>
      </Stack>

      {/* Actions */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        mb={2}
         flexWrap="wrap" // Tambahkan ini agar responsif di layar kecil
      >
        <Button variant="contained" size="small">
          Add Report
        </Button>
        {/* Gunakan komponen SearchInput */}
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          placeholder="Search report..." // Berikan placeholder spesifik
        />
      </Stack>

      {/* Table - menggunakan filteredReports dari state di induk */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>ID</TableCell>
                <TableCell>Jenis</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{report.jenis}</TableCell>
                  <TableCell>{report.tanggal}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton size="small" color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
               {filteredReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No reports found matching the criteria.
                  </TableCell>
                </TableRow>
              )}
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