// src/components/StockFiltersAndSortControls.js
import React from 'react';
import { Select, MenuItem, Stack, FormControl, InputLabel } from '@mui/material';

// Opsi filter Category dan Supplier sekarang tidak pakai array di sini karena jadi text input
// Opsi Sort
const sortOptions = [
    { value: 'stokTerbanyak', label: 'Stok Terbanyak' },
    { value: 'stokTerkecil', label: 'Stok Terkecil' },
    // Anda bisa tambahkan opsi sort lain berdasarkan kolom lain di sini
    // { value: 'nameAsc', label: 'Nama (A-Z)' },
    // { value: 'nameDesc', label: 'Nama (Z-A)' },
];


const StockFiltersAndSortControls = ({
  filterCategory, // Sekarang string
  onFilterCategoryChange,
  filterSupplier, // Sekarang string
  onFilterSupplierChange,
  sortOrder,
  onSortOrderChange,
  // Jika ada filter status/uom di sini (bukan di form), sesuaikan props
}) => {
  const controlStyles = {
    bgcolor: 'white',
    px: 2,
    py: 1,
    border: '1px solid',
    borderColor: 'grey.400',
    borderRadius: 1,
  };

  return (
    <Stack direction="row" spacing={2} flexWrap="wrap">
      {/* Filter Category (sekarang Select jika Anda ingin dropdown opsi di sini) */}
      {/* Mengembalikan ke Select berdasarkan diskusi sebelumnya */}
       <FormControl size="small" sx={{ ...controlStyles, minWidth: 150 }}>
           <InputLabel shrink>Category</InputLabel>
           <Select
             displayEmpty
             value={filterCategory}
             onChange={onFilterCategoryChange}
             label="Category"
             inputProps={{ 'aria-label': 'Filter by Category' }}
           >
             <MenuItem value=""><em>Filter by Category</em></MenuItem>
             {/* Opsi hardcode atau ambil dari API */}
             <MenuItem value="Electronics">Electronics</MenuItem>
             <MenuItem value="Furniture">Furniture</MenuItem>
             <MenuItem value="Apparel">Apparel</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
           </Select>
       </FormControl>


      {/* Filter Supplier (mengembalikan ke Select) */}
       <FormControl size="small" sx={{ ...controlStyles, minWidth: 150 }}>
           <InputLabel shrink>Supplier</InputLabel>
           <Select
             displayEmpty
             value={filterSupplier}
             onChange={onFilterSupplierChange}
             label="Supplier"
              inputProps={{ 'aria-label': 'Filter by Supplier' }}
           >
             <MenuItem value=""><em>Filter by Supplier</em></MenuItem>
             {/* Opsi hardcode atau ambil dari API */}
             <MenuItem value="Supplier A">Supplier A</MenuItem>
             <MenuItem value="Supplier B">Supplier B</MenuItem>
             <MenuItem value="Supplier C">Supplier C</MenuItem>
              <MenuItem value="Supplier D">Supplier D</MenuItem>
           </Select>
       </FormControl>


      {/* Sort */}
      <FormControl size="small" sx={{ ...controlStyles, minWidth: 150 }}>
          <InputLabel shrink>Sort</InputLabel>
          <Select
            displayEmpty
            value={sortOrder}
            onChange={onSortOrderChange}
            label="Sort"
             inputProps={{ 'aria-label': 'Sort by Stock' }}
          >
            <MenuItem value=""><em>Sort by Stock</em></MenuItem>
            {sortOptions.map(option => (
                 <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
      </FormControl>
    </Stack>
  );
};

export default StockFiltersAndSortControls;