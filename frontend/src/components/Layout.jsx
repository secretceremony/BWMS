import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Breadcrumbs, Link,
  CssBaseline, Avatar, Divider, Tooltip
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <Home />, path: '/dashboard' },
    { text: 'Stock Management', icon: <Inventory />, path: '/stock-management' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'History', icon: <History />, path: '/history' },
  ];

  const handleMobileDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen((prev) => !prev);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto' }}>
      <Toolbar sx={{ justifyContent: desktopOpen ? 'flex-end' : 'center', px: 1 }}>
        <IconButton onClick={handleDesktopDrawerToggle} sx={{ display: { xs: 'none', md: 'block' } }}>
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
              '&:hover': { backgroundColor: 'primary.light', color: 'white' },
              justifyContent: desktopOpen ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <Tooltip title={!desktopOpen ? item.text : ''} placement="right">
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: desktopOpen ? 3 : 'auto',
                  justifyContent: 'center',
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
      <List>
        <ListItem
          button
          onClick={onLogout}
          sx={{
            mt: 'auto',
            '&:hover': { backgroundColor: 'error.light', color: 'white' },
            justifyContent: desktopOpen ? 'initial' : 'center',
            px: 2.5,
          }}
        >
          <Tooltip title={!desktopOpen ? 'Logout' : ''} placement="right">
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: desktopOpen ? 3 : 'auto',
                justifyContent: 'center',
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
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1976d2',
          boxShadow: 3,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleMobileDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            BiruniWMS
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" noWrap>
                Hi, {user.username}
              </Typography>
              <Avatar sx={{ width: 32, height: 32 }}>
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
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
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
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
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
          p: 3,
          width: { md: `calc(100% - ${desktopOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          mt: '64px',
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" onClick={() => navigate('/dashboard')} sx={{ cursor: 'pointer' }}>
            Home
          </Link>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const menuItem = menuItems.find((item) => item.path === `/${value}`);
            const name = menuItem ? menuItem.text : value.replace(/-/g, ' ');

            return isLast ? (
              <Typography color="text.primary" key={to}>
                {name}
              </Typography>
            ) : (
              <Link
                underline="hover"
                color="inherit"
                onClick={() => navigate(to)}
                key={to}
                sx={{ cursor: 'pointer' }}
              >
                {name}
              </Link>
            );
          })}
        </Breadcrumbs>

        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;