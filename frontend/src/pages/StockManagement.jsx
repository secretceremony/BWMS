import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  InputBase,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

// --- Initial Data ---
const initialItems = [
  {
    id: '001',
    name: 'Item A',
    category: 'Electronics',
    price: 1500000,
    stock: 10,
    supplier: 'Supplier A',
    status: 'Available',
  },
  {
    id: '002',
    name: 'Item B',
    category: 'Furniture',
    price: 750000,
    stock: 5,
    supplier: 'Supplier B',
    status: 'Out of Stock',
  },
  {
    id: '003',
    name: 'Item C',
    category: 'Apparel',
    price: 250000,
    stock: 20,
    supplier: 'Supplier C',
    status: 'Available',
  },
  // Tambahkan item lain jika perlu
];

const StockManagement = () => {
  // --- State ---
  // State utama untuk menyimpan daftar item
  const [items, setItems] = useState(initialItems);

  // State untuk mengontrol filter dan search
  const [filterCategory, setFilterCategory] = useState('');
  // const [searchQuery, setSearchQuery] = useState(''); // State untuk search (belum diimplementasikan logikanya)

  // State untuk mengontrol dialog konfirmasi delete
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // --- Handlers ---
  // Handler untuk klik tombol Delete
  const handleDeleteClick = (id) => {
    setSelectedItemId(id);
    setOpenConfirm(true);
  };

  // Handler untuk konfirmasi Delete pada dialog
  const handleConfirmDelete = () => {
    setItems((prevItems) => prevItems.filter(item => item.id !== selectedItemId));
    setOpenConfirm(false);
    setSelectedItemId(null);
  };

  // Handler untuk batal Delete pada dialog
  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setSelectedItemId(null);
  };

  // Handler untuk klik tombol Edit (masih placeholder)
  const handleEdit = (id) => {
    console.log('Edit item with ID:', id);
    // Nanti bisa redirect ke edit page atau buka modal edit
  };

  // Handler untuk perubahan nilai filter kategori
  const handleFilterChange = (event) => {
      setFilterCategory(event.target.value);
  };

    // Handler untuk perubahan input search (jika diimplementasikan)
    // const handleSearchChange = (event) => {
    //     setSearchQuery(event.target.value);
    // };


  // --- Derived State / Computed Data ---
  // Item yang akan ditampilkan setelah filter dan/atau search diterapkan
  const filteredItems = items.filter(item => {
    // Logika filter berdasarkan kategori yang dipilih
    const categoryMatch = filterCategory === '' || item.category === filterCategory;

    // Logika search (jika search diimplementasikan dan diaktifkan)
    // const searchMatch = searchQuery === '' ||
    //   Object.values(item).some(value =>
    //     String(value).toLowerCase().includes(searchQuery.toLowerCase())
    //   );

    // Gabungkan logika filter dan search
    return categoryMatch; // && searchMatch; // Gabungkan jika search aktif
  });

  // --- Render ---
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        {/* Title */}
        <Typography variant="h4" fontWeight="bold" mb={4}>
          Stock Management
        </Typography>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} mb={4} flexWrap="wrap">
          <Button variant="contained" color="primary">Add Item</Button>
          <Button variant="contained" color="primary">Incoming Goods</Button>
          <Button variant="contained" color="primary">Outgoing Goods</Button>
        </Stack>

        {/* Filter and Search Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}> {/* Added gap for better spacing on wrap */}
          {/* Category Filter Select */}
          <Select
            displayEmpty
            sx={{
              bgcolor: 'white',
              px: 2,
              py: 1,
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
              minWidth: '150px',
            }}
            value={filterCategory} // Hubungkan Select dengan state filterCategory
            onChange={handleFilterChange} // Gunakan handler terpisah
          >
            <MenuItem value=""> {/* Nilai kosong untuk opsi "Semua Kategori" */}
              <em>Filter by Category</em>
            </MenuItem>
            <MenuItem value="Electronics">Electronics</MenuItem>
            <MenuItem value="Furniture">Furniture</MenuItem>
            <MenuItem value="Apparel">Apparel</MenuItem>
            {/* Tambahkan MenuItem lain sesuai kategori item Anda */}
          </Select>

          {/* Search Input */}
          <InputBase
            placeholder="Search..."
            sx={{
              bgcolor: 'white',
              px: 2,
              py: 0.5,
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
              width: { xs: '100%', sm: '200px' }, // Responsif width
            }}
             // Hubungkan InputBase dengan state searchQuery (jika diimplementasikan)
            // value={searchQuery}
            // onChange={handleSearchChange} // Gunakan handler terpisah
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
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Render baris tabel dari filteredItems */}
                {filteredItems.map((item) => (
                  <TableRow key={item.id} hover> {/* Menggunakan item.id sebagai key */}
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>Rp {item.price.toLocaleString('id-ID')}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      {/* Status Badge */}
                      <Typography
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 999,
                          display: 'inline-block',
                          bgcolor: item.status === 'Available' ? 'success.light' : 'error.light',
                          color: item.status === 'Available' ? 'success.contrastText' : 'error.contrastText',
                          fontSize: '0.8rem',
                        }}
                      >
                        {item.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {/* Action Buttons */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(item.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Tampilkan pesan jika tidak ada item setelah difilter/search */}
                {filteredItems.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={8} align="center">
                            No items found matching the criteria.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={openConfirm} onClose={handleCancelDelete}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this item?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
};

export default StockManagement;