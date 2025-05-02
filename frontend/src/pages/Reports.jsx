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
  useTheme,
} from '@mui/material';
import { ArrowBack, ArrowForward, Edit, Delete } from '@mui/icons-material';
import SearchInput from '../components/SearchInput'; // Adjust path if needed

const reports = [
  { id: '001', jenis: 'Stock In', tanggal: '2025-04-01' },
  { id: '002', jenis: 'Stock Out', tanggal: '2025-04-03' },
  { id: '003', jenis: 'Stock Adjustment', tanggal: '2025-04-05' },
  { id: '004', jenis: 'Stock In', tanggal: '2025-04-06' },
  { id: '005', jenis: 'Stock Out', tanggal: '2025-04-07' },
  { id: '006', jenis: 'Stock In', tanggal: '2025-04-08' },
];

const Report = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const filteredReports = reports.filter((report) => {
    const query = searchQuery.toLowerCase();
    return (
      report.id.toLowerCase().includes(query) ||
      report.jenis.toLowerCase().includes(query) ||
      report.tanggal.includes(query)
    );
  });

  const paginatedReports = filteredReports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        mb={4}
      >
        <Card
          sx={{
            flex: 1,
            p: 3,
            textAlign: 'center',
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[3],
          }}
        >
          <Typography variant="h6">Total Transactions</Typography>
          <Typography variant="h4" fontWeight="bold" mt={1}>
            120
          </Typography>
        </Card>
        <Card
          sx={{
            flex: 1,
            p: 3,
            textAlign: 'center',
            bgcolor: theme.palette.success.main,
            color:
              theme.palette.success.contrastText ||
              theme.palette.common.white,
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[3],
          }}
        >
          <Typography variant="h6">Total Stock Items</Typography>
          <Typography variant="h4" fontWeight="bold" mt={1}>
            350
          </Typography>
        </Card>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        mb={3}
      >
        <Button variant="contained" size="medium" fullWidth sx={{ maxWidth: { sm: 200 } }}>
          Add Report
        </Button>
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          placeholder="Search report..."
        />
      </Stack>

      <Card elevation={3}>
        <TableContainer
          component={Paper}
          sx={{ overflowX: 'auto' }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Jenis</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{report.jenis}</TableCell>
                  <TableCell>{report.tanggal}</TableCell>
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                    >
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
              {paginatedReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No reports found matching the criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={1}
        mt={2}
        flexWrap="wrap"
      >
        <Typography variant="body2">
          Page {page + 1} of {Math.ceil(filteredReports.length / rowsPerPage)}
        </Typography>
        <IconButton
          size="small"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
        >
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="body2">{page + 1}</Typography>
        <IconButton
          size="small"
          onClick={() => handlePageChange(page + 1)}
          disabled={
            page >= Math.ceil(filteredReports.length / rowsPerPage) - 1
          }
        >
          <ArrowForward fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default Report;