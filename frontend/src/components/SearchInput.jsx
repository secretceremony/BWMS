// src/components/SearchInput.js
import React from 'react';
import { InputBase } from '@mui/material';

const SearchInput = ({ searchQuery, onSearchChange, placeholder = "Search..." }) => {
  const searchStyles = {
    bgcolor: 'white',
    px: 2,
    py: 0.5, // Menggunakan padding yang lebih umum atau disesuaikan
    border: '1px solid',
    borderColor: 'grey.400',
    borderRadius: 2,
    minWidth: { xs: '100%', sm: 250 },
  };

  return (
    <InputBase
      placeholder={placeholder} // Placeholder bisa di-override dari parent
      value={searchQuery}
      onChange={onSearchChange}
      size="small" // Ukuran kecil agar konsisten
      sx={searchStyles}
    />
  );
};

export default SearchInput;