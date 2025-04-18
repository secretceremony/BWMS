import React from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

const LoginPage = () => {
  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left side - Form */}
      <Grid
        item
        xs={12}
        md={6}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: 6,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Button variant="contained" disabled fullWidth>
            Logo
          </Button>
        </Box>
        <Typography variant="h4" gutterBottom>
          Welcome back
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            label="Username"
            variant="outlined"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </Box>
      </Grid>

      {/* Right side - Visual */}
      <Grid
        item
        xs={false}
        md={6}
        sx={{
          backgroundColor: "#e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5">Visual</Typography>
      </Grid>
    </Grid>
  );
};

export default LoginPage;