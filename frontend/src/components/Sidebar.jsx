import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
} from "@mui/material";

const drawerWidth = 240;

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#e0e0e0",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
      </Box>
      <List>
        {["Dashboard", "Stock Management", "Reports", "Profile", "History"].map(
          (text, index) => (
            <ListItem button key={text} selected={index === 0}>
              <ListItemText primary={text} />
            </ListItem>
          )
        )}
      </List>
      <Box sx={{ p: 2, mt: "auto" }}>
        <Button variant="contained" fullWidth>
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
