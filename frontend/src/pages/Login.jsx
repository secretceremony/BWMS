import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Tentukan API_BASE_URL berdasarkan variabel lingkungan
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Custom styling untuk komponen
const LoginContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(2)
}));

const LoginCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 500,
  borderRadius: 16,
  padding: theme.spacing(5, 3),
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  overflow: 'hidden'
}));

const AppTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: '#005E46', // Warna hijau teal sesuai dengan gambar
  textAlign: 'center',
  marginBottom: theme.spacing(6),
  fontSize: '2.5rem'
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  fontSize: '1.8rem'
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f5f8ff',
    borderRadius: 8,
    '&.Mui-focused': {
      backgroundColor: '#ffffff'
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1.5),
  fontWeight: 600,
  fontSize: '1rem',
  backgroundColor: '#005E46', // Warna hijau teal
  '&:hover': {
    backgroundColor: '#004D3A' // Sedikit lebih gelap saat hover
  },
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3)
}));

const RegisterLink = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  margin: theme.spacing(2, 0),
  '& .MuiLink-root': {
    color: '#005E46',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}));

// Login Component
const Login = ({ onLogin, error, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Handler untuk login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    
    // Validasi input
    if (!email || !password) {
      setLocalError('Email dan password tidak boleh kosong.');
      return;
    }
    
    // Panggil fungsi login dari props
    onLogin(email, password);
  };

  return (
    <LoginContainer maxWidth="sm">
      <AppTitle variant="h1">
        BiruniWMS
      </AppTitle>
      <LoginCard elevation={3}>
        <PageTitle variant="h2">
          Welcome
        </PageTitle>
        <form onSubmit={handleLoginSubmit}>
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || localError}
            </Alert>
          )}
          <StyledTextField
            variant="outlined"
            required
            fullWidth
            id="email"
            label="Email address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            InputProps={{ sx: { py: 0.5 } }}
          />
          <StyledTextField
            variant="outlined"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              sx: { py: 0.5 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </SubmitButton>
        </form>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;