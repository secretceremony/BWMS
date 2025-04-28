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
  // Hapus import Dialog, DialogTitle, DialogContent, DialogActions jika hanya dipakai di modal terpisah
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Import komponen filter, sort, search
import SearchInput from '../components/SearchInput';
import StockFiltersAndSortControls from '../components/StockFiltersAndSortControls';
// Import komponen modal delete dan form yang baru
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import StockForm from '../components/StockForm'; // Import komponen form


// Ambil URL Backend dari environment variable
// Pastikan nama variabel environment sesuai dengan build tool Anda (misal: VITE_API_BASE_URL untuk Vite)
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';


// Helper untuk membangun query string
const buildQueryString = (filters) => {
    const params = new URLSearchParams();
    if (filters.filterCategory) params.append('category', filters.filterCategory);
    if (filters.filterSupplier) params.append('supplier', filters.supplier); // Perbaiki ini? Sebelumnya filterSupplier? Sesuaikan nama prop
    if (filters.sortOrder) params.append('sort', filters.sortOrder);
    if (filters.searchQuery) params.append('q', filters.searchQuery);
    // Tambahkan filter lain jika ada
    return params.toString();
};

// Helper untuk mendapatkan token autentikasi
const getAuthToken = () => {
    // Ganti ini dengan cara Anda menyimpan dan mendapatkan token setelah login
    return localStorage.getItem('token');
};


