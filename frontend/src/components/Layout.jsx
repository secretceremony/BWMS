import React from 'react'; // Removed useEffect, useState as user prop is used
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Home, Inventory, Assessment, Person, History, Logout, Menu as MenuIcon, Star as StarIcon } from '@mui/icons-material';
import { useNavigate, Outlet } from 'react-router-dom'; // Import Outlet
// axios and user fetching removed as it's handled by App.js and passed via props

const drawerWidth = 240;

// Receive the user object and onLogout function as props from App.js
const Layout = ({ onLogout, user }) => {
  const navigate = useNavigate();
  // Removed local user state and useEffect for fetching user

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

  // Removed useEffect for fetching user inside Layout


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
            <MenuIcon /> {/* You might want to add functionality to toggle drawer */}
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            BiruniWMS {user ? `- Hello, ${user.username}` : ''} {/* Use user prop, assuming username property */}
          </Typography>
          {/* Removed the StarIcon, add back if needed */}
          {/* <IconButton color="inherit">
            <StarIcon />
          </IconButton> */}
           <IconButton color="inherit" onClick={onLogout} title="Logout">
             <Logout />
           </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent" // Consider making this responsive with a temporary variant on mobile
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { // Use theme.breakpoints for responsiveness
             width: drawerWidth,
             boxSizing: 'border-box',
             // Ensure drawer is below AppBar
             marginTop: '64px', // Height of default AppBar
             // You might need to adjust this based on your AppBar height
          },
        }}
      >
        {/* Removed Toolbar inside Drawer, marginTop handles the space */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} onClick={() => handleNavigation(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            {/* Logout button in the sidebar */}
            {/* Moved logout to AppBar for clearer visibility, but can keep here too */}
             {/* <ListItem button onClick={onLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem> */}
          </List>
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#f5f5f5', // Background color for content area
          minHeight: '100vh', // Ensure it takes at least full viewport height
          // Add padding/margin top to account for fixed AppBar
          marginTop: '64px', // Height of default AppBar
        }}
      >
        {/* Removed Toolbar here */}

        {/* THIS IS THE FIX: RENDER THE MATCHED NESTED ROUTE CONTENT HERE */}
        <Outlet />

      </Box>
    </Box>
  );
};

export default Layout;