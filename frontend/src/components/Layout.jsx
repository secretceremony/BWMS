import React, { useEffect, useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Home, Inventory, Assessment, Person, History, Logout, Menu as MenuIcon, Star as StarIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const drawerWidth = 240;

const Layout = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // New: state to hold user info

  const menuItems = [
    { text: 'Dashboard', icon: <Home />, path: '/dashboard' },
    { text: 'Stock Management', icon: <Inventory />, path: '/stock-management' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'History', icon: <History />, path: '/history' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
    // Fetch user info saat Layout pertama kali dipasang
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user`, {
          withCredentials: true,
        });
        setUser(res.data.user);
        console.log('Fetched user:', res.data.user);
      } catch (err) {
        console.error('Error fetching user:', err.response?.data || err.message);
      }
    };

    fetchUser();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar at the top */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1976d2',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            BiruniWMS {user ? `- Hello, ${user.name}` : ''}
          </Typography>
          <IconButton color="inherit">
            <StarIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} onClick={() => handleNavigation(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            <ListItem button onClick={onLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;