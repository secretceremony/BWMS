import React from 'react';
import { Card, CardContent, Typography, Divider, Grid, TextField, Button, CircularProgress, IconButton } from '@mui/material';
import { LockReset, Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChangePasswordForm = ({ user }) => {
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      alert('Password saat ini harus diisi.');
      return;
    }
    if (!newPassword) {
      alert('Password baru harus diisi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi tidak sama.');
      return;
    }
    setIsChangingPassword(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login ulang.');
      setIsChangingPassword(false);
      return;
    }
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const payload = { currentPassword, newPassword };
      const res = await axios.post(`${API_BASE_URL}/api/profile/change-password`, payload, config);
      alert('Password berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (res.data && res.data.token) localStorage.setItem('token', res.data.token);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengubah password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 3 }}>Ubah Password</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Password Saat Ini" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} margin="normal" variant="outlined" type={showCurrentPassword ? 'text' : 'password'} InputProps={{ endAdornment: (<IconButton aria-label="toggle password visibility" onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">{showCurrentPassword ? <VisibilityOff /> : <Visibility />}</IconButton>), }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Password Baru" value={newPassword} onChange={e => setNewPassword(e.target.value)} margin="normal" variant="outlined" type={showNewPassword ? 'text' : 'password'} InputProps={{ endAdornment: (<IconButton aria-label="toggle password visibility" onClick={() => setShowNewPassword(!showNewPassword)} edge="end">{showNewPassword ? <VisibilityOff /> : <Visibility />}</IconButton>), }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Konfirmasi Password Baru" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} margin="normal" variant="outlined" type={showConfirmPassword ? 'text' : 'password'} InputProps={{ endAdornment: (<IconButton aria-label="toggle password visibility" onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton>), }} />
          </Grid>
        </Grid>
        <Button variant="contained" color="primary" startIcon={<LockReset />} onClick={handleChangePassword} disabled={isChangingPassword} sx={{ mt: 2 }}>{isChangingPassword ? 'Mengubah...' : 'Ubah Password'}</Button>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm; 