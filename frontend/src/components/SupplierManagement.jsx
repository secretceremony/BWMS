import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  TextField,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import SupplierForm from './SupplierForm';

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const SupplierManagement = ({ user }) => {
  // State untuk data supplier
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk form supplier
  const [openForm, setOpenForm] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // State untuk konfirmasi hapus
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Tambahkan state untuk search dan filter abjad
  const [search, setSearch] = useState('');
  const [filterAbjad, setFilterAbjad] = useState('');

  // Fetch data supplier
  const fetchSuppliers = async () => {
    if (!API_URL) {
      setError("API URL tidak dikonfigurasi");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Token autentikasi tidak ditemukan");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/suppliers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError("Gagal mengambil data supplier");
    } finally {
      setLoading(false);
    }
  };

  // Load data saat komponen dimount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter suppliers berdasarkan search dan abjad
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchSearch = !search || supplier.name.toLowerCase().includes(search.toLowerCase());
    const matchAbjad = !filterAbjad || supplier.name.toLowerCase().startsWith(filterAbjad.toLowerCase());
    return matchSearch && matchAbjad;
  });

  // Handler untuk tambah supplier
  const handleAddSupplier = () => {
    setSupplierToEdit(null);
    setSaveError(null);
    setOpenForm(true);
  };

  // Handler untuk edit supplier
  const handleEditSupplier = (supplier) => {
    setSupplierToEdit(supplier);
    setSaveError(null);
    setOpenForm(true);
  };

  // Handler untuk tutup form
  const handleCloseForm = () => {
    setOpenForm(false);
    setSupplierToEdit(null);
    setSaveError(null);
  };

  // Handler untuk simpan supplier (tambah/edit)
  const handleSaveSupplier = async (formData) => {
    if (!API_URL) {
      setSaveError("API URL tidak dikonfigurasi");
      return;
    }

    setSaveLoading(true);
    setSaveError(null);

    const token = getAuthToken();
    if (!token) {
      setSaveError("Token autentikasi tidak ditemukan");
      setSaveLoading(false);
      return;
    }

    const isEdit = !!formData.id;
    const url = isEdit 
      ? `${API_URL}/api/suppliers/${formData.id}` 
      : `${API_URL}/api/suppliers`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Refresh data supplier
      fetchSuppliers();
      
      // Tutup form
      setOpenForm(false);
      setSupplierToEdit(null);
    } catch (error) {
      console.error("Error saving supplier:", error);
      setSaveError(error.message || "Gagal menyimpan data supplier");
    } finally {
      setSaveLoading(false);
    }
  };

  // Handler untuk konfirmasi hapus
  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteError(null);
    setOpenDeleteConfirm(true);
  };

  // Handler untuk batal hapus
  const handleCancelDelete = () => {
    setOpenDeleteConfirm(false);
    setSupplierToDelete(null);
    setDeleteError(null);
  };

  // Handler untuk konfirmasi hapus
  const handleConfirmDelete = async () => {
    if (!API_URL || !supplierToDelete) {
      setDeleteError("API URL tidak dikonfigurasi atau data supplier tidak valid");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    const token = getAuthToken();
    if (!token) {
      setDeleteError("Token autentikasi tidak ditemukan");
      setDeleteLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/suppliers/${supplierToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Refresh data supplier
      fetchSuppliers();
      
      // Tutup dialog konfirmasi
      setOpenDeleteConfirm(false);
      setSupplierToDelete(null);
    } catch (error) {
      console.error("Error deleting supplier:", error);
      setDeleteError(error.message || "Gagal menghapus supplier");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Manajemen Supplier</Typography>
        {user && user.role === 'admin' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddSupplier}
          >
            Tambah Supplier
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Cari supplier..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label="Filter Abjad"
          value={filterAbjad}
          onChange={e => setFilterAbjad(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">Semua</MenuItem>
          {Array.from(new Set(suppliers.map(s => s.name?.[0]?.toUpperCase()).filter(Boolean))).sort().map(huruf => (
            <MenuItem key={huruf} value={huruf}>{huruf}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nama</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Kontak Person</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Telepon</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Alamat</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={30} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Memuat data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="error">{error}</Typography>
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2">
                      Tidak ada data supplier
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier, idx) => (
                  <TableRow
                    key={supplier.id}
                    hover
                    sx={{
                      backgroundColor: !supplier.contact_person ? '#fffde7' : idx % 2 === 0 ? '#fafafa' : 'white'
                    }}
                  >
                    <TableCell>{supplier.id}</TableCell>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contact_person || <span style={{color:'#fbc02d'}}>Tidak ada</span>}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell>{supplier.email || '-'}</TableCell>
                    <TableCell>
                      <Tooltip title={supplier.address || 'Tidak ada alamat'}>
                        <span>{supplier.address ? (supplier.address.length > 25 ? supplier.address.substring(0, 25) + '...' : supplier.address) : '-'}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {user && user.role === 'admin' && (
                        <>
                          <IconButton size="small" color="primary" onClick={() => handleEditSupplier(supplier)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(supplier)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Form Supplier */}
      {user && user.role === 'admin' && (
        <SupplierForm
          open={openForm}
          onClose={handleCloseForm}
          onSubmit={handleSaveSupplier}
          initialData={supplierToEdit}
          loading={saveLoading}
          error={saveError}
        />
      )}

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={openDeleteConfirm}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus supplier "{supplierToDelete?.name}"?
          </DialogContentText>
          {deleteError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleteLoading}>
            Batal
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierManagement; 