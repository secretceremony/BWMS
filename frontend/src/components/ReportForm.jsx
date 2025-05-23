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
  useTheme,
  Divider,
  FormHelperText,
  Autocomplete,
  Chip
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
    itemId: [],
    transactionType: 'incoming',
    quantity: '',
    unitPrice: '',
    totalValue: '',
    source: '',
    remarks: '',
    transactionDate: new Date().toISOString().split('T')[0],
    categoryTags: [],
  });

  const [stockItems, setStockItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([
    'Gudang Utama', 'Gudang B', 'Rak Depan', 'Rak Belakang', 'Lemari Khusus'
  ]); // Sample data
  const [categories, setCategories] = useState([
    'Sparepart', 'Oli', 'Aki', 'Ban', 'Lainnya'
  ]);
  
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  // Reset form saat dialog ditutup
  const resetForm = () => {
    setFormData({
      itemId: [],
      transactionType: 'incoming',
      quantity: '',
      unitPrice: '',
      totalValue: '',
      source: '',
      remarks: '',
      transactionDate: new Date().toISOString().split('T')[0],
      categoryTags: [],
    });
    setValidationErrors({});
    setItemsError(null);
    setSelectedItem(null);
  };

  // Mengisi form dengan data edit jika dalam mode edit
  useEffect(() => {
    if (isEdit && editData && open) {
      setFormData({
        itemId: editData.item_id || [],
        transactionType: editData.jenis === 'Stock In' ? 'incoming' : 'outgoing',
        quantity: editData.quantity || '',
        unitPrice: editData.unitPrice || '',
        totalValue: editData.totalValue || '',
        source: editData.source || '',
        remarks: editData.remarks || '',
        transactionDate: editData.tanggal || new Date().toISOString().split('T')[0],
        categoryTags: editData.categoryTags || [],
      });
      
      // Set selected item jika tersedia
      if (editData.item_id && Array.isArray(editData.item_id)) {
        const items = stockItems.filter(item => editData.item_id.includes(item.id));
        if (items.length > 0) setSelectedItem(items);
      }
    } else if (open) {
      resetForm();
    }
  }, [isEdit, editData, open, stockItems]);

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

  // Fetch suppliers dari API saat form open
  useEffect(() => {
    if (open) {
      const fetchSuppliers = async () => {
        if (!API_URL) return;
        const token = getAuthToken();
        if (!token) return;
        try {
          const response = await fetch(`${API_URL}/api/suppliers`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            setSuppliers(data);
          }
        } catch {}
      };
      fetchSuppliers();
    }
  }, [open, API_URL]);

  // Handler perubahan input
  const handleChange = (event) => {
    const { name, value } = event.target;
    
    // Khusus untuk nilai quantity atau unitPrice, update totalValue
    if (name === 'quantity' || name === 'unitPrice') {
      const newFormData = { 
        ...formData, 
        [name]: value 
      };
      
      // Jika quantity dan unitPrice keduanya ada, hitung totalValue
      if (newFormData.quantity && newFormData.unitPrice) {
        const qty = parseFloat(newFormData.quantity);
        const price = parseFloat(newFormData.unitPrice);
        if (!isNaN(qty) && !isNaN(price)) {
          newFormData.totalValue = (qty * price).toFixed(2);
        }
      }
      
      setFormData(newFormData);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };
  
  // Handler untuk Autocomplete item multiple
  const handleItemChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      itemId: newValue.map(item => item.id),
      unitPrice: newValue.length === 1 ? newValue[0].price || '' : '',
      totalValue: newValue.length === 1 && formData.quantity ? (formData.quantity * (newValue[0].price || 0)).toFixed(2) : ''
    }));
    setSelectedItem(newValue);
    setValidationErrors(prev => ({ ...prev, itemId: '' }));
  };
  
  // Handler untuk kategori tags
  const handleTagsChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      categoryTags: newValue
    }));
  };

  // Validasi form
  const validate = () => {
    let errors = {};
    if (!formData.itemId.length) errors.itemId = 'Pemilihan item diperlukan.';
    if (!formData.transactionType) errors.transactionType = 'Tipe transaksi diperlukan.';
    if (formData.quantity === '' || Number(formData.quantity) <= 0 || isNaN(Number(formData.quantity))) {
      errors.quantity = 'Kuantitas harus berupa angka positif.';
    }
    if (!formData.transactionDate) errors.transactionDate = 'Tanggal transaksi diperlukan.';

    // Validasi unitPrice jika diisi
    if (formData.unitPrice && (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) < 0)) {
      errors.unitPrice = 'Harga satuan harus berupa angka positif.';
    }
    
    // Untuk transaksi incoming, source seharusnya supplier
    if (formData.transactionType === 'incoming' && !formData.source) {
      errors.source = 'Supplier diperlukan untuk transaksi barang masuk.';
    }
    
    // Untuk transaksi outgoing, location seharusnya diisi
    if (formData.transactionType === 'outgoing' && !formData.location) {
      errors.location = 'Lokasi diperlukan untuk transaksi barang keluar.';
    }

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
      unitPrice: formData.unitPrice ? Number(formData.unitPrice) : undefined,
      totalValue: formData.totalValue ? Number(formData.totalValue) : undefined,
      source: formData.source,
      remarks: formData.remarks,
      transactionDate: formData.transactionDate,
      categoryTags: formData.categoryTags,
    };

    // Kirim data ke parent component
    onSubmit(formData.transactionType, dataToSubmit);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Laporan' : 'Tambah Laporan Baru'}</DialogTitle>
      <DialogContent dividers sx={{ padding: theme.spacing(3) }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <FormControl fullWidth required error={!!validationErrors.transactionType} sx={{ mb: 2 }}>
                <InputLabel>Tipe Transaksi</InputLabel>
                <Select
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Tipe Transaksi' }}
                  label="Tipe Transaksi"
                >
                  <MenuItem value="incoming">Barang Masuk (Stock In)</MenuItem>
                  <MenuItem value="outgoing">Barang Keluar (Stock Out)</MenuItem>
                </Select>
                <FormHelperText error>{validationErrors.transactionType}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item>
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
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item>
              <FormControl fullWidth error={!!validationErrors.source} sx={{ mb: 2 }}>
                <InputLabel>{formData.transactionType === 'incoming' ? 'Supplier' : 'Customer/Tujuan'}</InputLabel>
                <Select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  displayEmpty
                  label={formData.transactionType === 'incoming' ? 'Supplier' : 'Customer/Tujuan'}
                >
                  <MenuItem value="">-</MenuItem>
                  {suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.name}>{supplier.name}</MenuItem>
                  ))}
                </Select>
                <FormHelperText error>{validationErrors.source}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl fullWidth required error={!!validationErrors.itemId} sx={{ mb: 2 }}>
                <Autocomplete
                  multiple
                  options={stockItems}
                  getOptionLabel={(option) => `${option.name} (${option.id})`}
                  loading={itemsLoading}
                  value={selectedItem || []}
                  onChange={handleItemChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Pilih Item (bisa lebih dari satu)"
                      required
                      error={!!validationErrors.itemId}
                      helperText={validationErrors.itemId}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item>
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
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Harga Satuan"
                name="unitPrice"
                value={formData.unitPrice}
                fullWidth
                type="number"
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                helperText="Otomatis dari data item"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Total Nilai"
                name="totalValue"
                value={formData.totalValue}
                fullWidth
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                helperText="Otomatis dari data item"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item>
              <Autocomplete
                multiple
                options={categories}
                value={formData.categoryTags}
                onChange={handleTagsChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Kategori"
                    placeholder="Pilih kategori"
                    helperText="Kategorisasi untuk keperluan analisis"
                    fullWidth
                  />
                )}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Keterangan"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                InputLabelProps={{ shrink: true }}
                placeholder="Tambahkan keterangan atau catatan penting tentang transaksi ini"
              />
            </Grid>
          </Grid>
        </Box>
        {error && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="error">{error}</Typography>
          </Box>
        )}
        {itemsError && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="error">{itemsError}</Typography>
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