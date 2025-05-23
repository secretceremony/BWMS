import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Snackbar, Alert, Box, TableContainer } from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const defaultForm = { username: '', email: '', password: '', role: 'manager' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [fetchError, setFetchError] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      setFetchError(true);
      setSnackbar({ open: true, message: 'Gagal mengambil data user', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenForm = (user = null) => {
    if (user) {
      setForm({ username: user.username, email: user.email, password: '', role: user.role });
      setEditId(user.id);
    } else {
      setForm(defaultForm);
      setEditId(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setForm(defaultForm);
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.username || !form.email || (!editId && !form.password)) {
      setSnackbar({ open: true, message: 'Username, email, dan password wajib diisi', severity: 'warning' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (editId) {
        await axios.put(`${API_BASE_URL}/api/users/${editId}`, { ...form }, { headers: { Authorization: `Bearer ${token}` } });
        setSnackbar({ open: true, message: 'User berhasil diupdate', severity: 'success' });
      } else {
        await axios.post(`${API_BASE_URL}/api/users`, form, { headers: { Authorization: `Bearer ${token}` } });
        setSnackbar({ open: true, message: 'User berhasil ditambah', severity: 'success' });
      }
      fetchUsers();
      handleCloseForm();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Gagal simpan user', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/users/${confirmDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: 'User berhasil dihapus', severity: 'success' });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Gagal hapus user', severity: 'error' });
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  return (
    <Card elevation={3} sx={{ mt: 4 }}>
      <CardContent sx={{ p: { xs: 1, sm: 3 } }}>
        <Typography variant="h5" gutterBottom>Kelola User & Hak Akses (Admin)</Typography>
        <Button variant="contained" startIcon={<Add />} sx={{ mb: 2, width: { xs: '100%', sm: 'auto' } }} onClick={() => handleOpenForm()} fullWidth={true}>Tambah User</Button>
        <TableContainer sx={{ overflowX: 'auto', width: '100%', maxWidth: '100vw' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenForm(user)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => setConfirmDelete({ open: true, id: user.id })}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Form Tambah/Edit User */}
        <Dialog open={openForm} onClose={handleCloseForm}>
          <DialogTitle>{editId ? 'Edit User' : 'Tambah User'}</DialogTitle>
          <DialogContent sx={{ minWidth: 350 }}>
            <TextField label="Username" fullWidth margin="normal" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <TextField label="Email" fullWidth margin="normal" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" />
            {!editId && <TextField label="Password" fullWidth margin="normal" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" />}
            <Select label="Role" fullWidth margin="normal" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} sx={{ mt: 2 }}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Batal</Button>
            <Button onClick={handleSave} variant="contained">Simpan</Button>
          </DialogActions>
        </Dialog>
        {/* Konfirmasi Hapus */}
        <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, id: null })}>
          <DialogTitle>Hapus User</DialogTitle>
          <DialogContent>Yakin ingin menghapus user ini?</DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete({ open: false, id: null })}>Batal</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Hapus</Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default UserManagement; 