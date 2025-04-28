import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  // Hapus import Dialog, DialogTitle, DialogContent, DialogActions
  // Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Import komponen filter, sort, search
import SearchInput from '../components/SearchInput'; // Sesuaikan path
import StockFiltersAndSortControls from '../components/StockFiltersAndSortControls'; // Sesuaikan path
// Import komponen modal delete yang baru
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'; // Sesuaikan path


// Ambil URL Backend dari environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Helper untuk membangun query string
const buildQueryString = (filters) => {
    const params = new URLSearchParams();
    if (filters.filterCategory) params.append('category', filters.filterCategory);
    if (filters.filterSupplier) params.append('supplier', filters.filterSupplier);
    if (filters.sortOrder) params.append('sort', filters.sortOrder);
    if (filters.searchQuery) params.append('q', filters.searchQuery);
    return params.toString();
};

// Helper untuk mendapatkan token autentikasi
const getAuthToken = () => {
    return localStorage.getItem('token'); // Sesuaikan dengan implementasi Anda
};


const StockManagement = () => {
  // State data dan loading utama
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State filter, sort, search
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk modal konfirmasi delete
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  // State untuk loading dan error khusus proses delete
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);


  // --- Logika Fetch Data dari Backend ---
  const fetchItems = async () => {
    setLoading(true);
    setError(null); // Reset error utama

    const queryString = buildQueryString({
        filterCategory,
        filterSupplier,
        sortOrder,
        searchQuery
    });

    const token = getAuthToken();
    if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        // Mungkin arahkan ke halaman login
        return;
    }

    try {
      const response = await fetch(`${API_URL}/api/stock?${queryString}`, {
           headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
           }
      });

      if (!response.ok) {
           if (response.status === 401 || response.status === 403) {
               setError("Authentication error: Please login again.");
           } else {
               setError(`Failed to fetch items: ${response.statusText}`);
           }
           throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setItems(data);

    } catch (error) {
      console.error("Fetching items failed:", error);
       if (!error.message.includes('HTTP error')) {
           setError("Failed to load items. Network error or server issue.");
       }

    } finally {
      setLoading(false);
    }
  };

  // Effect dijalankan saat komponen pertama kali render dan saat filter/sort/search berubah
  useEffect(() => {
    fetchItems();
  }, [filterCategory, filterSupplier, sortOrder, searchQuery]);


  // --- Handler untuk Modal Delete dan Aksi Delete ---

  const handleDeleteClick = (id) => {
      setSelectedItemId(id);
      setDeleteError(null); // Reset delete error sebelum membuka modal
      setOpenConfirm(true);
  };

  const handleCancelDelete = () => {
      setOpenConfirm(false);
      setSelectedItemId(null);
      setDeleteError(null); // Pastikan error juga direset saat batal
  };

  const handleConfirmDelete = async () => {
      setDeleteLoading(true); // Set loading saat memulai proses delete
      setDeleteError(null); // Reset error

      const token = getAuthToken();
      if (!token) {
          setDeleteError("Authentication token missing. Cannot delete.");
          setDeleteLoading(false);
          // Mungkin arahkan ke login atau tampilkan pesan error umum
          return;
      }

      try {
          const response = await fetch(`${API_URL}/api/stock/${selectedItemId}`, {
              method: 'DELETE',
              headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json'
              }
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || errorData.error || response.statusText); // Ambil pesan error dari backend
          }

          // Jika berhasil, fetch ulang data
          fetchItems();

          // Tutup modal setelah berhasil
          setOpenConfirm(false);
          setSelectedItemId(null);

      } catch (error) {
          console.error("Deleting item failed:", error);
          // Tampilkan pesan error di dalam modal delete
          setDeleteError(`Gagal menghapus: ${error.message}`);
           // Jangan tutup modal otomatis agar user bisa lihat error
          // setOpenConfirm(false);
          // setSelectedItemId(null); // Keep selectedItemId to show in modal
      } finally {
          setDeleteLoading(false); // Selesai loading
      }
  };


  // --- Handler untuk Aksi Lain (Edit, Add, In/Out) ---
  const handleEdit = (id) => {
    console.log('Edit item with ID:', id);
    // TODO: Implementasi Edit (membutuhkan form/modal edit dan panggilan API PUT)
  };

  const handleAddItem = () => {
       console.log('Add Item clicked');
       // TODO: Implementasi Add (membutuhkan form/modal add dan panggilan API POST)
    };

    const handleIncomingGoods = () => {
        console.log('Incoming Goods clicked');
    };

    const handleOutgoingGoods = () => {
        console.log('Outgoing Goods clicked');
    };


  // Handlers untuk filter, sort, dan search - hanya update state
  const handleSearchChange = (event) => { setSearchQuery(event.target.value); };
  const handleFilterCategoryChange = (event) => { setFilterCategory(event.target.value); };
  const handleFilterSupplierChange = (event) => { setFilterSupplier(event.target.value); };
  const handleSortOrderChange = (event) => { setSortOrder(event.target.value); };


  // --- Tampilan Komponen ---

  // Tampilkan loading atau error state utama
  if (loading) {
      return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading Stock Data...</Typography></Box>;
  }

  if (error) {
      return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="error">Error: {error}</Typography></Box>;
  }


  return (
    <Box sx={{ p: 4 }}>
      {/* Top Buttons */}
      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
        <Button variant="contained" size="small" color="primary" onClick={handleAddItem} >Add Item</Button>
        <Button variant="contained" size="small" color="primary" onClick={handleIncomingGoods} >Incoming Goods</Button>
        <Button variant="contained" size="small" color="primary" onClick={handleOutgoingGoods} >Outgoing Goods</Button>
      </Stack>

      {/* Filters, Sort, and Search */}
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
        <StockFiltersAndSortControls
          filterCategory={filterCategory}
          onFilterCategoryChange={handleFilterCategoryChange}
          filterSupplier={filterSupplier}
          onFilterSupplierChange={handleFilterSupplierChange}
          sortOrder={sortOrder}
          onSortOrderChange={handleSortOrderChange}
        />
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          placeholder="Search by ID or Name..."
        />
      </Stack>

      {/* Items Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Status</TableCell>
                 <TableCell>UoM</TableCell>
                 <TableCell>Remarks</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.price ? `Rp ${item.price.toLocaleString('id-ID')}` : 'N/A'}</TableCell>
                    <TableCell>{item.stock !== undefined ? item.stock : 'N/A'}</TableCell> {/* Gunakan item.stock */}
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          px: 2, py: 0.5, borderRadius: 999, display: 'inline-block',
                          bgcolor: item.status === 'Available' ? 'success.light' : 'error.light',
                          color: item.status === 'Available' ? 'success.contrastText' : 'error.contrastText',
                          fontSize: '0.8rem',
                        }}
                      >
                        {item.status}
                      </Typography>
                    </TableCell>
                     <TableCell>{item.uom || 'N/A'}</TableCell>
                     <TableCell>{item.remarks || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small" color="primary"
                          onClick={() => handleEdit(item.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small" color="error"
                          onClick={() => handleDeleteClick(item.id)} // Membuka modal delete
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                   <TableCell colSpan={10} align="center">
                     No items found matching the criteria.
                   </TableCell>
                 </TableRow>
               )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Render komponen Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openConfirm} // Dikontrol oleh state openConfirm
        onClose={handleCancelDelete} // Handler untuk menutup modal
        onConfirm={handleConfirmDelete} // Handler saat konfirmasi delete
        itemId={selectedItemId} // Pass ID item yang dipilih
        loading={deleteLoading} // Pass state loading delete
        error={deleteError} // Pass state error delete
      />
    </Box>
  );
};

export default StockManagement;