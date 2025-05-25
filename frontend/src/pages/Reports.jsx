import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  IconButton,
  useTheme,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Divider,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { 
  ArrowBack, 
  ArrowForward, 
  Edit, 
  Delete, 
  InfoOutlined, 
  Add as AddIcon,
  FileDownload,
  PictureAsPdf,
  GridOn,
  FilterList,
  BarChart as BarChartIcon,
  TrendingUp,
  Email,
  Print,
} from '@mui/icons-material';
import SearchInput from '../components/SearchInput';
import ReportForm from '../components/ReportForm';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Get Backend URL from environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get authentication token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const Report = ({ user }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  
  // State untuk tab laporan
  const [reportTab, setReportTab] = useState(0); // 0 = Transaksi, 1 = Stok Barang
  
  // State untuk integrasi backend
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [stockItems, setStockItems] = useState([]);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [monthlyTransactions, setMonthlyTransactions] = useState(0);

  // State untuk form dialog
  const [openForm, setOpenForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  // State untuk dialog konfirmasi hapus
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // State untuk filter ekspor
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // State untuk notifikasi sukses
  const [openSuccessNotif, setOpenSuccessNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  
  // State untuk notifikasi error
  const [openErrorNotif, setOpenErrorNotif] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // State untuk filter lanjutan
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const openFilterMenu = Boolean(filterAnchorEl);
  const [filterType, setFilterType] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  // State untuk filter email
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    recipient: '',
    subject: 'Laporan Inventory PT Biruni Altha Ethan',
    message: ''
  });
  
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState(null);

  // State untuk mode laporan (detail/summary)
  const [reportMode, setReportMode] = useState('detail');
  
  // Fungsi penanganan error
  const handleError = (errorSource, error) => {
    console.error(`Error ${errorSource}:`, error);
    setErrorMessage(`Terjadi kesalahan saat ${errorSource}: ${error.message || 'Error tidak diketahui'}`);
    setOpenErrorNotif(true);
  };

  // Fungsi untuk mengambil data dari backend
  const fetchReportData = async () => {
    if (!API_URL) {
      setError("Konfigurasi aplikasi error: API URL tidak tersedia.");
      setLoading(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("Token autentikasi tidak ditemukan. Silakan login.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mengambil data item terlebih dahulu untuk mendapatkan informasi item
      let stockData = [];
      try {
        const stockResponse = await fetch(`${API_URL}/api/stock`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (stockResponse.ok) {
          stockData = await stockResponse.json();
          setStockItems(stockData); // Simpan semua data stok
          
          // Hitung total nilai inventory (asumsi setiap item memiliki price)
          let totalValue = 0;
          stockData.forEach(item => {
            if (item.price && item.quantity) {
              totalValue += (item.price * item.quantity);
            }
          });
          setTotalStockValue(totalValue);
        }
      } catch (stockErr) {
        console.error("Error fetching stock data:", stockErr);
      }

      // Mengambil data reports dari endpoint baru
      const response = await fetch(`${API_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Sesi login telah berakhir. Silakan login kembali.");
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Format data dari endpoint reports
      const formattedReports = data.map(item => {
        return {
          id: item.id,
          jenis: item.transaction_type === 'incoming' ? 'Stock In' : 
                 item.transaction_type === 'outgoing' ? 'Stock Out' : 
                 'Stock Adjustment',
          transactionType: item.transaction_type,
          tanggal: new Date(item.transaction_date).toISOString().split('T')[0],
          item_id: item.item_id,
          itemName: item.item_name,
          itemCode: item.part_number,
          quantity: Math.abs(item.quantity_change),
          unitPrice: item.price,
          totalValue: Math.abs(item.quantity_change) * (item.price || 0),
          location: item.location,
          source: item.source,
          documentRef: item.document_ref,
          remarks: item.remarks,
          category: item.category,
          supplier: item.supplier
        };
      });

      setReports(formattedReports);
      setTotalItems(formattedReports.length);
      
      // Hitung jumlah transaksi bulanan (dalam 30 hari terakhir)
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      
      const monthlyCount = formattedReports.filter(report => {
        const reportDate = new Date(report.tanggal);
        return reportDate >= oneMonthAgo;
      }).length;
      
      setMonthlyTransactions(monthlyCount);
      
    } catch (err) {
      handleError('mengambil data laporan', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Memanggil fungsi fetchReportData saat komponen dimuat
  useEffect(() => {
    fetchReportData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const filteredReports = reports.filter(report => {
    const query = searchQuery.trim().toLowerCase();
    // Search by id, jenis, tanggal, itemName, remarks
    const matchSearch = !query ||
      (report.id && report.id.toString().includes(query)) ||
      (report.jenis && report.jenis.toLowerCase().includes(query)) ||
      (report.tanggal && report.tanggal.toLowerCase().includes(query)) ||
      (report.itemName && report.itemName.toLowerCase().includes(query)) ||
      (report.remarks && report.remarks.toLowerCase().includes(query));
    // Filter by type (jika ada)
    let matchType = true;
    const typeFilter = activeFilters.find(filter => filter.type === 'type');
    if (typeFilter) {
      if (typeFilter.value === 'Stock In') matchType = report.transactionType === 'incoming';
      else if (typeFilter.value === 'Stock Out') matchType = report.transactionType === 'outgoing';
      else if (typeFilter.value === 'Stock Adjustment') matchType = report.transactionType === 'adjustment';
    }
    // Filter by startDate (jika ada)
    let matchStartDate = true;
    const startDateFilter = activeFilters.find(filter => filter.type === 'startDate');
    if (startDateFilter && report.tanggal) matchStartDate = report.tanggal >= startDateFilter.value;
    // Filter by endDate (jika ada)
    let matchEndDate = true;
    const endDateFilter = activeFilters.find(filter => filter.type === 'endDate');
    if (endDateFilter && report.tanggal) matchEndDate = report.tanggal <= endDateFilter.value;
    return matchSearch && matchType && matchStartDate && matchEndDate;
  });

  // Jika search/filter menghasilkan kosong, tampilkan semua data (fallback)
  const finalReports = filteredReports.length === 0 && searchQuery === '' && activeFilters.length === 0 ? reports : filteredReports;

  // Filter data stok barang
  const filteredStockItems = stockItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchSearch =
      item.id.toString().includes(query) ||
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.part_number && item.part_number.toString().toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.supplier && item.supplier.toLowerCase().includes(query)) ||
      (item.status && item.status.toLowerCase().includes(query));
    const matchCategory = !filterType || item.category === filterType;
    const matchSupplier = !filterStartDate || item.supplier === filterStartDate;
    return matchSearch && matchCategory && matchSupplier;
  });

  // Pagination untuk laporan transaksi
  const paginatedReports = finalReports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Pagination untuk laporan stok
  const paginatedStockItems = filteredStockItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handler untuk membuka form tambah laporan
  const handleOpenAddForm = () => {
    setIsEdit(false);
    setEditData(null);
    setFormError(null);
    setOpenForm(true);
  };

  // Handler untuk membuka form edit laporan
  const handleOpenEditForm = (reportData) => {
    setIsEdit(true);
    setEditData(reportData);
    setFormError(null);
    setOpenForm(true);
  };

  // Handler untuk membuka dialog konfirmasi hapus
  const handleOpenDeleteDialog = (item) => {
    setItemToDelete(item);
    setOpenDeleteDialog(true);
  };

  // Handler untuk mengubah filter tanggal ekspor
  const handleExportDateChange = (e) => {
    const { name, value } = e.target;
    setExportDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler untuk proses ekspor dengan filter
  const handleProcessExport = (exportType) => {
    setShowExportOptions(false);
    let dataToExport;
    if (reportTab === 0) {
      dataToExport = [...finalReports];
      if (exportType === 'pdf') {
        exportToPDF(dataToExport);
      } else if (exportType === 'excel') {
        exportToExcel(dataToExport);
      }
    } else {
      dataToExport = [...filteredStockItems];
      if (exportType === 'pdf') {
        exportStockToPDF(dataToExport);
      } else if (exportType === 'excel') {
        exportStockToExcel(dataToExport);
      }
    }
  };

  // Fungsi ekspor ke PDF
  const exportToPDF = (dataToExport) => {
    try {
      // Inisialisasi jsPDF dengan orientasi landscape
      const doc = new jsPDF('landscape');
      
      // Dapatkan tanggal saat ini
      const currentDate = new Date().toLocaleDateString('id-ID');
      
      // Definisikan ukuran dan margin
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const lineHeight = 8;
      let y = margin;
      
      // Tambahkan header
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("Laporan Transaksi Inventory", margin, y);
      y += lineHeight * 2;
      
      // Tambahkan info tambahan
      doc.setFontSize(11);
      doc.text(`Dicetak pada: ${currentDate}`, margin, y);
      y += lineHeight;
      doc.text(`Total Transaksi: ${totalItems}`, margin, y);
      y += lineHeight;
      doc.text(`Total Item Stok: ${stockItems.length}`, margin, y);
      y += lineHeight * 2;
      
      // Buat tabel sederhana tanpa menggunakan autoTable
      // Definisikan kolom dan lebar
      const columns = [
        { header: "ID", width: 30 },
        { header: "Jenis", width: 50 },
        { header: "Tanggal", width: 50 },
        { header: "Kuantitas", width: 40 },
        { header: "Keterangan", width: 100 }
      ];
      
      // Tentukan posisi header
      let x = margin;
      
      // Tambahkan header tabel
      doc.setFillColor(41, 128, 185); // Warna biru
      doc.setTextColor(255, 255, 255); // Warna putih
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      
      // Buat background header
      doc.rect(margin, y, pageWidth - margin * 2, lineHeight, 'F');
      
      // Tambahkan teks header
      columns.forEach(column => {
        doc.text(column.header, x, y + lineHeight - 2);
        x += column.width;
      });
      y += lineHeight;
      
      // Tambahkan data baris
      doc.setTextColor(0, 0, 0); // Reset warna teks
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      
      // Batasi hanya 20 baris untuk mencegah PDF terlalu panjang
      const maxRows = Math.min(dataToExport.length, 20);
      
      for (let i = 0; i < maxRows; i++) {
        const report = dataToExport[i];
        x = margin;
        
        // Buat background baris bergantian
        if (i % 2 === 0) {
          doc.setFillColor(240, 240, 240); // Warna abu-abu muda
          doc.rect(margin, y, pageWidth - margin * 2, lineHeight, 'F');
        }
        
        // Tambahkan data ke setiap sel
        doc.text(report.id.toString(), x, y + lineHeight - 2);
        x += columns[0].width;
        
        doc.text(report.jenis, x, y + lineHeight - 2);
        x += columns[1].width;
        
        doc.text(report.tanggal, x, y + lineHeight - 2);
        x += columns[2].width;
        
        doc.text(report.quantity.toString(), x, y + lineHeight - 2);
        x += columns[3].width;
        
        doc.text(report.remarks || '-', x, y + lineHeight - 2);
        
        y += lineHeight;
      }
      
      // Tambahkan footer jika data dibatasi
      if (dataToExport.length > maxRows) {
        y += lineHeight;
        doc.setFont(undefined, 'italic');
        doc.text(`* Hanya menampilkan ${maxRows} dari ${dataToExport.length} transaksi.`, margin, y);
      }
      
      // Tambahkan footer halaman
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `PT Biruni Altha Ethan - Laporan dicetak pada ${currentDate}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      
      // Simpan PDF
      const filename = `Laporan_Transaksi_${currentDate.replace(/\//g, '-')}`;
      doc.save(`${filename}.pdf`);
      
      // Tampilkan notifikasi sukses
      setNotifMessage('Ekspor PDF berhasil! File telah disimpan ke perangkat Anda.');
      setOpenSuccessNotif(true);
    } catch (error) {
      handleError('mengekspor ke PDF', error);
    }
  };
  
  // Fungsi ekspor ke Excel
  const exportToExcel = (dataToExport) => {
    try {
      // Persiapkan data untuk Excel
      const worksheetData = dataToExport.map(report => ({
        'ID Transaksi': report.id,
        'Jenis Transaksi': report.jenis,
        'Tanggal': report.tanggal,
        'Kuantitas': report.quantity,
        'Keterangan': report.remarks || '-'
      }));
      
      // Buat worksheet dari data
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      
      // Atur lebar kolom
      const colWidths = [
        { wch: 10 },  // ID Transaksi
        { wch: 15 },  // Jenis Transaksi
        { wch: 12 },  // Tanggal
        { wch: 10 },  // Kuantitas
        { wch: 40 },  // Keterangan
      ];
      worksheet['!cols'] = colWidths;
      
      // Buat workbook baru
      const workbook = XLSX.utils.book_new();
      
      // Tambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Transaksi");
      
      // Buat sheet info tambahan
      const infoData = [
        ['Laporan Transaksi Inventory'],
        ['PT Biruni Altha Ethan'],
        [''],
        ['Dicetak pada:', new Date().toLocaleDateString('id-ID')],
        ['Total Transaksi:', totalItems],
        ['Total Item Stok:', stockItems.length],
        ['Filter Pencarian:', searchQuery || '(Tidak ada)']
      ];
      
      // Tambahkan sheet info ke workbook
      const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
      XLSX.utils.book_append_sheet(workbook, infoSheet, "Info");
      
      // Tentukan nama file dan simpan
      const currentDate = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
      const filename = `Laporan_Transaksi_${currentDate}`;
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      
      // Tampilkan notifikasi sukses
      setNotifMessage('Ekspor Excel berhasil! File telah disimpan ke perangkat Anda.');
      setOpenSuccessNotif(true);
    } catch (error) {
      handleError('mengekspor ke Excel', error);
    }
  };

  // Handler untuk submit form (baik tambah maupun edit)
  const handleFormSubmit = async (transactionType, formData) => {
    setFormLoading(true);
    setFormError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan.");
      }

      // Jika dalam mode edit, gunakan endpoint reports yang baru
      if (isEdit && editData) {
        // Siapkan data untuk endpoint PUT /api/reports/:id
        const reportData = {
          item_id: formData.itemId,
          quantity_change: transactionType === 'incoming' ? formData.quantity : -formData.quantity,
          transaction_type: transactionType,
          transaction_date: formData.transactionDate,
          remarks: formData.remarks,
          source: formData.source || null,
          document_ref: formData.documentRef || null,
          location: formData.location || null
        };
        
        // Kirim request update ke endpoint baru
        const response = await fetch(`${API_URL}/api/reports/${editData.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        }
        
        // Notifikasi sukses
        setNotifMessage('Laporan berhasil diperbarui!');
        setOpenSuccessNotif(true);
      } else {
        // Untuk tambah data baru, tetap gunakan endpoint yang ada
        const endpoint = transactionType === 'incoming' ? 'stock/incoming' : 'stock/outgoing';
        
        // Siapkan data untuk dikirim
        const postData = {
          itemId: formData.itemId,
          quantity: formData.quantity,
          remarks: formData.remarks,
          transactionDate: formData.transactionDate
        };
        
        // Tambahkan properti lain jika tersedia
        if (formData.source) postData.source = formData.source;
        if (formData.documentRef) postData.documentRef = formData.documentRef;
        if (formData.location) postData.location = formData.location;

        // Kirim data ke backend
        const response = await fetch(`${API_URL}/api/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        }
        
        // Notifikasi sukses
        setNotifMessage('Laporan baru berhasil ditambahkan!');
        setOpenSuccessNotif(true);
      }

      // Tutup form dan refresh data
      setOpenForm(false);
      fetchReportData();

    } catch (err) {
      console.error(`Error ${isEdit ? 'updating' : 'adding'} report:`, err);
      setFormError(err.message || `Terjadi kesalahan saat ${isEdit ? 'memperbarui' : 'menambahkan'} laporan.`);
    } finally {
      setFormLoading(false);
    }
  };

  // Handler untuk menghapus laporan
  const handleDeleteReport = async () => {
    setDeleteLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan.");
      }
      
      if (!itemToDelete || !itemToDelete.id) {
        throw new Error("Data yang akan dihapus tidak valid.");
      }
      
      // URL berbeda untuk hapus berdasarkan jenis tab
      const deleteUrl = reportTab === 0 
        ? `${API_URL}/api/reports/${itemToDelete.id}` // Hapus laporan transaksi
        : `${API_URL}/api/stock/${itemToDelete.id}`; // Hapus item stok
      
      // Kirim request delete ke endpoint yang sesuai
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Perbarui state berdasarkan jenis tab
      if (reportTab === 0) {
        // Perbarui state reports (transaksi)
        setReports(prevReports => prevReports.filter(report => report.id !== itemToDelete.id));
      } else {
        // Perbarui state stockItems
        setStockItems(prevStockItems => prevStockItems.filter(item => item.id !== itemToDelete.id));
      }
      
      // Tampilkan notifikasi sukses
      const successMessage = reportTab === 0
        ? `Transaksi #${itemToDelete.id} berhasil dihapus.`
        : `Item stok "${itemToDelete.name}" berhasil dihapus.`;
        
      setNotifMessage(successMessage);
      setOpenSuccessNotif(true);
      
      // Tutup dialog
      setOpenDeleteDialog(false);
      setItemToDelete(null);

      // Jika halaman saat ini kosong setelah penghapusan, kembali ke halaman sebelumnya
      const items = reportTab === 0 ? reports : stockItems;
      const remainingItems = items.length - 1;
      const maxPage = Math.ceil(remainingItems / rowsPerPage) - 1;
      if (page > maxPage && maxPage >= 0) {
        setPage(maxPage);
      }
      
    } catch (err) {
      console.error('Error deleting item:', err);
      let errorMsg = `Gagal menghapus ${reportTab === 0 ? 'laporan' : 'item stok'}: `;
      
      if (err.message.includes('FOREIGN KEY')) {
        errorMsg += 'Data ini terkait dengan data lain dan tidak dapat dihapus.';
      } else if (err.message.includes('negative')) {
        errorMsg += 'Penghapusan akan menyebabkan stok negatif.';
      } else {
        errorMsg += err.message;
      }
      
      setErrorMessage(errorMsg);
      setOpenErrorNotif(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handler untuk filter lanjutan
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
  };
  
  const handleFilterDateChange = (event) => {
    const { name, value } = event.target;
    if (name === 'startDate') {
      setFilterStartDate(value);
    } else if (name === 'endDate') {
      setFilterEndDate(value);
    }
  };
  
  const handleApplyFilters = () => {
    const newFilters = [];
    
    if (filterType) {
      newFilters.push({ type: 'type', value: filterType });
    }
    
    if (filterStartDate) {
      newFilters.push({ type: 'startDate', value: filterStartDate });
    }
    
    if (filterEndDate) {
      newFilters.push({ type: 'endDate', value: filterEndDate });
    }
    
    setActiveFilters(newFilters);
    handleFilterClose();
    setPage(0); // Reset ke halaman pertama
  };
  
  const handleRemoveFilter = (index) => {
    const newFilters = [...activeFilters];
    const removedFilter = newFilters.splice(index, 1)[0];
    
    // Reset state yang sesuai
    if (removedFilter.type === 'type') {
      setFilterType('');
    } else if (removedFilter.type === 'startDate') {
      setFilterStartDate('');
    } else if (removedFilter.type === 'endDate') {
      setFilterEndDate('');
    }
    
    setActiveFilters(newFilters);
    setPage(0); // Reset ke halaman pertama
  };
  
  const handleClearFilters = () => {
    setActiveFilters([]);
    setFilterType('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(0); // Reset ke halaman pertama
  };
  
  // Handler untuk email dialog
  const handleOpenEmailDialog = () => {
    setShowEmailDialog(true);
    setEmailError(null);
  };
  
  const handleEmailChange = (event) => {
    const { name, value } = event.target;
    setEmailFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSendEmail = async () => {
    setEmailLoading(true);
    setEmailError(null);
    
    // Simulasi pengiriman email
    try {
      // Simulasi delay karena backend belum diimplementasikan
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNotifMessage('Laporan telah berhasil dikirim ke ' + emailFormData.recipient);
      setOpenSuccessNotif(true);
      setShowEmailDialog(false);
      setEmailFormData({
        recipient: '',
        subject: 'Laporan Inventory PT Biruni Altha Ethan',
        message: ''
      });
    } catch (error) {
      setEmailError('Gagal mengirim email: ' + error.message);
    } finally {
      setEmailLoading(false);
    }
  };
  
  // Handler untuk mode laporan
  const handleReportModeChange = (event) => {
    setReportMode(event.target.value);
  };

  // Handler untuk perubahan tab
  const handleTabChange = (event, newValue) => {
    setReportTab(newValue);
    setPage(0); // Reset halaman saat berganti tab
    setSearchQuery(''); // Reset pencarian saat berganti tab
  };

  // Tambahkan fungsi exportStockToPDF dan exportStockToExcel di bawah fungsi exportToExcel
  const exportStockToPDF = (dataToExport) => {
    try {
      const doc = new jsPDF('landscape');
      const currentDate = new Date().toLocaleDateString('id-ID');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const lineHeight = 8;
      let y = margin;
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("Laporan Stok Barang", margin, y);
      y += lineHeight * 2;
      doc.setFontSize(11);
      doc.text(`Dicetak pada: ${currentDate}`, margin, y);
      y += lineHeight;
      doc.text(`Total Item Stok: ${dataToExport.length}`, margin, y);
      y += lineHeight * 2;
      const columns = [
        { header: "ID", width: 20 },
        { header: "Nama Item", width: 50 },
        { header: "Part Number", width: 30 },
        { header: "Kategori", width: 30 },
        { header: "Kuantitas", width: 25 },
        { header: "Supplier", width: 40 },
        { header: "Status", width: 30 },
        { header: "UOM", width: 20 },
        { header: "Harga", width: 35 },
        { header: "Total", width: 40 },
        { header: "Keterangan", width: 60 }
      ];
      let x = margin;
      doc.setFillColor(41, 128, 185);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.rect(margin, y, pageWidth - margin * 2, lineHeight, 'F');
      columns.forEach(column => {
        doc.text(column.header, x, y + lineHeight - 2);
        x += column.width;
      });
      y += lineHeight;
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      const maxRows = Math.min(dataToExport.length, 20);
      for (let i = 0; i < maxRows; i++) {
        const item = dataToExport[i];
        x = margin;
        if (i % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, y, pageWidth - margin * 2, lineHeight, 'F');
        }
        doc.text(String(item.id), x, y + lineHeight - 2); x += columns[0].width;
        doc.text(item.name || '-', x, y + lineHeight - 2); x += columns[1].width;
        doc.text(item.part_number ? String(item.part_number) : '-', x, y + lineHeight - 2); x += columns[2].width;
        doc.text(item.category || '-', x, y + lineHeight - 2); x += columns[3].width;
        doc.text(item.quantity !== undefined ? String(item.quantity) : '-', x, y + lineHeight - 2); x += columns[4].width;
        doc.text(item.supplier || '-', x, y + lineHeight - 2); x += columns[5].width;
        doc.text(item.status || '-', x, y + lineHeight - 2); x += columns[6].width;
        doc.text(item.uom || '-', x, y + lineHeight - 2); x += columns[7].width;
        doc.text(item.price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price) : '-', x, y + lineHeight - 2); x += columns[8].width;
        const totalValue = (item.price && item.quantity) ? item.price * item.quantity : 0;
        doc.text(totalValue ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalValue) : '-', x, y + lineHeight - 2); x += columns[9].width;
        doc.text(item.remarks ? (item.remarks.length > 20 ? item.remarks.substring(0, 20) + '...' : item.remarks) : '-', x, y + lineHeight - 2);
        y += lineHeight;
      }
      if (dataToExport.length > maxRows) {
        y += lineHeight;
        doc.setFont(undefined, 'italic');
        doc.text(`* Hanya menampilkan ${maxRows} dari ${dataToExport.length} item.`, margin, y);
      }
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `PT Biruni Altha Ethan - Laporan dicetak pada ${currentDate}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      const filename = `Laporan_Stok_${currentDate.replace(/\//g, '-')}`;
      doc.save(`${filename}.pdf`);
      setNotifMessage('Ekspor PDF stok berhasil! File telah disimpan ke perangkat Anda.');
      setOpenSuccessNotif(true);
    } catch (error) {
      handleError('mengekspor stok ke PDF', error);
    }
  };
  const exportStockToExcel = (dataToExport) => {
    try {
      const worksheetData = dataToExport.map(item => ({
        'ID': item.id,
        'Nama Item': item.name,
        'Part Number': item.part_number,
        'Kategori': item.category,
        'Kuantitas': item.quantity,
        'Supplier': item.supplier,
        'Status': item.status,
        'UOM': item.uom,
        'Harga': item.price,
        'Total': (item.price && item.quantity) ? item.price * item.quantity : 0,
        'Keterangan': item.remarks || '-'
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const colWidths = [
        { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
      ];
      worksheet['!cols'] = colWidths;
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Stok Barang");
      const infoData = [
        ['Laporan Stok Barang'],
        ['PT Biruni Altha Ethan'],
        [''],
        ['Dicetak pada:', new Date().toLocaleDateString('id-ID')],
        ['Total Item Stok:', dataToExport.length],
        ['Filter Pencarian:', searchQuery || '(Tidak ada)']
      ];
      const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
      XLSX.utils.book_append_sheet(workbook, infoSheet, "Info");
      const currentDate = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
      const filename = `Laporan_Stok_${currentDate}`;
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      setNotifMessage('Ekspor Excel stok berhasil! File telah disimpan ke perangkat Anda.');
      setOpenSuccessNotif(true);
    } catch (error) {
      handleError('mengekspor stok ke Excel', error);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Section: Dashboard Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6">Total Transaksi</Typography>
            <Typography variant="h4" fontWeight="bold" mt={1}>
              {totalItems}
            </Typography>
            <Typography variant="caption" mt={1}>
              Seluruh transaksi tercatat
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: theme.palette.success.main,
              color: theme.palette.success.contrastText || theme.palette.common.white,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6">Total Item Stok</Typography>
            <Typography variant="h4" fontWeight="bold" mt={1}>
              {stockItems.length}
            </Typography>
            <Typography variant="caption" mt={1}>
              Jenis barang dalam inventori
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: theme.palette.warning.main,
              color: theme.palette.warning.contrastText || theme.palette.common.white,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6">Nilai Inventori</Typography>
            <Typography variant="h4" fontWeight="bold" mt={1}>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
              }).format(totalStockValue)}
            </Typography>
            <Typography variant="caption" mt={1}>
              Total nilai barang saat ini
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: theme.palette.info.main,
              color: theme.palette.info.contrastText || theme.palette.common.white,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6">Transaksi Bulan Ini</Typography>
            <Typography variant="h4" fontWeight="bold" mt={1}>
              {monthlyTransactions}
            </Typography>
            <Typography variant="caption" mt={1}>
              Aktivitas bulan {new Date().toLocaleString('id-ID', { month: 'long' })}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {reportTab === 0 ? 'Laporan Transaksi Inventory' : 'Laporan Stok Barang'}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={2}>
          {reportTab === 0 
            ? 'Laporan ini menampilkan semua transaksi inventory yang telah tercatat dalam sistem, termasuk stock in, stock out, dan stock adjustment.'
            : 'Laporan ini menampilkan semua item stok beserta informasi detail seperti jumlah, kategori, supplier, dan nilai stok.'}
        </Typography>
        
        {/* Tab untuk beralih antara laporan transaksi dan stok */}
        <Tabs 
          value={reportTab} 
          onChange={handleTabChange} 
          aria-label="report tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Laporan Transaksi" />
          <Tab label="Laporan Stok Barang" />
        </Tabs>
      </Card>

      {/* Action Bar: Filter, Search, Export, etc */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {user && user.role === 'admin' && reportTab === 0 && (
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleOpenAddForm}
              startIcon={<AddIcon />}
              sx={{ minWidth: 100, height: 36 }}
            >
              Tambah Laporan
            </Button>
          )}
          <Tooltip title="Filter Laporan">
            <Button
              variant="outlined"
              onClick={handleFilterClick}
              startIcon={<FilterList />}
              color="primary"
              size="small"
              sx={{ minWidth: 100, height: 36 }}
            >
              Filter
            </Button>
          </Tooltip>
          <Menu
            anchorEl={filterAnchorEl}
            open={openFilterMenu}
            onClose={handleFilterClose}
            PaperProps={{ sx: { p: 2, minWidth: 220 } }}
          >
            <Typography variant="subtitle2" gutterBottom>Filter</Typography>
            {reportTab === 0 ? (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Jenis Transaksi</InputLabel>
                <Select
                  value={filterType}
                  label="Jenis Transaksi"
                  onChange={handleFilterTypeChange}
                >
                  <MenuItem value="">Semua</MenuItem>
                  <MenuItem value="Stock In">Stock In</MenuItem>
                  <MenuItem value="Stock Out">Stock Out</MenuItem>
                  <MenuItem value="Stock Adjustment">Stock Adjustment</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={filterType}
                    label="Kategori"
                    onChange={e => setFilterType(e.target.value)}
                  >
                    <MenuItem value="">Semua</MenuItem>
                    {Array.from(new Set(stockItems.map(item => item.category))).filter(Boolean).map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={filterStartDate}
                    label="Supplier"
                    onChange={e => setFilterStartDate(e.target.value)}
                  >
                    <MenuItem value="">Semua</MenuItem>
                    {Array.from(new Set(stockItems.map(item => item.supplier))).filter(Boolean).map(supplier => (
                      <MenuItem key={supplier} value={supplier}>{supplier}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button size="small" onClick={() => { setFilterType(''); setFilterStartDate(''); handleFilterClose(); }}>Reset</Button>
              <Button size="small" variant="contained" onClick={handleApplyFilters}>Terapkan</Button>
            </Box>
          </Menu>
          <Tooltip title="Ekspor Laporan">
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={() => setShowExportOptions(true)}
              color="primary"
              size="small"
              sx={{ minWidth: 100, height: 36 }}
            >
              Ekspor
            </Button>
          </Tooltip>
        </Box>
        <Box sx={{ minWidth: 200 }}>
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder={`Cari ${reportTab === 0 ? 'laporan' : 'item'}...`}
            sx={{ width: { xs: '100%', sm: 250 } }}
          />
        </Box>
      </Stack>
      
      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2">Filter Aktif:</Typography>
          {activeFilters.map((filter, index) => (
            <Chip
              key={index}
              label={
                filter.type === 'type' ? `Jenis: ${filter.value}` :
                filter.type === 'startDate' ? `Dari: ${filter.value}` :
                filter.type === 'endDate' ? `Sampai: ${filter.value}` : ''
              }
              onDelete={() => handleRemoveFilter(index)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
          <Button 
            variant="text" 
            size="small" 
            onClick={handleClearFilters}
            sx={{ ml: 1 }}
          >
            Hapus Semua
          </Button>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card elevation={3}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%', maxWidth: '100vw' }}>
            {/* Tabel Laporan Transaksi */}
            {reportTab === 0 && (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Jenis</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nama Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kuantitas</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Harga</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Asal/Tujuan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Dokumen Ref</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Keterangan</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Aksi
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedReports.length > 0 ? (
                    paginatedReports.map((report) => (
                      <TableRow 
                        key={report.id} 
                        hover
                        sx={{
                          backgroundColor: 
                            report.transactionType === 'incoming' ? theme.palette.success.light + '20' : 
                            report.transactionType === 'outgoing' ? theme.palette.error.light + '20' : 
                            theme.palette.warning.light + '20'
                        }}
                      >
                        <TableCell>{report.id}</TableCell>
                        <TableCell>
                          <Chip 
                            label={report.jenis}
                            size="small"
                            sx={{ 
                              bgcolor: 
                                report.transactionType === 'incoming' ? theme.palette.success.light : 
                                report.transactionType === 'outgoing' ? theme.palette.error.light : 
                                theme.palette.warning.light,
                              color: 
                                report.transactionType === 'incoming' ? theme.palette.success.dark : 
                                report.transactionType === 'outgoing' ? theme.palette.error.dark : 
                                theme.palette.warning.dark,
                            }}
                          />
                        </TableCell>
                        <TableCell>{new Date(report.tanggal).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>{report.item_id || '-'}</TableCell>
                        <TableCell>
                          {report.itemName || '-'}
                        </TableCell>
                        <TableCell>{report.category || '-'}</TableCell>
                        <TableCell>{report.quantity}</TableCell>
                        <TableCell>
                          {report.unitPrice 
                            ? new Intl.NumberFormat('id-ID', { 
                                style: 'currency', 
                                currency: 'IDR',
                                maximumFractionDigits: 0 
                              }).format(report.unitPrice)
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {report.totalValue 
                            ? new Intl.NumberFormat('id-ID', { 
                                style: 'currency', 
                                currency: 'IDR',
                                maximumFractionDigits: 0 
                              }).format(report.totalValue)
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{report.source || '-'}</TableCell>
                        <TableCell>{report.documentRef || '-'}</TableCell>
                        <TableCell>
                          <Tooltip title={report.remarks || "Tidak ada keterangan"}>
                            <span>{report.remarks ? (report.remarks.length > 20 ? report.remarks.substring(0, 20) + '...' : report.remarks) : '-'}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          {user && user.role === 'admin' && (
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton size="small" color="primary" onClick={() => handleOpenEditForm(report)}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(report)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={13} align="center" sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                          <InfoOutlined sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Tidak ada data yang sesuai dengan kriteria pencarian atau filter.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {/* Tabel Laporan Stok Barang */}
            {reportTab === 1 && (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nama Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Part Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kuantitas</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>UOM</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Harga Satuan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nilai Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Keterangan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedStockItems.length > 0 ? (
                    paginatedStockItems.map((item) => {
                      const totalValue = (item.price && item.quantity) ? item.price * item.quantity : 0;
                      return (
                        <TableRow 
                          key={item.id} 
                          hover
                          sx={{
                            backgroundColor: item.quantity <= 10 
                              ? theme.palette.error.light + '20'
                              : item.quantity <= 50
                                ? theme.palette.warning.light + '20'
                                : 'inherit'
                          }}
                        >
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.part_number || '-'}</TableCell>
                          <TableCell>{item.category || '-'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={item.quantity} 
                              size="small"
                              color={
                                item.quantity <= 10 ? "error" :
                                item.quantity <= 50 ? "warning" :
                                "success"
                              }
                            />
                          </TableCell>
                          <TableCell>{item.supplier || '-'}</TableCell>
                          <TableCell>{item.status || '-'}</TableCell>
                          <TableCell>{item.uom || '-'}</TableCell>
                          <TableCell>
                            {item.price 
                              ? new Intl.NumberFormat('id-ID', { 
                                  style: 'currency', 
                                  currency: 'IDR',
                                  maximumFractionDigits: 0 
                                }).format(item.price)
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {totalValue 
                              ? new Intl.NumberFormat('id-ID', { 
                                  style: 'currency', 
                                  currency: 'IDR',
                                  maximumFractionDigits: 0 
                                }).format(totalValue)
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Tooltip title={item.remarks || "Tidak ada keterangan"}>
                              <span>{item.remarks ? (item.remarks.length > 20 ? item.remarks.substring(0, 20) + '...' : item.remarks) : '-'}</span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                          <InfoOutlined sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {stockItems.length === 0 ? 'Belum ada data stok barang.' : 'Tidak ada item stok yang sesuai dengan kriteria pencarian.'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        )}
      </Card>

      <Stack
        direction="row"
        justifyContent="space-between" 
        alignItems="center"
        spacing={1}
        mt={2}
        flexWrap="wrap"
      >
        <Typography variant="body2" color="text.secondary">
          {reportTab === 0 
            ? `Menampilkan ${paginatedReports.length} dari ${finalReports.length} total transaksi`
            : `Menampilkan ${paginatedStockItems.length} dari ${filteredStockItems.length} total item stok`
          }
          {activeFilters.length > 0 && ' (dengan filter)'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" mr={1}>
            Halaman {page + 1} dari {Math.max(1, Math.ceil(
              reportTab === 0 
                ? finalReports.length / rowsPerPage
                : filteredStockItems.length / rowsPerPage
            ))}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
          >
            <ArrowBack fontSize="small" />
          </IconButton>
          <Typography variant="body2">{page + 1}</Typography>
          <IconButton
            size="small"
            onClick={() => handlePageChange(page + 1)}
            disabled={
              page >= Math.ceil(
                reportTab === 0 
                  ? finalReports.length / rowsPerPage 
                  : filteredStockItems.length / rowsPerPage
              ) - 1
            }
          >
            <ArrowForward fontSize="small" />
          </IconButton>
        </Box>
      </Stack>

      {/* Form Dialog untuk Tambah/Edit Laporan */}
      {user && user.role === 'admin' && reportTab === 0 && (
        <ReportForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={handleFormSubmit}
          loading={formLoading}
          error={formError}
          isEdit={isEdit}
          editData={editData}
          user={user}
        />
      )}

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus {reportTab === 0 ? 'laporan' : 'item stok'} ini?
            {itemToDelete && (
              <>
                <br /><br />
                <strong>ID:</strong> {itemToDelete.id}<br />
                {reportTab === 0 ? (
                  <>
                    <strong>Jenis:</strong> {itemToDelete.jenis}<br />
                    <strong>Tanggal:</strong> {new Date(itemToDelete.tanggal).toLocaleDateString('id-ID')}<br />
                    <strong>Item:</strong> {itemToDelete.itemName || '-'}<br />
                    <strong>Kuantitas:</strong> {itemToDelete.quantity}
                  </>
                ) : (
                  <>
                    <strong>Nama Item:</strong> {itemToDelete.name}<br />
                    <strong>Part Number:</strong> {itemToDelete.part_number || '-'}<br />
                    <strong>Kategori:</strong> {itemToDelete.category || '-'}<br />
                    <strong>Stok:</strong> {itemToDelete.quantity}
                  </>
                )}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Batal
          </Button>
          <Button 
            onClick={handleDeleteReport} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Notifikasi Sukses */}
      <Dialog
        open={openSuccessNotif}
        onClose={() => setOpenSuccessNotif(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
          Berhasil!
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {notifMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenSuccessNotif(false)} 
            color="primary"
            variant="contained"
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog Notifikasi Error */}
      <Dialog
        open={openErrorNotif}
        onClose={() => setOpenErrorNotif(false)}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="error-dialog-title" sx={{ pb: 1, color: 'error.main' }}>
          Terjadi Kesalahan
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-description">
            {errorMessage}
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                Silakan coba lagi atau hubungi administrator jika masalah berlanjut.
              </Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenErrorNotif(false)} 
            color="primary"
            variant="contained"
            autoFocus
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog Opsi Ekspor */}
      <Dialog
        open={showExportOptions}
        onClose={() => setShowExportOptions(false)}
        aria-labelledby="export-options-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="export-options-dialog-title">
          Opsi Ekspor Laporan
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Silakan pilih rentang tanggal untuk data yang akan diekspor:
          </Typography>
          
          <Box sx={{ my: 2 }}>
            <Typography variant="body2" gutterBottom>
              Dari tanggal:
            </Typography>
            <input
              type="date"
              name="startDate"
              value={exportDateRange.startDate}
              onChange={handleExportDateChange}
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginBottom: '16px',
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
            />
            
            <Typography variant="body2" gutterBottom>
              Sampai tanggal:
            </Typography>
            <input
              type="date"
              name="endDate"
              value={exportDateRange.endDate}
              onChange={handleExportDateChange}
              style={{ 
                width: '100%', 
                padding: '8px',
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Biarkan kosong untuk mengekspor semua data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportOptions(false)} color="inherit">
            Batal
          </Button>
          <Button 
            onClick={() => handleProcessExport('pdf')} 
            color="primary"
            variant="contained"
            startIcon={<PictureAsPdf />}
          >
            PDF
          </Button>
          <Button 
            onClick={() => handleProcessExport('excel')} 
            color="success"
            variant="contained"
            startIcon={<GridOn />}
          >
            Excel
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog Email Laporan */}
      <Dialog
        open={showEmailDialog}
        onClose={() => !emailLoading && setShowEmailDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Kirim Laporan via Email
        </DialogTitle>
        <DialogContent>
          {emailError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {emailError}
            </Alert>
          )}
          
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="dense"
              label="Alamat Email Penerima"
              type="email"
              name="recipient"
              value={emailFormData.recipient}
              onChange={handleEmailChange}
              fullWidth
              required
              helperText="Pisahkan dengan koma untuk beberapa penerima"
            />
            
            <TextField
              margin="dense"
              label="Subjek"
              type="text"
              name="subject"
              value={emailFormData.subject}
              onChange={handleEmailChange}
              fullWidth
            />
            
            <TextField
              margin="dense"
              label="Pesan"
              multiline
              rows={4}
              name="message"
              value={emailFormData.message}
              onChange={handleEmailChange}
              fullWidth
              placeholder="Tambahkan pesan bersama laporan (opsional)"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Format Laporan</InputLabel>
              <Select
                value={reportMode}
                onChange={handleReportModeChange}
                label="Format Laporan"
              >
                <MenuItem value="detail">Laporan Detail</MenuItem>
                <MenuItem value="summary">Laporan Ringkasan</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowEmailDialog(false)} 
            color="inherit"
            disabled={emailLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleSendEmail}
            color="primary"
            variant="contained"
            disabled={!emailFormData.recipient || emailLoading}
            startIcon={emailLoading ? <CircularProgress size={20} color="inherit" /> : <Email />}
          >
            Kirim
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Report;

