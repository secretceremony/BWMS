import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
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
  useTheme, // Import useTheme
} from '@mui/material';
import { ArrowBack, ArrowForward, Edit, Delete } from '@mui/icons-material';
// Import komponen SearchInput yang reusable
import SearchInput from '../components/SearchInput'; // Sesuaikan path

const reports = [
  { id: '001', jenis: 'Stock In', tanggal: '2025-04-01' },
  { id: '002', jenis: 'Stock Out', tanggal: '2025-04-03' },
  { id: '003', jenis: 'Stock Adjustment', tanggal: '2025-04-05' },
  { id: '004', jenis: 'Stock In', tanggal: '2025-04-06' },
  { id: '005', jenis: 'Stock Out', tanggal: '2025-04-07' },
  { id: '006', jenis: 'Stock In', tanggal: '2025-04-08' },
];

const Report = () => {
  const theme = useTheme(); // Use the theme hook

  const [searchQuery, setSearchQuery] = useState('');
  // State for pagination (example)
  const [page, setPage] = useState(0);
  const rowsPerPage = 5; // Example: show 5 rows per page

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page on search
  };

  const filteredReports = reports.filter(report => {
    const query = searchQuery.toLowerCase();
    return (
      report.id.toLowerCase().includes(query) ||
      report.jenis.toLowerCase().includes(query) ||
      report.tanggal.includes(query) // Date might need different matching if format varies
    );
  });

  // Apply pagination
  const paginatedReports = filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };


  return (
    <Box sx={{ p: theme.spacing(4) }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={theme.spacing(3)} mb={theme.spacing(4)}> {/* Increased spacing slightly */}
        <Card sx={{
            flex: 1,
            p: theme.spacing(3), // Use theme spacing
            textAlign: 'center',
            // Use theme colors for background and text
            bgcolor: theme.palette.primary.main, // Using main primary color
            color: theme.palette.primary.contrastText, // Using contrasting text color
            borderRadius: theme.shape.borderRadius, // Use theme border radius
            boxShadow: theme.shadows[3], // Use theme shadow
        }}>
          <Typography variant="h6">Total Transactions</Typography>
          <Typography variant="h4" fontWeight="bold" mt={theme.spacing(1)}>120</Typography> {/* Use theme spacing */}
        </Card>
        <Card sx={{
            flex: 1,
            p: theme.spacing(3), // Use theme spacing
            textAlign: 'center',
            // Use theme colors for background and text
            bgcolor: theme.palette.success.main, // Using main success color (requires success palette in theme)
            color: theme.palette.success.contrastText || theme.palette.common.white, // Using contrasting text color, fallback to white
            borderRadius: theme.shape.borderRadius, // Use theme border radius
            boxShadow: theme.shadows[3], // Use theme shadow
        }}>
          <Typography variant="h6">Total Stock Items</Typography>
          <Typography variant="h4" fontWeight="bold" mt={theme.spacing(1)}>350</Typography> {/* Use theme spacing */}
        </Card>
        {/* Add more cards here if needed */}
      </Stack>

      {/* Actions & Search */}
      {/* Use theme spacing for Stack and margin bottom */}
      <Stack
        direction="row"
        spacing={theme.spacing(2)} // Use theme spacing
        alignItems="center"
        justifyContent="space-between"
        mb={theme.spacing(3)} // Use theme spacing
        flexWrap="wrap"
      >
        {/* Button uses theme primary color by default */}
        <Button variant="contained" size="medium"> {/* Changed size to medium */}
          Add Report
        </Button>
        {/* SearchInput component - Assuming it uses theme styles internally */}
        <Box sx={{ minWidth: 200 }}> {/* Give search input a minimum width */}
            <SearchInput
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder="Search report..."
            />
        </Box>
      </Stack>

      {/* Report Table */}
      <Card elevation={3}> {/* Added elevation for the main table card */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              {/* Use theme grey or action.hover for header background */}
              <TableRow sx={{ bgcolor: theme.palette.grey[100] }}> {/* Use theme grey */}
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell> {/* Added bold */}
                <TableCell sx={{ fontWeight: 'bold' }}>Jenis</TableCell> {/* Added bold */}
                <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell> {/* Added bold */}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell> {/* Added bold */}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Use paginatedReports */}
              {paginatedReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{report.jenis}</TableCell>
                  <TableCell>{report.tanggal}</TableCell>
                  <TableCell align="center">
                    {/* Use theme spacing for Stack */}
                    <Stack direction="row" spacing={theme.spacing(1)} justifyContent="center">
                      {/* IconButtons use theme colors (primary/error) */}
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
               {/* Empty state row */}
               {paginatedReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: theme.spacing(3) }}> {/* Use theme spacing */}
                    No reports found matching the criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      {/* Use theme spacing for Stack and margin top */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={theme.spacing(1)} mt={theme.spacing(2)}>
        {/* Pagination logic example */}
        <Typography variant="body2">
            Page {page + 1} of {Math.ceil(filteredReports.length / rowsPerPage)}
        </Typography>
        <IconButton size="small" onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="body2">{page + 1}</Typography> {/* Display current page number */}
        <IconButton size="small" onClick={() => handlePageChange(page + 1)} disabled={page >= Math.ceil(filteredReports.length / rowsPerPage) - 1}>
          <ArrowForward fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default Report;