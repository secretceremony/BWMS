import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Breadcrumbs, Link,
  CssBaseline, Avatar, Divider, Tooltip, useTheme // Import useTheme
} from '@mui/material';
import {
  Home, Inventory, Assessment, Person, History,
  Logout, Menu as MenuIcon, ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const drawerWidth = 240;
const collapsedDrawerWidth = 70;

const Layout = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme(); // Use the theme hook

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <Home />, path: '/dashboard' },
    { text: 'Stock Management', icon: <Inventory />, path: '/stock-management' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
    { text: 'Supplier Management', icon: <Person />, path: '/supplier-management' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'History', icon: <History />, path: '/history' },
  ];

  const handleMobileDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen((prev) => !prev);
    // Close mobile drawer when toggling desktop view
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false); // Close mobile drawer on navigation
  };

  const drawerContent = (
    <Box
      sx={{
        overflow: 'auto',
        // Optional: Set drawer background if different from paper default
        // bgcolor: theme.palette.background.paper,
      }}
    >
      {/* Toolbar for Drawer Header */}
      <Toolbar sx={{ justifyContent: desktopOpen ? 'flex-end' : 'center', px: 1 }}>
        {/* Hide the desktop toggle button on small screens */}
        <IconButton onClick={handleDesktopDrawerToggle} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {desktopOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              // Use theme colors for hover state
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText || theme.palette.common.white // Use contrastText or white if not defined
              },
              // Optional: Highlight active link
              backgroundColor: location.pathname.startsWith(item.path) ? theme.palette.action.selected : 'transparent',
              color: location.pathname.startsWith(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
              justifyContent: desktopOpen ? 'initial' : 'center',
              px: 2.5, // Uses theme spacing unit (2.5 * 8px by default)
            }}
          >
            <Tooltip title={!desktopOpen ? item.text : ''} placement="right" disableInteractive={desktopOpen}> {/* Disable tooltip when drawer is open */}
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: desktopOpen ? 3 : 'auto', // Uses theme spacing unit (3 * 8px by default)
                  justifyContent: 'center',
                  color: location.pathname.startsWith(item.path) ? theme.palette.primary.main : theme.palette.action.active, // Icon color
                }}
              >
                {item.icon}
              </ListItemIcon>
            </Tooltip>
            {desktopOpen && <ListItemText primary={item.text} />}
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* Position logout at the bottom - requires Flexbox parent or absolute positioning */}
      {/* Adding a Box with flexGrow: 1 pushes the content above down */}
      <Box sx={{ flexGrow: 1 }} />
      <List>
        <ListItem
          button
          onClick={onLogout}
          sx={{
            // Use theme colors for hover state
            '&:hover': {
                // Note: Your theme didn't define an 'error' palette.
                // If you add an 'error' palette to your theme, this will work.
                // Otherwise, you might need to define a specific color or use another palette.
                backgroundColor: theme.palette.error.light,
                color: theme.palette.error.contrastText || theme.palette.common.white
             },
            justifyContent: desktopOpen ? 'initial' : 'center',
            px: 2.5, // Uses theme spacing unit
          }}
        >
          <Tooltip title={!desktopOpen ? 'Logout' : ''} placement="right" disableInteractive={desktopOpen}> {/* Disable tooltip when drawer is open */}
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: desktopOpen ? 3 : 'auto', // Uses theme spacing unit
                justifyContent: 'center',
                color: theme.palette.action.active, // Default icon color
              }}
            >
              <Logout />
            </ListItemIcon>
          </Tooltip>
          {desktopOpen && <ListItemText primary="Logout" />}
        </ListItem>
      </List>
    </Box>
  );

  // Breadcrumb logic
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline /> {/* Applies global baseline styles */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          // Use primary color from the theme
          backgroundColor: theme.palette.primary.main,
          boxShadow: theme.shadows[3], // Use theme shadow
          // Adjust width for desktop when drawer is open/closed
          width: { md: `calc(100% - ${desktopOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          ml: { md: desktopOpen ? drawerWidth : collapsedDrawerWidth },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          {/* Mobile menu toggle */}
          <IconButton
            color="inherit" // Inherits color from AppBar (primary.contrastText)
            edge="start"
            onClick={handleMobileDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }} // Uses theme spacing unit
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, color: theme.palette.primary.contrastText }}> {/* Use contrastText */}
            BiruniWMS
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> {/* Uses theme spacing unit */}
              <Typography variant="body1" noWrap sx={{ color: theme.palette.primary.contrastText }}> {/* Use contrastText */}
                Hi, {user.username}
              </Typography>
              {/* Avatar uses default colors unless customized */}
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main, color: theme.palette.secondary.contrastText }}>
                {user.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: desktopOpen ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          [`& .MuiDrawer-paper`]: {
            width: desktopOpen ? drawerWidth : collapsedDrawerWidth,
            boxSizing: 'border-box',
            // Uses theme transitions
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            // Optional: Set drawer paper background
            bgcolor: theme.palette.background.paper,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better performance on mobile
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            // Optional: Set drawer paper background
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3, // Uses theme spacing unit
          // Adjust width based on desktop drawer state
          mt: '64px', // Offset for fixed AppBar (adjust if AppBar height changes significantly)
          // Use background color from the theme
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
          // Adjust transition for main content margin when drawer toggles
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}> {/* Uses theme spacing unit */}
          <Link
              underline="hover"
              color="inherit" // Can keep inherit or use theme.palette.text.secondary
              onClick={() => navigate('/dashboard')}
              sx={{ cursor: 'pointer' }}
            >
            Home
          </Link>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            // Basic title case conversion for breadcrumbs
            const name = value.replace(/-/g, ' ')
                               .split(' ')
                               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                               .join(' ');


            return isLast ? (
              <Typography color="text.primary" key={to}> {/* Uses theme text primary color */}
                {name}
              </Typography>
            ) : (
              <Link
                underline="hover"
                color={theme.palette.primary.main} // Use primary color for links
                onClick={() => navigate(to)}
                key={to}
                sx={{ cursor: 'pointer' }}
              >
                {name}
              </Link>
            );
          })}
        </Breadcrumbs>

        <Outlet /> {/* Renders the content of the matched route */}
      </Box>
    </Box>
  );
};

export default Layout;