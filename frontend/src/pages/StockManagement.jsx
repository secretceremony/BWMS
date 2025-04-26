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
];

const StockManagement = () => {
  const [items, setItems] = useState(initialItems);
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
    // Nanti bisa redirect ke edit page atau buka modal edit
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" mb={4}>
          Stock Management
        </Typography>

        <Stack direction="row" spacing={2} mb={4} flexWrap="wrap">
          <Button variant="contained" color="primary">Add Item</Button>
          <Button variant="contained" color="primary">Incoming Goods</Button>
          <Button variant="contained" color="primary">Outgoing Goods</Button>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap">
  <Select
    defaultValue=""
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
  >
    <MenuItem value="">
      <em>Filter by Category</em>
    </MenuItem>
    <MenuItem value="Electronics">Electronics</MenuItem>
    <MenuItem value="Furniture">Furniture</MenuItem>
    <MenuItem value="Apparel">Apparel</MenuItem>
  </Select>

  <InputBase
    placeholder="Search..."
    sx={{
      bgcolor: 'white',
      px: 2,
      py: 0.5,
      border: '1px solid',
      borderColor: 'grey.300',
      borderRadius: 1,
      width: '200px', // kecilin width
    }}
  />
</Stack>
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
                {items.map((item, index) => (
                  <TableRow key={index} hover>
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
                    <TableCell>
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
