import React from 'react';
import { Card, CardContent, Typography, Divider, Grid, TextField, Button, CircularProgress } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditProfileForm = ({ user, onUserUpdate }) => {
  const [editingUsername, setEditingUsername] = React.useState(user?.username || '');
  const [editingEmail, setEditingEmail] = React.useState(user?.email || '');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    if (!API_BASE_URL) {
      alert('API URL tidak dikonfigurasi.');
      setIsSaving(false);
      return;
    }
    if (!editingUsername || !editingEmail) {
      alert('Username dan email wajib diisi.');
      setIsSaving(false);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login ulang.');
      setIsSaving(false);
      return;
    }
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const payload = { username: editingUsername, email: editingEmail };
      const res = await axios.put(`${API_BASE_URL}/api/profile/update`, payload, config);
      if (res.data && res.data.user) {
        if (onUserUpdate) onUserUpdate(res.data.user);
        alert('Profil berhasil diupdate!');
        if (res.data.token) localStorage.setItem('token', res.data.token);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal update profil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Edit Profile</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Username" value={editingUsername} onChange={e => setEditingUsername(e.target.value)} margin="normal" variant="outlined" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Email" value={editingEmail} onChange={e => setEditingEmail(e.target.value)} margin="normal" variant="outlined" type="email" />
          </Grid>
        </Grid>
        <Button variant="contained" sx={{ mt: 3 }} onClick={handleUpdateProfile} disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>{isSaving ? 'Saving...' : 'UPDATE PROFILE'}</Button>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm; 