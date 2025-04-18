import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  CircularProgress 
} from '@mui/material';

function Login({ onLogin, error, loading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Container component="main" maxWidth="sm" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center' 
      }}>
        <Paper elevation={3} style={{ 
          padding: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <Box mb={4} style={{ alignSelf: 'center' }}>
            <Typography variant="h5" component="div" align="center">
              Logo
            </Typography>
          </Box>
          
          <Box width="100%" mb={4}>
            <Typography variant="h4" component="h1">
              Welcome back
            </Typography>
          </Box>
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Box width="100%" mb={2}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Box>
            
            <Box width="100%" mb={4}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Box>
            
            {error && (
              <Box width="100%" mb={2}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}
            
            <Box width="100%">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </Box>
          </form>
          
        </Paper>
      </Container>
      <Box 
        sx={{ 
          backgroundColor: 'grey.200',
          width: '40%',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h4">Visual</Typography>
      </Box>
    </div>
  );
}

export default Login;