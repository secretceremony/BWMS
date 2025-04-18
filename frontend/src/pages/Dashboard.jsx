import React from "react";
import { Box, CssBaseline, Grid, Paper, Typography } from "@mui/material";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Footer from "../components/Footer.jsx";

const Dashboard = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <Sidebar sx={{ borderRight: "none" }} /> {/* Remove red border if any */}

      <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: "100vh" }}>
        {/* Navbar */}
        <Navbar sx={{ borderBottom: "none" }} /> {/* Remove red bottom border if any */}

        {/* Top Stats */}
        <Grid container spacing={2} mt={2} mb={2}>
          {["Total Inventory", "Low Stock Alerts", "Incoming Shipments", "Outgoing Shipments"].map((label) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="subtitle1">{label}</Typography>
                <Typography variant="h6">XXXX</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1">Inventory Movement Chart</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1">Storage Pie Chart</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent + Trend */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="subtitle1">Recent Transactions</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="subtitle1">Inventory Trend (Last 30 Days)</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Footer />
      </Box>
    </Box>
  );
};

export default Dashboard;