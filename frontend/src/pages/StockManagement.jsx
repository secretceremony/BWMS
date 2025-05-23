// src/pages/StockManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery, // Import useMediaQuery for conditional rendering/styles
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Menu,
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, FilterList, ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

// Import filter, sort, search components
import SearchInput from '../components/SearchInput'; // Adjust path
import StockFiltersAndSortControls from '../components/StockFiltersAndSortControls'; // Adjust path
// Import delete confirmation and form modals
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'; // Adjust path
import StockForm from '../components/StockForm'; // Import form component - Adjust path
// Import the new Incoming/Outgoing forms (already components!)
import IncomingGoodsForm from '../components/IncomingGoodsForm'; // Adjust path
import OutgoingGoodsForm from '../components/OutgoingGoodsForm'; // Adjust path
// Import supplier management component
import SupplierManagement from '../components/SupplierManagement'; // Import supplier management component


// Get Backend URL from environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL; // Rely on App.js for config error check


// Helper to build query string
const buildQueryString = (filters) => {
    const params = new URLSearchParams();
    if (filters.filterCategory ?? '') params.append('category', filters.filterCategory);
    if (filters.filterSupplier ?? '') params.append('supplier', filters.filterSupplier);
    if (filters.sortOrder ?? '') params.append('sort', filters.sortOrder);
    if (filters.searchQuery ?? '') params.append('q', filters.searchQuery);
    return params.toString();
};

// Helper to get authentication token (should be consistent across your app)
const getAuthToken = () => {
    return localStorage.getItem('token');
};


