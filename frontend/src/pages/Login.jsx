import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Container, Card, CardContent,
  InputAdornment, IconButton, Link, useTheme // Import useTheme
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// Login Component
const Login = ({ onLogin, error, loading }) => {
  const theme = useTheme(); // Use the theme hook

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   
    if (!email || !password) {
      console.log('Email or Password is empty');
      return;
    }

    console.log('Email:', email);
    console.log('Password:', password);
   
    try {
      await onLogin(email, password);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Use background color from theme
        // Your theme's background.default is white (#ffffff)
        // The original was a light grey (#f5f5f5). Adjust theme if needed.
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3), // Use theme spacing
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ mb: theme.spacing(4), textAlign: 'center' }}> {/* Use theme spacing */}
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            // Use primary color from theme
            color: theme.palette.primary.main
          }}>
            BiruniWMS
          </Typography>
        </Box>

        <Card elevation={3} sx={{ borderRadius: theme.shape.borderRadius, overflow: 'hidden' }}> {/* Use theme border radius */}
          <CardContent sx={{ p: theme.spacing(4) }}> {/* Use theme spacing */}
            <Typography variant="h4" component="h1" sx={{ mb: theme.spacing(3), fontWeight: 500, textAlign: 'center' }}> {/* Use theme spacing */}
              Welcome
            </Typography>

            <Box component="form" noValidate onSubmit={handleSubmit}>
              {/* TextField components automatically use theme primary/secondary colors */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email address"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                variant="outlined"
                sx={{ mb: theme.spacing(2) }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* Icons automatically use theme text/action colors */}
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: theme.spacing(1) }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: theme.spacing(1.5), // Use theme spacing
                  // Use primary color from theme
                  backgroundColor: theme.palette.primary.main,
                  // Use generated dark shade for hover state
                  '&:hover': { backgroundColor: theme.palette.primary.dark },
                  borderRadius: theme.shape.borderRadius, // Use theme border radius
                  textTransform: 'none',
                  fontSize: '1rem', // Standard font size, can be kept or themed
                  fontWeight: 500, // Standard font weight, can be kept or themed
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              {error && (
                <Typography color="error" align="center" sx={{ mt: theme.spacing(2) }}> {/* Use theme spacing */}
                  {error}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;