import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';

const SupplierForm = ({
  open,
  onClose,
  onSubmit,
  initialData, // Data supplier jika dalam mode edit, null jika mode tambah
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  });

  // Sinkronisasi initialData ke formData saat prop berubah
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || null,
        name: initialData.name || '',
        contact_person: initialData.contact_person || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
      });
    } else {
      // Jika mode tambah, reset form
      setFormData({
        id: null,
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
      });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validasi nama supplier wajib diisi
    if (!formData.name.trim()) {
      alert('Nama supplier wajib diisi.');
      return;
    }

    const dataToSubmit = {
      id: formData.id ?? undefined, // hanya sertakan jika edit
      name: formData.name.trim(),
      contact_person: formData.contact_person?.trim() || null,
      phone: formData.phone?.trim() || null,
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
    };

    onSubmit(dataToSubmit);
  };

  const dialogTitle = initialData ? 'Edit Supplier' : 'Tambah Supplier Baru';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            {/* ID (hanya tampilkan jika edit, tidak bisa diedit) */}
            {initialData && (
              <Grid item xs={12}>
                <TextField
                  label="ID"
                  value={formData.id || ''}
                  fullWidth
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            
            {/* Nama Supplier */}
            <Grid item xs={12}>
              <TextField
                label="Nama Supplier"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Kontak Person */}
            <Grid item xs={12}>
              <TextField
                label="Kontak Person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* No. Telepon */}
            <Grid item xs={12}>
              <TextField
                label="No. Telepon"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Email */}
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Alamat */}
            <Grid item xs={12}>
              <TextField
                label="Alamat"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SupplierForm; 