const StockManagement = () => {
  // State data dan loading utama
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State filter, sort, search
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState(''); // Perbaiki nama state jika perlu
  const [sortOrder, setSortOrder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk modal konfirmasi delete
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // State untuk modal form Tambah/Edit
  const [openForm, setOpenForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null); // null = mode tambah, object = mode edit
  const [saveLoading, setSaveLoading] = useState(false); // Loading saat simpan form
  const [saveError, setSaveError] = useState(null); // Error saat simpan form


  // --- Logika Fetch Data dari Backend ---
  const fetchItems = async () => {
    setLoading(true);
    setError(null); // Reset error utama

    // Pastikan nama state yang dilewatkan ke buildQueryString sesuai
    const queryString = buildQueryString({
        filterCategory: filterCategory,
        filterSupplier: filterSupplier, // Pastikan nama ini cocok
        sortOrder: sortOrder,
        searchQuery: searchQuery
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
               'Content-Type': 'application/json' // Meskipun GET, header ini sering disertakan
           }
      });

      if (!response.ok) {
           if (response.status === 401 || response.status === 403) {
               setError("Authentication error: Please login again.");
               // Opsional: Hapus token dan redirect
               // localStorage.removeItem('token');
               // window.location.href = '/login';
           } else {
               // Coba ambil pesan error dari body jika ada
               const errorBody = await response.json().catch(() => ({})); // Catch error if body is not JSON
               setError(`Failed to fetch items: ${errorBody.error || response.statusText}`);
           }
           throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setItems(data); // Asumsi data dari backend sudah dimapping quantity -> stock

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
              throw new Error(errorData.message || errorData.error || response.statusText);
          }

          // Jika berhasil, fetch ulang data
          fetchItems();

          // Tutup modal setelah berhasil
          setOpenConfirm(false);
          setSelectedItemId(null);

      } catch (error) {
          console.error("Deleting item failed:", error);
          setDeleteError(`Gagal menghapus: ${error.message}`);
      } finally {
          setDeleteLoading(false);
      }
  };

  // --- Handler untuk Modal Form Tambah/Edit dan Aksi Simpan ---

  const handleAddItem = () => {
       setItemToEdit(null); // Set itemToEdit menjadi null untuk mode tambah
       setSaveError(null); // Reset save error
       setOpenForm(true); // Buka modal form
    };

  const handleEdit = (id) => {
    console.log('Edit item clicked with ID:', id);
    // Cari item di state items berdasarkan ID
    const item = items.find(item => item.id === id);

    console.log('Items state:', items); // DEBUG: Lihat seluruh state items
    console.log('Found item for editing:', item); // DEBUG: Lihat item yang ditemukan


    if (item) {
        setItemToEdit(item); // Set itemToEdit dengan data item yang ditemukan
        setSaveError(null); // Reset save error
        setOpenForm(true); // Buka modal form
    } else {
        console.error("Item with ID not found for editing:", id);
        // Opsional: Tampilkan pesan error ke user jika item tidak ditemukan
        setError(`Error: Item with ID ${id} not found.`);
    }
  };

  const handleCancelForm = () => {
      setOpenForm(false); // Tutup modal form
      setItemToEdit(null); // Reset itemToEdit
      setSaveError(null); // Reset save error
  };

  const handleSaveItem = async (formData) => {
      setSaveLoading(true); // Set loading saat proses simpan
      setSaveError(null); // Reset save error

      const token = getAuthToken();
      if (!token) {
          setSaveError("Authentication token missing. Cannot save.");
          setSaveLoading(false);
           return;
      }

      // Pastikan formData yang dikirim memiliki struktur yang sesuai dengan backend
      // Misalnya, backend mengharapkan 'quantity', bukan 'stock'
      const dataToSend = { ...formData };
      // Mapping stock kembali ke quantity untuk backend
      dataToSend.quantity = dataToSend.stock;
      delete dataToSend.stock; // Hapus field stock jika backend tidak membutuhkannya


      const method = dataToSend.id ? 'PUT' : 'POST'; // Tentukan method
      const url = dataToSend.id ? `${API_URL}/api/stock/${dataToSend.id}` : `${API_URL}/api/stock`; // Tentukan URL

       // Hapus ID dari body jika mode tambah
       if (method === 'POST') {
           delete dataToSend.id;
       }


      console.log('Saving data:', dataToSend); // DEBUG: Data yang dikirim ke backend
      console.log('Method:', method, 'URL:', url); // DEBUG: Permintaan yang dibuat


      try {
          const response = await fetch(url, {
              method: method,
              headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json'
              },
              body: JSON.stringify(dataToSend) // Kirim data form sebagai JSON
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
               console.error("Save API error response:", errorData); // DEBUG: Respons error dari backend
              throw new Error(errorData.message || errorData.error || response.statusText);
          }

          // Jika berhasil, fetch ulang data untuk memperbarui tabel
          fetchItems();

          // Tutup modal setelah berhasil
          handleCancelForm(); // Panggil handler cancel untuk reset state

      } catch (error) {
          console.error("Saving item failed:", error);
          setSaveError(`Gagal menyimpan data: ${error.message}`);
      } finally {
          setSaveLoading(false); // Selesai loading
      }
  };


    // TODO: Implementasikan handler untuk Incoming/Outgoing Goods
    const handleIncomingGoods = () => {
        console.log('Incoming Goods clicked');
    };

    const handleOutgoingGoods = () => {
        console.log('Outgoing Goods clicked');
    };


  // Handlers untuk filter, sort, search - hanya update state
  const handleSearchChange = (event) => { setSearchQuery(event.target.value); };
  const handleFilterCategoryChange = (event) => { setFilterCategory(event.target.value); };
  const handleFilterSupplierChange = (event) => { setFilterSupplier(event.target.value); }; // Pastikan nama ini cocok
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
        {/* Pastikan nama props sesuai dengan handler di sini */}
        <StockFiltersAndSortControls
          filterCategory={filterCategory}
          onFilterCategoryChange={handleFilterCategoryChange}
          filterSupplier={filterSupplier} // Pastikan nama ini cocok
          onFilterSupplierChange={handleFilterSupplierChange} // Pastikan nama ini cocok
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
                {/* Tambahkan Kolom Part Number */}
                <TableCell>Part Number</TableCell>
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
                    {/* Tampilkan Part Number */}
                     {/* Pastikan item.part_number ada dari backend */}
                    <TableCell>{item.part_number !== undefined ? item.part_number : 'N/A'}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.price ? `Rp ${item.price.toLocaleString('id-ID')}` : 'N/A'}</TableCell>
                    <TableCell>{item.stock !== undefined ? item.stock : 'N/A'}</TableCell>
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
                          onClick={() => handleEdit(item.id)} // Membuka modal edit
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
                   {/* Sesuaikan colSpan dengan jumlah kolom +1 (ID, Name, Part Number, Category, Price, Stock, Supplier, Status, UoM, Remarks, Action = 11) */}
                   <TableCell colSpan={11} align="center">
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
        open={openConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemId={selectedItemId}
        loading={deleteLoading}
        error={deleteError}
      />

      {/* Render komponen Stock Form (untuk Tambah/Edit) */}
      <StockForm
          open={openForm}
          onClose={handleCancelForm}
          onSubmit={handleSaveItem}
          initialData={itemToEdit} // Pass data itemToEdit
          loading={saveLoading}
          error={saveError}
      />
    </Box>
  );
};

export default StockManagement;