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
  useTheme
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

// Import filter, sort, search components
import SearchInput from '../components/SearchInput'; // Adjust path
import StockFiltersAndSortControls from '../components/StockFiltersAndSortControls'; // Adjust path
// Import delete confirmation and form modals
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'; // Adjust path
import StockForm from '../components/StockForm'; // Import form component - Adjust path
// Import the new Incoming/Outgoing forms
import IncomingGoodsForm from '../components/IncomingGoodsForm'; // Adjust path
import OutgoingGoodsForm from '../components/OutgoingGoodsForm'; // Adjust path


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


const StockManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate(); // Hook for navigation

  // Main data and loading states
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For main data fetching error

  // Filter, sort, search states
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [sortOrder, setSortOrder] = useState('');
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
  // --- End New States ---


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
        sortOrder: sortOrder,
        searchQuery: searchQuery
    });

    const token = getAuthToken();
    if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        // Consider redirecting to login page here
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
    if (API_URL) {
        fetchItems();
    } else {
        setLoading(false);
    }
  }, [filterCategory, filterSupplier, sortOrder, searchQuery]);


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
              const errorData = await response.json().catch(() => ({}));
              console.error("Delete API error response:", errorData);
              throw new Error(errorData.message || errorData.error || response.statusText);
          }

          fetchItems(); // Refresh data

          setOpenConfirm(false);
          setSelectedItemId(null);

      } catch (error) {
          console.error("Deleting item failed:", error);
          setDeleteError(`Gagal menghapus: ${error.message}`);
      } finally {
          setDeleteLoading(false);
      }
  };

  // --- Handler for Form Modal (Add/Edit) and Save Action ---
  const handleAddItem = () => {
       setItemToEdit(null);
       setSaveError(null);
       setOpenForm(true);
    };

  const handleEdit = (id) => {
    const item = items.find(item => item.id === id);
    if (item) {
        setItemToEdit(item);
        setSaveError(null);
        setOpenForm(true);
    } else {
        console.error("Item with ID not found for editing:", id);
        // setError(`Error: Item with ID ${id} not found.`); // Optional: show error on main page
    }
  };

  const handleCancelForm = () => {
      setOpenForm(false);
      setItemToEdit(null);
      setSaveError(null);
  };

  const handleSaveItem = async (formData) => {
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
          return;
      }

      // Prepare dataToSend - formData already includes 'id' if editing
      const dataToSend = { ...formData };

      // Map 'stock' to 'quantity' and ensure numbers are numbers
      if (dataToSend.hasOwnProperty('stock')) {
          dataToSend.quantity = Number(dataToSend.stock);
          delete dataToSend.stock;
      }
      if (dataToSend.hasOwnProperty('price')) {
          dataToSend.price = Number(dataToSend.price);
      }
      // Ensure part_number is sent as a number if backend expects it
      if (dataToSend.hasOwnProperty('part_number')) {
          dataToSend.part_number = Number(dataToSend.part_number);
      }


      const method = dataToSend.id ? 'PUT' : 'POST';
      const url = dataToSend.id ? `${API_URL}/api/stock/${dataToSend.id}` : `${API_URL}/api/stock`;

      // For POST requests (add mode), remove the ID from the request body if it exists
      // This is crucial if your backend auto-generates/validates the custom ID from the body
      if (method === 'POST' && dataToSend.hasOwnProperty('id')) {
          // If backend expects custom ID in body for POST, DO NOT delete it here.
          // If backend expects ID only in URL for PUT and ignores body ID, delete it for PUT too.
          // Assuming backend expects custom ID in body for POST: do nothing here.
      }


      console.log('Saving data:', dataToSend);
      console.log('Method:', method, 'URL:', url);

      try {
          const response = await fetch(url, {
              method: method,
              headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json'
              },
              body: JSON.stringify(dataToSend)
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error("Save API error response:", errorData);
              throw new Error(errorData.message || errorData.error || response.statusText);
          }

          fetchItems(); // Refresh data

          handleCancelForm(); // Close modal and reset state

      } catch (error) {
          console.error("Saving item failed:", error);
          setSaveError(`Gagal menyimpan data: ${error.message}`);
      } finally {
          setSaveLoading(false);
      }
  };

  // --- Handlers to open Incoming/Outgoing Modals ---
  const handleOpenIncomingForm = () => {
      setTransactionError(null); // Reset transaction error
      setOpenIncomingForm(true);
  };

  const handleOpenOutgoingForm = () => {
      setTransactionError(null); // Reset transaction error
      setOpenOutgoingForm(true);
  };

  // --- Handlers to process Incoming/Outgoing Transactions ---
  // These will be passed to the onSubmit prop of the new forms
  const handleProcessIncoming = async (transactionData) => {
    if (!API_URL) {
        setTransactionError("Application configuration error: API URL is not set.");
        return;
    }

    setTransactionLoading(true);
    setTransactionError(null);

    const token = getAuthToken();
    if (!token) {
        setTransactionError("Authentication token missing. Cannot record transaction.");
        setTransactionLoading(false);
        return;
    }

    try {
        // API call to record incoming goods
        const response = await fetch(`${API_URL}/api/stock/incoming`, { // Assuming this endpoint exists
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData) // transactionData includes itemId, quantity, date, remarks
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Incoming API error response:", errorData);
            throw new Error(errorData.message || errorData.error || response.statusText);
        }

        // If successful:
        fetchItems(); // Refresh the stock list to show updated quantity
        setOpenIncomingForm(false); // Close the modal
        navigate('/history'); // Navigate to the History page

    } catch (error) {
        console.error("Recording incoming goods failed:", error);
        setTransactionError(`Failed to record incoming goods: ${error.message}`);
    } finally {
        setTransactionLoading(false);
    }
  };

  const handleProcessOutgoing = async (transactionData) => {
    if (!API_URL) {
        setTransactionError("Application configuration error: API URL is not set.");
        return;
    }

    setTransactionLoading(true);
    setTransactionError(null);

    const token = getAuthToken();
    if (!token) {
        setTransactionError("Authentication token missing. Cannot record transaction.");
        setTransactionLoading(false);
        return;
    }

    try {
        // API call to record outgoing goods
        const response = await fetch(`${API_URL}/api/stock/outgoing`, { // Assuming this endpoint exists
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData) // transactionData includes itemId, quantity, date, remarks
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Outgoing API error response:", errorData);
            // Check for specific errors like insufficient stock (if backend sends a specific status/message)
            if (response.status === 400 && errorData.error === 'Insufficient stock') {
                throw new Error("Insufficient stock for this outgoing transaction.");
            }
            throw new Error(errorData.message || errorData.error || response.statusText);
        }

        // If successful:
        fetchItems(); // Refresh the stock list to show updated quantity
        setOpenOutgoingForm(false); // Close the modal
        navigate('/history'); // Navigate to the History page

    } catch (error) {
        console.error("Recording outgoing goods failed:", error);
        setTransactionError(`Failed to record outgoing goods: ${error.message}`);
    } finally {
        setTransactionLoading(false);
    }
  };


  // Handlers for filter, sort, search - only update state, useEffect triggers fetch
  const handleSearchChange = (event) => { setSearchQuery(event.target.value); };
  const handleFilterCategoryChange = (event) => { setFilterCategory(event.target.value); };
  const handleFilterSupplierChange = (event) => { setFilterSupplier(event.target.value); };
  const handleSortOrderChange = (event) => { setSortOrder(event.target.value); };


  // --- Component Display ---

  // Display main loading state
  if (loading) {
      return (
          <Box sx={{ p: theme.spacing(4), textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: theme.spacing(2) }}>Loading Stock Data...</Typography>
          </Box>
      );
  }

  // Display main error state (e.g., fetch failure)
  if (error) {
      return (
          <Box sx={{ p: theme.spacing(4), textAlign: 'center' }}>
              <Typography color="error" variant="h6">Error: {error}</Typography>
          </Box>
      );
  }


  return (
    /* Main container Box - Use theme spacing for padding */
    <Box sx={{ p: theme.spacing(4) }}>

      {/* Page Title */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: theme.spacing(3) }}>
          Stock Management
      </Typography>

      {/* Top Buttons (Add, Incoming, Outgoing) */}
      <Stack direction="row" spacing={theme.spacing(2)} mb={theme.spacing(3)} flexWrap="wrap">
        {/* "Add Item" Button */}
        <Button
          variant="contained"
          size="medium"
          color="primary"
          onClick={handleAddItem} // Opens the StockForm modal in add mode
        >
          Add Item
        </Button>
        {/* "Incoming Goods" Button - Opens the new IncomingGoodsForm */}
        <Button
          variant="outlined"
          size="medium"
          color="primary"
          onClick={handleOpenIncomingForm} // Opens the Incoming form
          disabled={transactionLoading} // Disable buttons while a transaction is processing
        >
          Incoming Goods
        </Button>
        {/* "Outgoing Goods" Button - Opens the new OutgoingGoodsForm */}
        <Button
          variant="outlined"
          size="medium"
          color="secondary"
          onClick={handleOpenOutgoingForm} // Opens the Outgoing form
          disabled={transactionLoading} // Disable buttons while a transaction is processing
        >
          Outgoing Goods
        </Button>
        {/* Display transaction loading/error status */}
        {transactionLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: theme.spacing(2) }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Processing transaction...</Typography>
            </Box>
        )}
        {transactionError && (
            <Typography color="error" variant="body2" sx={{ ml: theme.spacing(2) }}>
              {transactionError}
            </Typography>
        )}
      </Stack>


      {/* Filters, Sort, and Search */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={theme.spacing(2)} justifyContent="space-between" alignItems="center" mb={theme.spacing(3)} flexWrap="wrap">
        <Box>
          <StockFiltersAndSortControls
            filterCategory={filterCategory}
            onFilterCategoryChange={handleFilterCategoryChange}
            filterSupplier={filterSupplier}
            onFilterSupplierChange={handleFilterSupplierChange}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
          />
        </Box>
        <Box sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Search by ID or Name..."
          />
        </Box>
      </Stack>

      {/* Items Table */}
      <Card elevation={3} sx={{ borderRadius: theme.shape.borderRadius }}>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Part Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>UoM</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.part_number ?? 'N/A'}</TableCell>
                    <TableCell>{item.category ?? 'N/A'}</TableCell>
                    <TableCell>
                        {item.price !== undefined && item.price !== null
                            ? `Rp ${Number(item.price).toLocaleString('id-ID')}`
                            : 'N/A'}
                    </TableCell>
                    <TableCell>{item.stock ?? 'N/A'}</TableCell>
                    <TableCell>{item.supplier ?? 'N/A'}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          px: theme.spacing(2), py: theme.spacing(0.5),
                          borderRadius: 999,
                          display: 'inline-block',
                          bgcolor: item.status === 'Available' ? theme.palette.success.light : theme.palette.error.light,
                          color: item.status === 'Available' ? theme.palette.success.dark : theme.palette.error.dark,
                          fontSize: '0.8rem',
                          fontWeight: 'medium'
                        }}
                      >
                        {item.status ?? 'N/A'}
                      </Typography>
                    </TableCell>
                     <TableCell>{item.uom ?? 'N/A'}</TableCell>
                     <TableCell>{item.remarks ?? 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={theme.spacing(0.5)} justifyContent="center">
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
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                   <TableCell colSpan={11} align="center" sx={{ py: theme.spacing(3) }}>
                     No items found matching the criteria.
                   </TableCell>
                 </TableRow>
               )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Render components that appear as overlays (Modals) */}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemId={selectedItemId}
        loading={deleteLoading}
        error={deleteError}
      />

      {/* Stock Form (for Add/Edit) */}
      <StockForm
          open={openForm}
          onClose={handleCancelForm}
          onSubmit={handleSaveItem}
          initialData={itemToEdit}
          loading={saveLoading}
          error={saveError}
      />

      {/* --- New: Incoming Goods Form --- */}
      <IncomingGoodsForm
          open={openIncomingForm}
          onClose={() => setOpenIncomingForm(false)} // Simple close handler
          onSubmit={handleProcessIncoming} // Handler to process the incoming transaction
          loading={transactionLoading} // Use transaction loading state
          error={transactionError} // Use transaction error state
      />
      {/* --- End New --- */}

      {/* --- New: Outgoing Goods Form --- */}
      <OutgoingGoodsForm
          open={openOutgoingForm}
          onClose={() => setOpenOutgoingForm(false)} // Simple close handler
          onSubmit={handleProcessOutgoing} // Handler to process the outgoing transaction
          loading={transactionLoading} // Use transaction loading state
          error={transactionError} // Use transaction error state
      />
      {/* --- End New --- */}

    </Box>
  );
};

export default StockManagement;