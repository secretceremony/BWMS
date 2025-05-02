// src/components/StockForm.js
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
  Box
} from '@mui/material';

// Daftar opsi untuk Status dan UoM
const statuses = ['Available', 'Out of Stock', 'Low Stock'];
const uoms = [
    'Pcs', // pieces
    'M',   // meter
    'Mm',  // milimeter
    'Cm',  // centimeter
    'Box', // kotak
    'Ton',
    'Kg',  // kilogram
    'G',   // gram
    'Assy' // assembly
];

const StockForm = ({
  open,
  onClose,
  onSubmit,
  initialData, // Data item jika dalam mode edit, null jika mode tambah
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    part_number: '',
    category: '',
    stock: 0, // Frontend menggunakan 'stock'
    supplier: '',
    status: '',
    uom: '',
    remarks: '',
    price: 0,
  });

  // Sinkronisasi initialData ke formData saat prop berubah
  useEffect(() => {
    console.log("StockForm received initialData:", initialData); // DEBUG
    if (initialData) {
      setFormData({
        id: initialData.id || null,
        name: initialData.name || '',
        // part_number datang dari backend, tipe integer, di form kita pakai TextField (string)
        part_number: initialData.part_number !== undefined && initialData.part_number !== null ? String(initialData.part_number) : '', // Konversi ke string
        category: initialData.category || '',
        // stock datang dari backend (yaitu initialData.quantity), tipe number/integer
        // Map initialData.quantity ke state formData.stock
        stock: initialData.quantity !== undefined && initialData.quantity !== null ? initialData.quantity : 0, // Gunakan initialData.quantity
        supplier: initialData.supplier || '',
        status: initialData.status || '',
        uom: initialData.uom || '',
        remarks: initialData.remarks || '',
        // price datang dari backend, tipe numeric/number
        price: initialData.price !== undefined && initialData.price !== null ? initialData.price : 0, // Pertahankan sebagai number
      });
    } else {
      // Jika mode tambah, reset form
      setFormData({
        id: null,
        name: '',
        part_number: '',
        category: '',
        stock: 0,
        supplier: '',
        status: '',
        uom: '',
        remarks: '',
        price: 0,
      });
    }
     console.log("StockForm formData after useEffect:", formData); // DEBUG - Perhatikan bahwa log ini mungkin menunjukkan state sebelumnya di render pertama setelah initialData update
  }, [initialData]); // Effect dijalankan ulang setiap kali initialData berubah


  const handleChange = (event) => {
    const { name, value } = event.target;
     console.log(`Changing ${name} to "${value}"`); // DEBUG
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

   // Handler untuk input numerik (stock, price).
   const handleNumberInputChange = (event) => {
       const { name, value } = event.target;
       // Handle empty string input for number fields by storing it as '' initially
       if (value === '') {
          console.log(`Changing ${name} to empty string`); // DEBUG
          setFormData((prevData) => ({ ...prevData, [name]: '' }));
          return;
       }

       // Parse sebagai integer (stock) atau float (price)
       const numberValue = name === 'stock' ? parseInt(value, 10) : parseFloat(value);

        // Check if parsing resulted in NaN for non-empty values
        if (isNaN(numberValue)) {
             console.warn(`Input for ${name} is not a valid number: "${value}"`); // DEBUG
             // Option 1: Store as NaN (will fail validation later)
             // setFormData((prevData) => ({ ...prevData, [name]: numberValue }));
             // Option 2: Store as the raw string (validation needs to handle this)
             // setFormData((prevData) => ({ ...prevData, [name]: value }));
             // Option 3: Prevent state update if not a number (most robust for type="number")
             // If type="number" is used, browser input handles much of this.
             // Let's stick to storing the parsed number or NaN if input is not valid.
             setFormData((prevData) => ({ ...prevData, [name]: numberValue }));

        } else {
            console.log(`Changing ${name} to ${numberValue} (parsed number)`); // DEBUG
            setFormData((prevData) => ({
                ...prevData,
                [name]: numberValue, // Simpan sebagai number
            }));
        }
   };

const handleSubmit = (event) => {
  event.preventDefault();

  // Validasi semua field wajib terisi
  const requiredFields = ['name', 'part_number', 'category', 'stock', 'supplier', 'status', 'uom', 'price'];
  for (const field of requiredFields) {
    if (
      formData[field] === '' ||
      formData[field] === null ||
      (typeof formData[field] === 'number' && isNaN(formData[field]))
    ) {
      alert(`Field "${field}" harus diisi.`);
      return;
    }
  }

  const dataToSubmit = {
    id: formData.id ?? undefined, // hanya sertakan jika edit
    name: formData.name.trim(),
    part_number: parseInt(formData.part_number, 10),
    category: formData.category.trim(),
    quantity: Number(formData.stock), // ubah dari stock
    supplier: formData.supplier.trim(),
    status: formData.status,
    uom: formData.uom,
    price: Number(formData.price),
    remarks: formData.remarks?.trim() || null
  };

  console.log("Submitting cleaned data:", dataToSubmit);
  onSubmit(dataToSubmit);
};

  const dialogTitle = initialData ? 'Edit Item Stock' : 'Tambah Item Stock Baru';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>
        {/* Hilangkan component="form" dan onSubmit di sini karena handleSubmit dipanggil di DialogActions */}
        <Box sx={{ mt: -1 }}> {/* Atur margin di Box */}
           <Grid container spacing={2}>
              {/* ID (hanya tampilkan jika edit, tidak bisa diedit) */}
               {initialData && (
                   <Grid item xs={12} sm={6}>
                       <TextField
                           label="ID"
                           value={formData.id || ''} // Pastikan value tidak null/undefined untuk TextField
                           fullWidth
                           disabled
                           InputLabelProps={{ shrink: true }}
                       />
                   </Grid>
               )}
              <Grid item xs={12} sm={ initialData ? 6 : 12}>
                   <TextField
                       label="Nama"
                       name="name"
                       value={formData.name}
                       onChange={handleChange}
                       fullWidth
                       required
                       InputLabelProps={{ shrink: true }}
                   />
               </Grid>
               <Grid item xs={12} sm={6}>
                   {/* Part Number sekarang TextField */}
                   <TextField
                       label="Part Number"
                       name="part_number"
                       value={formData.part_number} // Nilai dari state (string)
                       onChange={handleChange} // Menggunakan handleChange biasa karena input type text
                       fullWidth
                       required
                       InputLabelProps={{ shrink: true }}
                       // type="text" // Tetap sebagai text input untuk fleksibilitas part number
                       // InputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} // Opsional: jika hanya angka
                   />
               </Grid>
                <Grid item xs={12} sm={6}>
                   {/* Category sekarang TextField */}
                   <TextField
                       label="Category"
                       name="category"
                       value={formData.category}
                       onChange={handleChange}
                       fullWidth
                       required
                       InputLabelProps={{ shrink: true }}
                   />
               </Grid>
               <Grid item xs={12} sm={6}>
                   <TextField
                       label="Stock" // Label "Stock" sesuai nama field di state
                       name="stock" // State name 'stock'
                       value={formData.stock} // Value dari state (number atau '')
                       onChange={handleNumberInputChange} // Menggunakan handler number
                       fullWidth
                       required
                       type="number"
                       InputLabelProps={{ shrink: true }}
                       inputProps={{ min: 0 }}
                   />
               </Grid>
               <Grid item xs={12} sm={6}>
                   {/* Supplier sekarang TextField */}
                   <TextField
                       label="Supplier"
                       name="supplier"
                       value={formData.supplier}
                       onChange={handleChange}
                       fullWidth
                       required
                       InputLabelProps={{ shrink: true }}
                   />
               </Grid>
               <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                       <InputLabel shrink>Status</InputLabel>
                       <Select
                           name="status"
                           value={formData.status} // Value dari state
                           onChange={handleChange}
                           displayEmpty
                           inputProps={{ 'aria-label': 'Status' }}
                       >
                           <MenuItem value="" disabled>Pilih Status</MenuItem>
                            {statuses.map(stat => (
                               <MenuItem key={stat} value={stat}>{stat}</MenuItem>
                           ))}
                       </Select>
                   </FormControl>
               </Grid>
                <Grid item xs={12} sm={6}>
                   <FormControl fullWidth required>
                       <InputLabel shrink>UoM</InputLabel>
                       <Select
                           name="uom"
                           value={formData.uom} // Value dari state
                           onChange={handleChange}
                           displayEmpty
                            inputProps={{ 'aria-label': 'Unit of Measurement' }}
                       >
                            <MenuItem value="" disabled>Pilih UoM</MenuItem>
                            {uoms.map(u => (
                               <MenuItem key={u} value={u}>{u}</MenuItem>
                           ))}
                       </Select>
                   </FormControl>
               </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                       label="Price"
                       name="price"
                       value={formData.price} // Value dari state
                       onChange={handleNumberInputChange} // Menggunakan handler number
                       fullWidth
                       required
                       type="number"
                       InputLabelProps={{ shrink: true }}
                       inputProps={{ min: 0, step: "0.01" }}
                   />
               </Grid>
               <Grid item xs={12}>
                   <TextField
                       label="Remarks"
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
            {/* Tampilkan pesan error simpan jika ada */}
           {error && (
               <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                   Save Error: {error}
               </Typography>
           )}
        {/* Hilangkan tombol submit di sini karena kita menggunakan DialogActions */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Batal</Button>
        <Button
          // type="submit" // Tidak perlu type="submit" jika form tidak di <Box>
          onClick={handleSubmit} // Panggil handler saat tombol diklik
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {initialData ? 'Simpan Perubahan' : 'Tambah Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockForm;