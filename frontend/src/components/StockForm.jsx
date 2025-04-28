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
    'M',   // meter
    'Mm',  // milimeter
    'Cm',  // centimeter
    'Box', // kotak
    'Ton',
    'Kg',  // kilogram
    'G',   // gram
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
    category: '', // Sekarang text
    stock: 0, // Frontend menggunakan 'stock'
    supplier: '', // Sekarang text
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
        // part_number datang dari backend, tipe integer, di form kita pakai TextField
        part_number: initialData.part_number !== undefined && initialData.part_number !== null ? String(initialData.part_number) : '', // Konversi ke string
        category: initialData.category || '',
        // stock datang dari backend (hasil mapping quantity), tipe number/integer
        stock: initialData.stock !== undefined && initialData.stock !== null ? initialData.stock : 0, // Pertahankan sebagai number/integer
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
     console.log("StockForm formData after useEffect:", formData); // DEBUG
  }, [initialData]); // Effect dijalankan ulang setiap kali initialData berubah


  const handleChange = (event) => {
    const { name, value } = event.target;
     console.log(`Changing ${name} to ${value}`); // DEBUG
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

   // Handler untuk input numerik (stock, price). Part_number sekarang ditangani sebagai string jika TextField.
   const handleNumberInputChange = (event) => {
       const { name, value } = event.target;
       // Untuk stock dan price, parse sebagai float/integer
       const numberValue = value === '' ? '' : (name === 'stock' ? parseInt(value, 10) : parseFloat(value)); // Use parseInt for stock

        console.log(`Changing ${name} to ${numberValue} (parsed number)`); // DEBUG

       setFormData((prevData) => ({
           ...prevData,
           [name]: numberValue, // Simpan sebagai number
       }));
   };


  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Tambahkan validasi form sebelum submit

    if (onSubmit) {
       const dataToSubmit = {
           ...formData,
           // Mapping 'stock' ke 'quantity' untuk backend
           quantity: formData.stock,
           // Pastikan part_number adalah integer atau number jika backend mengharapkan itu
           // Karena TextField, value-nya string. Konversi ke Number/Integer di sini
           part_number: parseInt(formData.part_number, 10), // Konversi string input part_number ke integer
           // Pastikan price adalah number (sudah di handleNumberInputChange)
       };

       // Hapus kolom 'stock' dan 'id' (jika mode tambah) sebelum kirim ke backend
       delete dataToSubmit.stock;
       if (!dataToSubmit.id) {
           delete dataToSubmit.id;
       } else {
           // Jika mode edit, pastikan id ada
           dataToSubmit.id = formData.id;
       }

       // Hapus field yang tidak relevan jika perlu
       // delete dataToSubmit.stock; // Sudah dilakukan di atas

       console.log("Submitting data:", dataToSubmit); // DEBUG data yang dikirim
       onSubmit(dataToSubmit);
    }
  };

  const dialogTitle = initialData ? 'Edit Item Stock' : 'Tambah Item Stock Baru';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -1 }}>
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
                       // type="number" // Tetap sebagai text input untuk fleksibilitas part number
                       InputLabelProps={{ shrink: true }}
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
                       label="Quantity"
                       name="stock" // State name 'stock'
                       value={formData.stock}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Batal</Button>
        <Button
          type="submit" // Trigger form submit
          onClick={handleSubmit} // Tetap panggil handler
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