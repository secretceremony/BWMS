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
    itemId: '',
    transactionType: 'incoming', // default ke 'incoming'
    quantity: '',
    unitPrice: '',
    totalValue: '',
    source: '',  // supplier/customer
    documentRef: '', // referensi dokumen (nomor PO, nomor surat jalan, dsb)
    location: '', // lokasi penyimpanan
    remarks: '',
    transactionDate: new Date().toISOString().split('T')[0],
    categoryTags: [], // tag kategori untuk pengelompokan
  });

  const [stockItems, setStockItems] = useState([]);
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'PT Supplier Utama' }, 
    { id: 2, name: 'CV Mitra Sejahtera' },
    { id: 3, name: 'UD Makmur Jaya' }
  ]); // Sample data, idealnya diambil dari API
  const [locations, setLocations] = useState([
    'Gudang Utama', 'Gudang B', 'Rak Depan', 'Rak Belakang', 'Lemari Khusus'
  ]); // Sample data
  const [categories, setCategories] = useState([
    'Elektronik', 'ATK', 'Furniture', 'Peralatan', 'Bahan Baku', 'Produk Jadi', 'Lain-lain'
  ]); // Sample data
  
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  // Reset form saat dialog ditutup
  const resetForm = () => {
    setFormData({
      itemId: '',
      transactionType: 'incoming',
      quantity: '',
      unitPrice: '',
      totalValue: '',
      source: '',
      documentRef: '',
      location: '',
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
        itemId: editData.item_id || '',
        transactionType: editData.jenis === 'Stock In' ? 'incoming' : 'outgoing',
        quantity: editData.quantity || '',
        unitPrice: editData.unitPrice || '',
        totalValue: editData.totalValue || '',
        source: editData.source || '',
        documentRef: editData.documentRef || '',
        location: editData.location || '',
        remarks: editData.remarks || '',
        transactionDate: editData.tanggal || new Date().toISOString().split('T')[0],
        categoryTags: editData.categoryTags || [],
      });
      
      // Set selected item jika tersedia
      if (editData.item_id) {
        const item = stockItems.find(item => item.id === editData.item_id);
        if (item) setSelectedItem(item);
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
  
  // Handler untuk Autocomplete item
  const handleItemChange = (event, newValue) => {
    setSelectedItem(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        itemId: newValue.id,
        unitPrice: newValue.price || ''
      }));
      setValidationErrors(prev => ({ ...prev, itemId: '' }));
    } else {
      setFormData(prev => ({
        ...prev,
        itemId: '',
        unitPrice: ''
      }));
    }
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
    if (!formData.itemId) errors.itemId = 'Pemilihan item diperlukan.';
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
      documentRef: formData.documentRef,
      location: formData.location,
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
          <Grid container spacing={theme.spacing(2)}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Informasi Dasar Transaksi
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            {/* Transaction Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.transactionType}>
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

            {/* Document Reference */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Referensi Dokumen"
                name="documentRef"
                value={formData.documentRef}
                onChange={handleChange}
                fullWidth
                placeholder="Contoh: PO-2023-001, SJ-2023-001"
                InputLabelProps={{ shrink: true }}
                helperText="Nomor PO, Surat Jalan, atau dokumen lainnya"
              />
            </Grid>
            
            {/* Source/Supplier/Customer */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.source}>
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
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom color="primary" sx={{ mt: 2 }}>
                Informasi Item & Kuantitas
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
           
            {/* Item Selection - Using Autocomplete for better UX */}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!validationErrors.itemId}>
                <Autocomplete
                  options={stockItems}
                  getOptionLabel={(option) => `${option.name} (${option.id})`}
                  loading={itemsLoading}
                  value={selectedItem}
                  onChange={handleItemChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Pilih Item"
                      required
                      error={!!validationErrors.itemId}
                      helperText={validationErrors.itemId}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} sm={4}>
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
            
            {/* Unit Price */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Harga Satuan"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                fullWidth
                type="number"
                error={!!validationErrors.unitPrice}
                helperText={validationErrors.unitPrice || "Kosongkan jika tidak diketahui"}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            {/* Total Value - Auto calculated but can be manually adjusted */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Total Nilai"
                name="totalValue"
                value={formData.totalValue}
                onChange={handleChange}
                fullWidth
                disabled={formData.unitPrice && formData.quantity}
                InputLabelProps={{ shrink: true }}
                helperText="Nilai dihitung otomatis"
              />
            </Grid>
            
            {/* Storage Location */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.location}>
                <InputLabel>Lokasi Penyimpanan</InputLabel>
                <Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  displayEmpty
                  label="Lokasi Penyimpanan"
                >
                  <MenuItem value="">-</MenuItem>
                  {locations.map((location, index) => (
                    <MenuItem key={index} value={location}>{location}</MenuItem>
                  ))}
                </Select>
                <FormHelperText error>{validationErrors.location}</FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Category Tags - Multiple selection */}
            <Grid item xs={12} sm={6}>
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