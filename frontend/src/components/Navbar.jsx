import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const Navbar = () => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" color="inherit">
          Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;