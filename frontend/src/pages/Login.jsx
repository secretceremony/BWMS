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
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Tentukan API_BASE_URL berdasarkan variabel lingkungan
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Component TabPanel untuk menangani konten tab
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Login Component
const Login = ({ onLogin, error, loading }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  // State untuk register
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  
  // State untuk tab
  const [tabValue, setTabValue] = useState(0);

  // Handler untuk perubahan tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset pesan error/sukses saat berganti tab
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
      
      // Otomatis pindah ke tab login setelah 2 detik
      setTimeout(() => {
        setTabValue(0);
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
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mt: 8,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            BWMS
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Bulk Water Management System
          </Typography>
        </Box>
        
        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
        </Box>
        
        {/* Login Tab */}
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleLoginSubmit}>
            <Grid container spacing={2}>
              {(error || localError) && (
                <Grid item xs={12}>
                  <Alert severity="error">{error || localError}</Alert>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
        
        {/* Register Tab */}
        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleRegisterSubmit}>
            <Grid container spacing={2}>
              {registerError && (
                <Grid item xs={12}>
                  <Alert severity="error">{registerError}</Alert>
                </Grid>
              )}
              
              {registerSuccess && (
                <Grid item xs={12}>
                  <Alert severity="success">{registerSuccess}</Alert>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="register-email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="register-username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="register-password"
                  label="Password"
                  type="password"
                  id="register-password"
                  autoComplete="new-password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="confirm-password"
                  label="Konfirmasi Password"
                  type="password"
                  id="confirm-password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={registerLoading}
                  sx={{ py: 1.5 }}
                >
                  {registerLoading ? <CircularProgress size={24} /> : 'Register'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Login;