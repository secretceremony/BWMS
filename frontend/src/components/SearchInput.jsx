// src/components/SearchInput.js
import React from 'react';
import { InputBase } from '@mui/material';

const SearchInput = ({ searchQuery, onSearchChange, placeholder = "Search...", sx = {}, ...props }) => {
  const searchStyles = {
    bgcolor: 'white',
    px: 2,
    py: 0.5,
    border: '1px solid',
    borderColor: 'grey.400',
    borderRadius: 2,
    minWidth: { xs: '100%', sm: 250 },
    ...sx,
  };

  return (
    <InputBase
      placeholder={placeholder}
      value={searchQuery}
      onChange={onSearchChange}
      size="small"
      sx={searchStyles}
      {...props}
    />
  );
};

export default SearchInput;