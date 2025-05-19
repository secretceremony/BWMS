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
  Link
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
  
  // State for register view
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowRegisterPassword = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Switch between login and register views
  const toggleView = () => {
    setIsRegisterView(!isRegisterView);
    // Reset forms and errors when switching views
    setLocalError('');
    setRegisterError('');
    setRegisterSuccess('');
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

  // Handler untuk register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    
    // Validasi input
    if (!registerEmail || !registerUsername || !registerPassword || !confirmPassword) {
      setRegisterError('Semua field harus diisi.');
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      setRegisterError('Password dan konfirmasi password tidak sama.');
      return;
    }
    
    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setRegisterError('Format email tidak valid.');
      return;
    }
    
    // Validasi panjang password
    if (registerPassword.length < 6) {
      setRegisterError('Password harus minimal 6 karakter.');
      return;
    }
    
    setRegisterLoading(true);
    
    try {
      // Kirim data register ke backend
      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        email: registerEmail,
        username: registerUsername,
        password: registerPassword
      });
      
      // Set pesan sukses jika berhasil
      setRegisterSuccess('Registrasi berhasil! Silakan login.');
      
      // Reset form register
      setRegisterEmail('');
      setRegisterUsername('');
      setRegisterPassword('');
      setConfirmPassword('');
      
      // Otomatis pindah ke login view setelah 2 detik
      setTimeout(() => {
        setIsRegisterView(false);
        setEmail(registerEmail); // Isi otomatis email di form login
      }, 2000);
      
    } catch (err) {
      console.error('Register error:', err);
      // Handle error dari backend
      const errorMessage = err.response?.data?.error || 'Terjadi kesalahan saat registrasi.';
      setRegisterError(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <LoginContainer maxWidth="sm">
      <AppTitle variant="h1">
        BiruniWMS
      </AppTitle>
      
      <LoginCard elevation={3}>
        {!isRegisterView ? (
          // LOGIN VIEW
          <>
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
                InputProps={{
                  sx: { py: 0.5 }
                }}
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
            
            <RegisterLink>
              <Typography variant="body1">
                Don't have an account?
                <Link component="button" onClick={toggleView} sx={{ ml: 1 }}>
                  Register
                </Link>
              </Typography>
            </RegisterLink>
          </>
        ) : (
          // REGISTER VIEW
          <>
            <PageTitle variant="h2">
              Create Account
            </PageTitle>
            
            <form onSubmit={handleRegisterSubmit}>
              {registerError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {registerError}
                </Alert>
              )}
              
              {registerSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {registerSuccess}
                </Alert>
              )}
              
              <StyledTextField
                variant="outlined"
                required
                fullWidth
                id="register-email"
                label="Email"
                name="email"
                autoComplete="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                InputProps={{
                  sx: { py: 0.5 }
                }}
              />
              
              <StyledTextField
                variant="outlined"
                required
                fullWidth
                id="register-username"
                label="Username"
                name="username"
                autoComplete="username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                InputProps={{
                  sx: { py: 0.5 }
                }}
              />
              
              <StyledTextField
                variant="outlined"
                required
                fullWidth
                name="register-password"
                label="Password"
                type={showRegisterPassword ? 'text' : 'password'}
                id="register-password"
                autoComplete="new-password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                InputProps={{
                  sx: { py: 0.5 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowRegisterPassword}
                        edge="end"
                      >
                        {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <StyledTextField
                variant="outlined"
                required
                fullWidth
                name="confirm-password"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  sx: { py: 0.5 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <SubmitButton
                type="submit"
                fullWidth
                variant="contained"
                disabled={registerLoading}
              >
                {registerLoading ? <CircularProgress size={24} /> : 'Register'}
              </SubmitButton>
            </form>
            
            <RegisterLink>
              <Typography variant="body1">
                Already have an account?
                <Link component="button" onClick={toggleView} sx={{ ml: 1 }}>
                  Sign In
                </Link>
              </Typography>
            </RegisterLink>
          </>
        )}
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;