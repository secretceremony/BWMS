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

// API URL from environment
const API_URL = import.meta.env.VITE_API_BASE_URL;

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
    category: '',
    stock: 0, // Frontend menggunakan 'stock'
    supplier: '',
    status: '',
    uom: '',
    remarks: '',
    price: 0,
  });

  // State untuk daftar supplier dari database
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [supplierError, setSupplierError] = useState(null);

  // Fetch suppliers dari API
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!API_URL) {
        setSupplierError("API URL tidak dikonfigurasi");
        return;
      }

      setLoadingSuppliers(true);
      setSupplierError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setSupplierError("Token autentikasi tidak ditemukan");
          return;
        }

        const response = await fetch(`${API_URL}/api/suppliers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setSupplierError("Gagal mengambil data supplier");
      } finally {
        setLoadingSuppliers(false);
      }
    };

    if (open) {
      fetchSuppliers();
    }
  }, [open, API_URL]);

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
           <Grid container direction="column" spacing={2}>
              {/* ID (hanya tampilkan jika edit, tidak bisa diedit) */}
               {initialData && (
                   <Grid item xs={12}>
                       <TextField
                           label="ID"
                           value={formData.id || ''} // Pastikan value tidak null/undefined untuk TextField
                           fullWidth
                           disabled
                           InputLabelProps={{ shrink: true }}
                       />
                   </Grid>
               )}
              <Grid item xs={12}>
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

               <Grid item xs={12}>
                   <TextField
                       label="Part Number"
                       name="part_number"
                       value={formData.part_number}
                       onChange={handleChange}
                       fullWidth
                       required
                       InputLabelProps={{ shrink: true }}
                   />
               </Grid>

               <Grid item xs={12}>
                   <TextField
                       label="Kategori"
                       name="category"
                       value={formData.category}
                       onChange={handleChange}
                       fullWidth
                       required
                       InputLabelProps={{ shrink: true }}
                   />
               </Grid>

               <Grid item xs={12}>
                   <TextField
                       label="Stok"
                       name="stock"
                       value={formData.stock}
                       onChange={handleNumberInputChange}
                       fullWidth
                       required
                       type="number"
                       InputLabelProps={{ shrink: true }}
                   />
               </Grid>

               <Grid item xs={12}>
                   <FormControl fullWidth required>
                       <InputLabel id="supplier-label">Supplier</InputLabel>
                       <Select
                           labelId="supplier-label"
                           name="supplier"
                           value={formData.supplier}
                           onChange={handleChange}
                           label="Supplier"
                           disabled={loadingSuppliers}
                       >
                           {loadingSuppliers ? (
                               <MenuItem value="">
                                   <CircularProgress size={20} /> Loading...
                               </MenuItem>
                           ) : supplierError ? (
                               <MenuItem value="">
                                   Error: {supplierError}
                               </MenuItem>
                           ) : (
                               suppliers.map((supplier) => (
                                   <MenuItem key={supplier.id} value={supplier.name}>
                                       {supplier.name}
                                   </MenuItem>
                               ))
                           )}
                       </Select>
                   </FormControl>
               </Grid>

               <Grid item xs={12}>
                   <FormControl fullWidth required>
                       <InputLabel id="uom-label">Unit of Measure</InputLabel>
                       <Select
                           labelId="uom-label"
                           name="uom"
                           value={formData.uom}
                           onChange={handleChange}
                           label="Unit of Measure"
                       >
                           {uoms.map((uom) => (
                               <MenuItem key={uom} value={uom}>
                                   {uom}
                               </MenuItem>
                           ))}
                       </Select>
                   </FormControl>
               </Grid>

               <Grid item xs={12}>
                   <TextField
                       label="Harga"
                       name="price"
                       value={formData.price}
                       onChange={handleNumberInputChange}
                       fullWidth
                       required
                       type="number"
                       InputLabelProps={{ shrink: true }}
                   />
               </Grid>

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
                   />
               </Grid>
           </Grid>

           {/* Error message */}
           {error && (
               <Box sx={{ mt: 2 }}>
                   <Typography color="error">{error}</Typography>
               </Box>
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

export default StockForm;