const StockManagement = ({ user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Determine if screen is small (mobile)
  const navigate = useNavigate(); // Hook for navigation

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState(0);

  // Main data and loading states
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For main data fetching error

  // Filter, sort, search states
  const [searchQuery, setSearchQuery] = useState('');

  // State for delete confirmation modal
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // State for Add/Edit form modal
  const [openForm, setOpenForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null); // null = add mode, object = edit mode
  const [saveLoading, setSaveLoading] = useState(false); // Loading state for save action
  const [saveError, setSaveError] = useState(null); // Error message for save action

  // --- New States for Incoming/Outgoing Modals ---
  const [openIncomingForm, setOpenIncomingForm] = useState(false);
  const [openOutgoingForm, setOpenOutgoingForm] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false); // Loading for incoming/outgoing transactions
  const [transactionError, setTransactionError] = useState(null); // Error for incoming/outgoing transactions

  // Tambahkan state untuk filter popover
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const openFilterMenu = Boolean(filterAnchorEl);
  const handleFilterClick = (event) => { setFilterAnchorEl(event.currentTarget); };
  const handleFilterClose = () => { setFilterAnchorEl(null); };
  const handleFilterApply = () => { setFilterAnchorEl(null); };

  // Tambahkan state untuk snackbar error di StockManagement
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

  // Handler untuk perubahan tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // --- Logic to Fetch Data from Backend ---
  const fetchItems = async () => {
    if (!API_URL) {
        setError("Application configuration error: API URL is not set.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null); // Reset main error

    const queryString = buildQueryString({
        filterCategory: filterCategory,
        filterSupplier: filterSupplier,
        sortOrder: '',
        searchQuery: searchQuery
    });

    const token = getAuthToken();
    if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        // Consider redirecting to login page here, or show a login prompt
        navigate('/login'); // Example redirect
        return;
    }

    try {
      const response = await fetch(`${API_URL}/api/stock?${queryString}`, {
           headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
           }
      });

      if (!response.ok) {
           const errorBody = await response.json().catch(() => ({}));
           console.error('Fetch error details:', errorBody);

           if (response.status === 401 || response.status === 403) {
               setError("Authentication error: Please login again.");
               // Optional: Clear token and redirect
               localStorage.removeItem('token');
               navigate('/login');
           } else {
               setError(`Failed to fetch items: ${errorBody.error || errorBody.message || response.statusText}`);
           }
           throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setItems(data);

    } catch (error) {
      console.error("Fetching items failed:", error);
       if (!error.message.includes('HTTP error')) {
           setError("Failed to load items. Network error or server issue.");
       }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (API_URL && activeTab === 0) {
        fetchItems();
    } else {
        // Handle case where API_URL is not set on mount
        setError("Application configuration error: API URL is not set.");
        setLoading(false);
    }
  }, [filterCategory, filterSupplier, searchQuery, API_URL, activeTab]); // Added API_URL and activeTab dependency for safety


  // --- Handler for Delete Confirmation Modal and Delete Action ---
  const handleDeleteClick = (id) => {
      setSelectedItemId(id);
      setDeleteError(null);
      setOpenConfirm(true);
  };

  const handleCancelDelete = () => {
      setOpenConfirm(false);
      setSelectedItemId(null);
      setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!API_URL) {
        setDeleteError("Application configuration error: API URL is not set.");
        return;
    }

      setDeleteLoading(true);
      setDeleteError(null);

      const token = getAuthToken();
      if (!token) {
          setDeleteError("Authentication token missing. Cannot delete.");
          setDeleteLoading(false);
          navigate('/login'); // Redirect to login
          return;
      }

      try {
          const response = await fetch(`${API_URL}/api/stock/${selectedItemId}`, {
              method: 'DELETE',
              headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json'
              }
          });

          if (!response.ok) {
              const errorBody = await response.json().catch(() => ({}));
              console.error('Delete error details:', errorBody);

              if (response.status === 401 || response.status === 403) {
                  setDeleteError("Authentication error: Please login again.");
                  localStorage.removeItem('token');
                  navigate('/login');
              } else {
                  setDeleteError(`Failed to delete item: ${errorBody.error || errorBody.message || response.statusText}`);
              }
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          // On successful delete, close modal and refresh data
          setOpenConfirm(false);
          fetchItems(); // Refresh the list

      } catch (error) {
          console.error("Delete item failed:", error);
          if (!error.message.includes('HTTP error')) {
              setDeleteError("Failed to delete item. Network error or server issue.");
          }
      } finally {
          setDeleteLoading(false);
      }
  };

  // --- Handler for Add/Edit Form Modal ---
  const handleAddItem = () => {
      setItemToEdit(null); // null means "add mode"
      setSaveError(null);
      setOpenForm(true);
  };

  const handleEdit = (id) => {
      // Find the item by id
      const item = items.find(item => item.id === id);
      if (item) {
          setItemToEdit(item);
          setSaveError(null);
          setOpenForm(true);
      } else {
          console.error(`Item with ID ${id} not found`);
          // Optionally show an error message
      }
  };

  const handleCancelForm = () => {
      setOpenForm(false);
      setItemToEdit(null);
      setSaveError(null);
  };

  // --- Handler for Save Item (Create/Update) ---
  const handleSaveItem = async (formData) => { // 'formData' here is the data object ready for the backend
    if (!API_URL) {
        setSaveError("Application configuration error: API URL is not set.");
        return;
    }

    setSaveLoading(true);
    setSaveError(null);

    const token = getAuthToken();
    if (!token) {
        setSaveError("Authentication token missing. Cannot save.");
        setSaveLoading(false);
        navigate('/login'); // Redirect to login
        return;
    }

    // Determine if we're adding or editing based on presence of id
    const isEditing = !!formData.id;
    const url = isEditing ? `${API_URL}/api/stock/${formData.id}` : `${API_URL}/api/stock`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error('Save error details:', errorBody);

            if (response.status === 401 || response.status === 403) {
                setSaveError("Authentication error: Please login again.");
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setSaveError(`Failed to save item: ${errorBody.error || errorBody.message || response.statusText}`);
            }
            setOpenErrorSnackbar(true);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // On successful save, close modal and refresh data
        setOpenForm(false);
        fetchItems(); // Refresh the list

    } catch (error) {
        console.error("Save item failed:", error);
        if (!error.message.includes('HTTP error')) {
            setSaveError("Failed to save item. Network error or server issue.");
            setOpenErrorSnackbar(true);
        }
    } finally {
        setSaveLoading(false);
    }
  };

  // --- Handler for Incoming Goods Form ---
  const handleOpenIncomingForm = () => {
      setTransactionError(null);
      setOpenIncomingForm(true);
  };

  // --- Handler for Outgoing Goods Form ---
  const handleOpenOutgoingForm = () => {
      setTransactionError(null);
      setOpenOutgoingForm(true);
  };

  // --- Handler for Processing Incoming Goods Transaction ---
  const handleProcessIncoming = async (transactionData) => {
    if (!API_URL) {
        setTransactionError("Application configuration error: API URL is not set.");
        return;
    }

    setTransactionLoading(true);
    setTransactionError(null);

    const token = getAuthToken();
    if (!token) {
        setTransactionError("Authentication token missing. Cannot process transaction.");
        setTransactionLoading(false);
        navigate('/login'); // Redirect to login
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/stock/incoming`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error('Transaction error details:', errorBody);

            if (response.status === 401 || response.status === 403) {
                setTransactionError("Authentication error: Please login again.");
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setTransactionError(`Failed to process transaction: ${errorBody.error || errorBody.message || response.statusText}`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // On successful transaction, close modal and refresh data
        setOpenIncomingForm(false);
        fetchItems(); // Refresh the list

    } catch (error) {
        console.error("Process transaction failed:", error);
        if (!error.message.includes('HTTP error')) {
            setTransactionError("Failed to process transaction. Network error or server issue.");
        }
    } finally {
        setTransactionLoading(false);
    }
  };

  // --- Handler for Processing Outgoing Goods Transaction ---
  const handleProcessOutgoing = async (transactionData) => {
    if (!API_URL) {
        setTransactionError("Application configuration error: API URL is not set.");
        return;
    }

    setTransactionLoading(true);
    setTransactionError(null);

    const token = getAuthToken();
    if (!token) {
        setTransactionError("Authentication token missing. Cannot process transaction.");
        setTransactionLoading(false);
        navigate('/login'); // Redirect to login
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/stock/outgoing`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error('Transaction error details:', errorBody);

            if (response.status === 401 || response.status === 403) {
                setTransactionError("Authentication error: Please login again.");
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setTransactionError(`Failed to process transaction: ${errorBody.error || errorBody.message || response.statusText}`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // On successful transaction, close modal and refresh data
        setOpenOutgoingForm(false);
        fetchItems(); // Refresh the list

    } catch (error) {
        console.error("Process transaction failed:", error);
        if (!error.message.includes('HTTP error')) {
            setTransactionError("Failed to process transaction. Network error or server issue.");
        }
    } finally {
        setTransactionLoading(false);
    }
  };

  // --- Handler for Search Input ---
  const handleSearchChange = (event) => { setSearchQuery(event.target.value); };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Stock Management
      </Typography>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="stock management tabs">
          <Tab label="Inventory" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 ? (
        // Tab Inventory
        <Box>
          {/* Action Bar: Filter, Search, Add */}
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" mb={3}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {user && user.role === 'admin' && (
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleAddItem}
                  startIcon={<EditIcon />}
                  sx={{ minWidth: 100, height: 36 }}
                >
                  Tambah Item
                </Button>
              )}
              {user && user.role === 'admin' && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleOpenIncomingForm}
                  startIcon={<ArrowDownward />}
                  color="primary"
                  sx={{ minWidth: 100, height: 36 }}
                >
                  Barang Masuk
                </Button>
              )}
              {user && user.role === 'admin' && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleOpenOutgoingForm}
                  startIcon={<ArrowUpward />}
                  color="primary"
                  sx={{ minWidth: 100, height: 36 }}
                >
                  Barang Keluar
                </Button>
              )}
              <Tooltip title="Filter Inventory">
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleFilterClick}
                  startIcon={<FilterList />} 
                  color="primary"
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
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Kategori"
                    onChange={e => setFilterCategory(e.target.value)}
                  >
                    <MenuItem value="">Semua</MenuItem>
                    {[...new Set(items.map(i => i.category).filter(Boolean))].map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={filterSupplier}
                    label="Supplier"
                    onChange={e => setFilterSupplier(e.target.value)}
                  >
                    <MenuItem value="">Semua</MenuItem>
                    {[...new Set(items.map(i => i.supplier).filter(Boolean))].map(sup => (
                      <MenuItem key={sup} value={sup}>{sup}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button size="small" onClick={() => { setFilterCategory(''); setFilterSupplier(''); handleFilterClose(); }}>Reset</Button>
                  <Button size="small" variant="contained" onClick={handleFilterClose}>Terapkan</Button>
                </Box>
              </Menu>
            </Box>
            <Box sx={{ minWidth: 200 }}>
              <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder="Cari item..." fullWidth />
            </Box>
          </Stack>

          {/* Main Content - Items Table */}
          <Card sx={{ mt: 3 }}>
            <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%', maxWidth: '100vw' }}>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 60 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Nama Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Part Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>Kuantitas</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 60 }}>UOM</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Harga Satuan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Nilai Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Keterangan</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 80 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={40} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Loading items...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                        <Typography color="error">{error}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2">
                          No items found. Try adjusting your filters or add a new item.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => {
                      const totalValue = (item.price && item.stock) ? item.price * item.stock : 0;
                      return (
                        <TableRow
                          key={item.id}
                          hover
                          sx={{
                            backgroundColor: item.stock <= 10
                              ? theme.palette.error.light + '20'
                              : item.stock <= 50
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
                              label={item.stock}
                              size="small"
                              color={
                                item.stock <= 10 ? 'error' :
                                item.stock <= 50 ? 'warning' :
                                'success'
                              }
                            />
                          </TableCell>
                          <TableCell>{item.supplier || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.stock < 50 ? 'Low Stock' : 'Available'}
                              color={item.stock < 50 ? 'error' : 'success'}
                              size="small"
                              sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}
                            />
                          </TableCell>
                          <TableCell>{item.uom || '-'}</TableCell>
                          <TableCell>
                            {item.price
                              ? new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  maximumFractionDigits: 0
                                }).format(item.price)
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {totalValue
                              ? new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  maximumFractionDigits: 0
                                }).format(totalValue)
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Tooltip title={item.remarks || 'Tidak ada keterangan'}>
                              <span>{item.remarks ? (item.remarks.length > 20 ? item.remarks.substring(0, 20) + '...' : item.remarks) : '-'}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {user && user.role === 'admin' && (
                              <>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleEdit(item.id)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(item.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Modals */}
          <DeleteConfirmationDialog
            open={openConfirm}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            title="Delete Item"
            content="Are you sure you want to delete this item? This action cannot be undone."
            loading={deleteLoading}
            error={deleteError}
          />

          {user && user.role === 'admin' && (
            <StockForm
              open={openForm}
              onClose={handleCancelForm}
              onSubmit={handleSaveItem}
              initialData={itemToEdit}
              loading={saveLoading}
              error={saveError}
            />
          )}

          {user && user.role === 'admin' && (
            <IncomingGoodsForm
              open={openIncomingForm}
              onClose={() => setOpenIncomingForm(false)}
              onSubmit={handleProcessIncoming}
              items={items}
              loading={transactionLoading}
              error={transactionError}
            />
          )}

          {user && user.role === 'admin' && (
            <OutgoingGoodsForm
              open={openOutgoingForm}
              onClose={() => setOpenOutgoingForm(false)}
              onSubmit={handleProcessOutgoing}
              items={items}
              loading={transactionLoading}
              error={transactionError}
            />
          )}

          {saveError && (
            <Snackbar
              open={openErrorSnackbar}
              autoHideDuration={4000}
              onClose={() => setOpenErrorSnackbar(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert onClose={() => setOpenErrorSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                {saveError}
              </Alert>
            </Snackbar>
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default StockManagement;