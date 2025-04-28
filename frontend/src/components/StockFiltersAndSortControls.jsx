// src/components/StockFiltersAndSortControls.js (Sesuaikan path jika perlu)
import React from 'react';
import { Select, MenuItem, Stack } from '@mui/material';

const StockFiltersAndSortControls = ({
  filterCategory,
  onFilterCategoryChange,
  filterSupplier,
  onFilterSupplierChange,
  sortOrder,
  onSortOrderChange,
}) => {
  // Styles umum untuk input kontrol
  const controlStyles = {
    bgcolor: 'white',
    px: 2,
    py: 1,
    border: '1px solid',
    borderColor: 'grey.400',
    borderRadius: 1,
  };

  return (
    // Stack ini berisi filter Category, Supplier, dan Sort Stock
    <Stack direction="row" spacing={2} flexWrap="wrap">
      {/* Filter Category */}
      <Select
        displayEmpty
        value={filterCategory}
        onChange={onFilterCategoryChange}
        size="small"
        sx={{ ...controlStyles, minWidth: 150 }}
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
        onChange={onFilterSupplierChange}
        size="small"
        sx={{ ...controlStyles, minWidth: 150 }}
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
        onChange={onSortOrderChange}
        size="small"
        sx={{ ...controlStyles, minWidth: 150 }}
      >
        <MenuItem value="">
          <em>Sort by Stock</em>
        </MenuItem>
        <MenuItem value="stokTerbanyak">Stok Terbanyak</MenuItem>
        <MenuItem value="stokTerkecil">Stok Terkecil</MenuItem>
      </Select>
    </Stack>
  );
};

export default StockFiltersAndSortControls;