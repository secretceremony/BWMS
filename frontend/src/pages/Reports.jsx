import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { 
  ArrowBack, 
  ArrowForward, 
  Edit, 
  Delete, 
  InfoOutlined, 
  Add as AddIcon 
} from '@mui/icons-material';
import SearchInput from '../components/SearchInput';
import ReportForm from '../components/ReportForm';

// Get Backend URL from environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get authentication token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const Report = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  
  // State untuk integrasi backend
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [stockItems, setStockItems] = useState(0);

  // State untuk form dialog
  const [openForm, setOpenForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  // State untuk dialog konfirmasi hapus
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fungsi untuk mengambil data history dari backend
  const fetchReportData = async () => {
    if (!API_URL) {
      setError("Konfigurasi aplikasi error: API URL tidak tersedia.");
      setLoading(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("Token autentikasi tidak ditemukan. Silakan login.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mengambil data history dari backend
      const response = await fetch(`${API_URL}/api/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Sesi login telah berakhir. Silakan login kembali.");
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Format data history menjadi format reports yang dibutuhkan
      const formattedReports = data.map(item => ({
        id: item.id,
        jenis: item.transaction_type === 'incoming' ? 'Stock In' : 
               item.transaction_type === 'outgoing' ? 'Stock Out' : 
               'Stock Adjustment',
        tanggal: new Date(item.transaction_date).toISOString().split('T')[0],
        item_id: item.item_id,
        quantity: Math.abs(item.quantity_change),
        remarks: item.remarks
      }));

      setReports(formattedReports);
      setTotalItems(formattedReports.length);

      // Mengambil data total stok
      try {
        const stockResponse = await fetch(`${API_URL}/api/stock`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (stockResponse.ok) {
          const stockData = await stockResponse.json();
          setStockItems(stockData.length); 
        }
      } catch (stockErr) {
        console.error("Error fetching stock data:", stockErr);
      }

    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Terjadi kesalahan saat mengambil data laporan.");
    } finally {
      setLoading(false);
    }
  };

  // Memanggil fungsi fetchReportData saat komponen dimuat
  useEffect(() => {
    fetchReportData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const filteredReports = reports.filter((report) => {
    const query = searchQuery.toLowerCase();
    return (
      report.id.toString().includes(query) ||
      report.jenis.toLowerCase().includes(query) ||
      report.tanggal.includes(query) ||
      (report.remarks && report.remarks.toLowerCase().includes(query))
    );
  });

  const paginatedReports = filteredReports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handler untuk menyegarkan data
  const handleRefresh = () => {
    fetchReportData();
  };

  // Handler untuk membuka form tambah laporan
  const handleOpenAddForm = () => {
    setIsEdit(false);
    setEditData(null);
    setFormError(null);
    setOpenForm(true);
  };

  // Handler untuk membuka form edit laporan
  const handleOpenEditForm = (reportData) => {
    setIsEdit(true);
    setEditData(reportData);
    setFormError(null);
    setOpenForm(true);
  };

  // Handler untuk submit form (baik tambah maupun edit)
  const handleFormSubmit = async (transactionType, formData) => {
    setFormLoading(true);
    setFormError(null);

    // Tentukan endpoint berdasarkan tipe transaksi
    const endpoint = transactionType === 'incoming' ? 'stock/incoming' : 'stock/outgoing';

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan.");
      }

      // Kirim data ke backend
      const response = await fetch(`${API_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Tutup form dan refresh data
      setOpenForm(false);
      fetchReportData();

    } catch (err) {
      console.error(`Error ${isEdit ? 'updating' : 'adding'} report:`, err);
      setFormError(err.message || `Terjadi kesalahan saat ${isEdit ? 'memperbarui' : 'menambahkan'} laporan.`);
    } finally {
      setFormLoading(false);
    }
  };

  // Handler untuk membuka dialog konfirmasi hapus
  const handleOpenDeleteDialog = (report) => {
    setItemToDelete(report);
    setOpenDeleteDialog(true);
  };

  // Handler untuk menghapus laporan
  const handleDeleteReport = async () => {
    // Catatan: Karena kita tidak memiliki endpoint khusus untuk menghapus history,
    // fungsi ini hanya akan menutup dialog dan memberikan pesan informasi bahwa
    // fitur ini belum diimplementasikan di backend
    setDeleteLoading(true);
    
    try {
      // Di sini seharusnya ada kode untuk memanggil API hapus history
      // tetapi karena belum diimplementasikan, kita hanya simulasi delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Tampilkan error bahwa fitur belum tersedia
      alert('Fitur hapus history belum diimplementasikan di backend.');
      
      // Tutup dialog
      setOpenDeleteDialog(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting report:', err);
    } finally {
      setDeleteLoading(false);
    }
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
          <Typography variant="h6">Total Transaksi</Typography>
          <Typography variant="h4" fontWeight="bold" mt={1}>
            {totalItems}
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
          <Typography variant="h6">Total Item Stok</Typography>
          <Typography variant="h4" fontWeight="bold" mt={1}>
            {stockItems}
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
        <Button 
          variant="contained" 
          size="medium" 
          fullWidth 
          sx={{ maxWidth: { sm: 200 } }}
          onClick={handleOpenAddForm}
          startIcon={<AddIcon />}
        >
          Tambah Laporan
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleRefresh}
          >
            Segarkan
          </Button>
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Cari laporan..."
          />
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card elevation={3}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Kuantitas</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Keterangan</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedReports.length > 0 ? (
                  paginatedReports.map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>{report.id}</TableCell>
                      <TableCell>{report.jenis}</TableCell>
                      <TableCell>{report.tanggal}</TableCell>
                      <TableCell>{report.quantity}</TableCell>
                      <TableCell>{report.remarks || '-'}</TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenEditForm(report)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleOpenDeleteDialog(report)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                        <InfoOutlined sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {reports.length === 0 ? 'Belum ada data transaksi.' : 'Tidak ada laporan yang sesuai dengan kriteria pencarian.'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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
          Halaman {page + 1} dari {Math.max(1, Math.ceil(filteredReports.length / rowsPerPage))}
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

      {/* Form Dialog untuk Tambah/Edit Laporan */}
      <ReportForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        error={formError}
        isEdit={isEdit}
        editData={editData}
      />

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus laporan ini?
            {itemToDelete && (
              <>
                <br /><br />
                <strong>ID:</strong> {itemToDelete.id}<br />
                <strong>Jenis:</strong> {itemToDelete.jenis}<br />
                <strong>Tanggal:</strong> {itemToDelete.tanggal}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Batal
          </Button>
          <Button 
            onClick={handleDeleteReport} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Report;