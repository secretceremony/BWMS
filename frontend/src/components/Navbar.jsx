import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

function Navbar({ username, userRole, toggleDrawer }) {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="subtitle1">
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)}: {username}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;