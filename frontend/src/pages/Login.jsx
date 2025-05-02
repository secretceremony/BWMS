import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  useTheme,
  Stack,
  Link
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const AuthForm = ({ onLogin, onRegister, error, loading }) => {
  const theme = useTheme();
  const [isLogin, setIsLogin] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleToggleMode = () => {
    setIsLogin((prev) => !prev);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      if (!formData.email || !formData.password) return;
      try {
        await onLogin(formData.email, formData.password);
      } catch (err) {
        console.error('Login error:', err);
      }
    } else {
      const { username, email, password, confirmPassword } = formData;
      if (!username || !email || !password || !confirmPassword) return;
      if (password !== confirmPassword) {
        alert('Password does not match');
        return;
      }
      try {
        await onRegister({ username, email, password });
      } catch (err) {
        console.error('Register error:', err);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        p: 3
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            BiruniWMS
          </Typography>
        </Box>

        <Card elevation={3} sx={{ borderRadius: theme.shape.borderRadius }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" align="center" fontWeight={500} mb={3}>
              {isLogin ? 'Welcome' : 'Register'}
            </Typography>

            <Box component="form" noValidate onSubmit={handleSubmit}>
              {!isLogin && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.name}
                  onChange={handleChange}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Email address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {!isLogin && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark
                  },
                  borderRadius: theme.shape.borderRadius,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>

              {error && (
                <Typography color="error" align="center" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}

              <Stack direction="row" justifyContent="center" mt={3}>
                <Typography variant="body2">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </Typography>
                <Link component="button" ml={1} onClick={handleToggleMode}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Link>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AuthForm;
