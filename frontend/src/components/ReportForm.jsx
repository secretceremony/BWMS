import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Typography,
  Box,
  useTheme
} from '@mui/material';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthToken = () => localStorage.getItem('token');

const ReportForm = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  error = null,
  isEdit = false,
  editData = null
}) => {
  const theme = useTheme();

  const [formData, setFormData] = useState({
    itemId: '',
    transactionType: 'incoming', // default ke 'incoming'
    quantity: '',
    remarks: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  const [stockItems, setStockItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Reset form saat dialog ditutup
  const resetForm = () => {
    setFormData({
      itemId: '',
      transactionType: 'incoming',
      quantity: '',
      remarks: '',
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setValidationErrors({});
    setItemsError(null);
  };

  // Mengisi form dengan data edit jika dalam mode edit
  useEffect(() => {
    if (isEdit && editData && open) {
      setFormData({
        itemId: editData.item_id || '',
        transactionType: editData.jenis === 'Stock In' ? 'incoming' : 'outgoing',
        quantity: editData.quantity || '',
        remarks: editData.remarks || '',
        transactionDate: editData.tanggal || new Date().toISOString().split('T')[0],
      });
    } else if (open) {
      resetForm();
    }
  }, [isEdit, editData, open]);

  // Mengambil data items dari API
  useEffect(() => {
    if (open) {
      const fetchStockItems = async () => {
        if (!API_URL) {
          setItemsError("API URL tidak dikonfigurasi.");
          setItemsLoading(false);
          return;
        }
        setItemsLoading(true);
        setItemsError(null);

        const token = getAuthToken();
        if (!token) {
          setItemsError("Token autentikasi tidak ditemukan.");
          setItemsLoading(false);
          return;
        }

        try {
          const response = await fetch(`${API_URL}/api/stock`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.message || response.statusText);
          }

          const data = await response.json();
          if (Array.isArray(data)) {
            setStockItems(data);
          } else {
            setItemsError("Format data yang diterima dari server tidak valid.");
          }

        } catch (err) {
          setItemsError(`Gagal memuat data item: ${err.message}`);
        } finally {
          setItemsLoading(false);
        }
      };

      fetchStockItems();
    }
  }, [open]);

  // Handler perubahan input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  // Validasi form
  const validate = () => {
    let errors = {};
    if (!formData.itemId) errors.itemId = 'Pemilihan item diperlukan.';
    if (!formData.transactionType) errors.transactionType = 'Tipe transaksi diperlukan.';
    if (formData.quantity === '' || Number(formData.quantity) <= 0 || isNaN(Number(formData.quantity))) {
      errors.quantity = 'Kuantitas harus berupa angka positif.';
    }
    if (!formData.transactionDate) errors.transactionDate = 'Tanggal transaksi diperlukan.';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler submit form
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const dataToSubmit = {
      itemId: formData.itemId,
      quantity: Number(formData.quantity),
      remarks: formData.remarks,
      transactionDate: formData.transactionDate,
    };

    // Kirim data ke parent component
    onSubmit(formData.transactionType, dataToSubmit);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Laporan' : 'Tambah Laporan Baru'}</DialogTitle>
      <DialogContent dividers sx={{ padding: theme.spacing(3) }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={theme.spacing(2)}>
            {/* Item Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!validationErrors.itemId}>
                <InputLabel shrink>Pilih Item</InputLabel>
                {itemsLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">Memuat item...</Typography>
                  </Box>
                ) : itemsError ? (
                  <Typography variant="body2" color="error" sx={{ mt: 2 }}>{itemsError}</Typography>
                ) : (
                  <Select
                    name="itemId"
                    value={formData.itemId}
                    onChange={handleChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Pilih Item' }}
                    label="Pilih Item"
                    sx={{ mt: 1 }}
                  >
                    <MenuItem value="" disabled>Pilih Item</MenuItem>
                    {Array.isArray(stockItems) && stockItems.map(item => (
                      <MenuItem key={item.id} value={item.id}>{`${item.id} - ${item.name}`}</MenuItem>
                    ))}
                  </Select>
                )}
                <Typography variant="caption" color="error">{validationErrors.itemId}</Typography>
              </FormControl>
            </Grid>

            {/* Transaction Type */}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!validationErrors.transactionType}>
                <InputLabel shrink>Tipe Transaksi</InputLabel>
                <Select
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Tipe Transaksi' }}
                  label="Tipe Transaksi"
                  sx={{ mt: 1 }}
                >
                  <MenuItem value="incoming">Barang Masuk (Stock In)</MenuItem>
                  <MenuItem value="outgoing">Barang Keluar (Stock Out)</MenuItem>
                </Select>
                <Typography variant="caption" color="error">{validationErrors.transactionType}</Typography>
              </FormControl>
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Jumlah"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
                required
                type="number"
                error={!!validationErrors.quantity}
                helperText={validationErrors.quantity}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Transaction Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tanggal Transaksi"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                fullWidth
                required
                type="date"
                error={!!validationErrors.transactionDate}
                helperText={validationErrors.transactionDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Remarks */}
            <Grid item xs={12}>
              <TextField
                label="Keterangan"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Box>
        {error && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="error">{error}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: theme.spacing(2) }}>
        <Button onClick={onClose} color="secondary">
          Batal
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isEdit ? 'Perbarui' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportForm; 