import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
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
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const initialItems = [
  { id: '001', name: 'Item A', category: 'Electronics', price: 1500000, stock: 10, supplier: 'Supplier A', status: 'Available' },
  { id: '002', name: 'Item B', category: 'Furniture', price: 750000, stock: 5, supplier: 'Supplier B', status: 'Out of Stock' },
  { id: '003', name: 'Item C', category: 'Apparel', price: 250000, stock: 20, supplier: 'Supplier C', status: 'Available' },
];

const StockManagement = () => {
  const [items, setItems] = useState(initialItems);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedItemId(id);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = () => {
    setItems((prevItems) => prevItems.filter(item => item.id !== selectedItemId));
    setOpenConfirm(false);
    setSelectedItemId(null);
  };

  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setSelectedItemId(null);
  };

  const handleEdit = (id) => {
    console.log('Edit item with ID:', id);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterCategoryChange = (event) => {
    setFilterCategory(event.target.value);
  };

  const handleFilterSupplierChange = (event) => {
    setFilterSupplier(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  let filteredItems = items.filter(item => {
    const matchesCategory = filterCategory === '' || item.category === filterCategory;
    const matchesSupplier = filterSupplier === '' || item.supplier === filterSupplier;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.includes(searchQuery);
    return matchesCategory && matchesSupplier && matchesSearch;
  });

  if (sortOrder === 'stokTerbanyak') {
    filteredItems.sort((a, b) => b.stock - a.stock);
  } else if (sortOrder === 'stokTerkecil') {
    filteredItems.sort((a, b) => a.stock - b.stock);
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Top Buttons */}
      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
        <Button variant="contained" size="small" color="primary">Add Item</Button>
        <Button variant="contained" size="small" color="primary">Incoming Goods</Button>
        <Button variant="contained" size="small" color="primary">Outgoing Goods</Button>
      </Stack>

      {/* Filters and Search */}
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {/* Filter Category */}
          <Select
            displayEmpty
            value={filterCategory}
            onChange={handleFilterCategoryChange}
            size="small"
            sx={{
              bgcolor: 'white',
              px: 2,
              py: 1,
              border: '1px solid',
              borderColor: 'grey.400',
              borderRadius: 1,
              minWidth: 150,
            }}
          >
            <MenuItem value="">
              <em>Filter by Category</em>
            </MenuItem>
            <MenuItem value="Electronics">Electronics</MenuItem>
            <MenuItem value="Furniture">Furniture</MenuItem>
            <MenuItem value="Apparel">Apparel</MenuItem>
          </Select>

          {/* Filter Supplier */}
          <Select
            displayEmpty
            value={filterSupplier}
            onChange={handleFilterSupplierChange}
            size="small"
            sx={{
              bgcolor: 'white',
              px: 2,
              py: 1,
              border: '1px solid',
              borderColor: 'grey.400',
              borderRadius: 1,
              minWidth: 150,
            }}
          >
            <MenuItem value="">
              <em>Filter by Supplier</em>
            </MenuItem>
            <MenuItem value="Supplier A">Supplier A</MenuItem>
            <MenuItem value="Supplier B">Supplier B</MenuItem>
            <MenuItem value="Supplier C">Supplier C</MenuItem>
          </Select>

          {/* Sort */}
          <Select
            displayEmpty
            value={sortOrder}
            onChange={handleSortOrderChange}
            size="small"
            sx={{
              bgcolor: 'white',
              px: 2,
              py: 1,
              border: '1px solid',
              borderColor: 'grey.400',
              borderRadius: 1,
              minWidth: 150,
            }}
          >
            <MenuItem value="">
              <em>Sort by Stock</em>
            </MenuItem>
            <MenuItem value="stokTerbanyak">Stok Terbanyak</MenuItem>
            <MenuItem value="stokTerkecil">Stok Terkecil</MenuItem>
          </Select>
        </Stack>

        {/* Search */}
        <InputBase
          placeholder="Search by ID or Name..."
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          sx={{
            bgcolor: 'white',
            px: 2,
            py: 1,
            border: '1px solid',
            borderColor: 'grey.400',
            borderRadius: 1,
            minWidth: 250,
          }}
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
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>Rp {item.price.toLocaleString('id-ID')}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>
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
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(item.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Delete Confirmation Dialog */}
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
  );
};

export default StockManagement;