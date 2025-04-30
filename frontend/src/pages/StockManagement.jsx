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
  CircularProgress, // Import CircularProgress for loading state
  useTheme // Import useTheme
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Import filter, sort, search components
import SearchInput from '../components/SearchInput'; // Adjust path
import StockFiltersAndSortControls from '../components/StockFiltersAndSortControls'; // Adjust path
// Import delete confirmation and form modals
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'; // Adjust path
import StockForm from '../components/StockForm'; // Import form component - Adjust path

// Get Backend URL from environment variable
// Ensure the variable name matches your build tool (e.g., VITE_API_BASE_URL for Vite)
const API_URL = import.meta.env.VITE_API_BASE_URL; // Rely on App.js for config error check


// Helper to build query string (Using URLSearchParams is good)
const buildQueryString = (filters) => {
    const params = new URLSearchParams();
    // Use nullish coalescing for safety if filter values are null/undefined
    if (filters.filterCategory ?? '') params.append('category', filters.filterCategory);
    // Assuming the prop name in StockFiltersAndSortControls is 'filterSupplier'
    if (filters.filterSupplier ?? '') params.append('supplier', filters.filterSupplier);
    if (filters.sortOrder ?? '') params.append('sort', filters.sortOrder);
    if (filters.searchQuery ?? '') params.append('q', filters.searchQuery);
    // Add other filters if any
    return params.toString();
};

// Helper to get authentication token - Better to pass from context or props
const getAuthToken = () => {
    // Replace with your actual token storage/retrieval method (localStorage is shown as example)
    return localStorage.getItem('token');
};


const StockManagement = () => {
  const theme = useTheme(); // Use the theme hook

  // Main data and loading states
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For main data fetching error

  // Filter, sort, search states
  // Initialize states to match initial state passed to buildQueryString
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // State for delete confirmation modal
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false); // Loading state for delete action
  const [deleteError, setDeleteError] = useState(null); // For delete error message

  // State for Add/Edit form modal
  const [openForm, setOpenForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null); // null = add mode, object = edit mode
  const [saveLoading, setSaveLoading] = useState(false); // Loading state for save action
  const [saveError, setSaveError] = useState(null); // Error message for save action


  // --- Logic to Fetch Data from Backend ---
  const fetchItems = async () => {
    // Prevent fetching if API_URL is not configured (should be handled by App.js)
    if (!API_URL) {
        setError("Application configuration error: API URL is not set.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null); // Reset main error

    // Ensure state names passed to buildQueryString are correct
    const queryString = buildQueryString({
        filterCategory: filterCategory,
        filterSupplier: filterSupplier,
        sortOrder: sortOrder,
        searchQuery: searchQuery
    });

    const token = getAuthToken(); // Use the helper
    if (!token) {
        // This should ideally be handled by ProtectedRoute and App.js, but a safeguard is good
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        // Consider redirecting to login page here if this state is reached unexpectedly
        return;
    }

    try {
      const response = await fetch(`${API_URL}/api/stock?${queryString}`, {
           headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json' // Standard header for JSON APIs
           }
      });

      if (!response.ok) {
           // Attempt to parse error response body
           const errorBody = await response.json().catch(() => ({})); // Catch JSON parsing errors
           console.error('Fetch error details:', errorBody); // Log full error body

           if (response.status === 401 || response.status === 403) {
               setError("Authentication error: Please login again.");
               // Optional: Clear token and redirect if auth fails during fetch
               // localStorage.removeItem('token');
               // window.location.href = '/login'; // Or use Navigate
           } else {
               setError(`Failed to fetch items: ${errorBody.error || errorBody.message || response.statusText}`);
           }
           // Throw error to stop execution in this try block and be caught below
           throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Assuming data structure from backend matches table columns (id, name, part_number, etc.)
      setItems(data);

    } catch (error) {
      console.error("Fetching items failed:", error);
       // Set a generic error if a specific HTTP error wasn't set above
       if (!error.message.includes('HTTP error')) {
           setError("Failed to load items. Network error or server issue.");
       }
    } finally {
      setLoading(false);
    }
  };

  // Effect runs on mount and when filter/sort/search states change
  useEffect(() => {
    // Only fetch if API_URL is available (prevents fetch calls if config error exists)
    if (API_URL) {
        fetchItems();
    } else {
         // If API_URL is null here, it means configError is set in App.js
         // The main error state will be handled by App.js rendering logic.
         // We just ensure loading is false in this component.
         setLoading(false);
    }
  }, [filterCategory, filterSupplier, sortOrder, searchQuery]);


  // --- Handler for Delete Confirmation Modal and Delete Action ---
  const handleDeleteClick = (id) => {
      setSelectedItemId(id);
      setDeleteError(null); // Reset delete error before opening modal
      setOpenConfirm(true);
  };

  const handleCancelDelete = () => {
      setOpenConfirm(false);
      setSelectedItemId(null); // Clear selected ID
      setDeleteError(null); // Ensure error is also reset when cancelled
  };

  const handleConfirmDelete = async () => {
    // Prevent delete if API_URL is not configured
    if (!API_URL) {
        setDeleteError("Application configuration error: API URL is not set.");
        return;
    }

      setDeleteLoading(true); // Set loading during delete process
      setDeleteError(null); // Reset error

      const token = getAuthToken(); // Use the helper
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
                 'Content-Type': 'application/json' // Required even for DELETE if backend expects it
              }
          });

          if (!response.ok) {
              // Attempt to parse error response body
              const errorData = await response.json().catch(() => ({}));
              console.error("Delete API error response:", errorData);
              throw new Error(errorData.message || errorData.error || response.statusText);
          }

          // If successful, fetch data again to update table
          fetchItems(); // This will set loading state internally

          // Close modal after success
          setOpenConfirm(false);
          setSelectedItemId(null); // Clear selected ID

      } catch (error) {
          console.error("Deleting item failed:", error);
          setDeleteError(`Gagal menghapus: ${error.message}`); // Set error message for the modal
      } finally {
          setDeleteLoading(false); // Finish loading
      }
  };

  // --- Handler for Form Modal (Add/Edit) and Save Action ---

    // Handler to open form for adding
  const handleAddItem = () => {
       setItemToEdit(null); // Set itemToEdit to null for add mode
       setSaveError(null); // Reset save error
       setOpenForm(true); // Open the form modal
    };

    // Handler to open form for editing
  const handleEdit = (id) => {
    console.log('Edit item clicked with ID:', id);
    // Find item in state items based on ID
    const item = items.find(item => item.id === id);

    if (item) {
        setItemToEdit(item); // Set itemToEdit with found item data
        setSaveError(null); // Reset save error
        setOpenForm(true); // Open the form modal
    } else {
        console.error("Item with ID not found for editing:", id);
        // Optional: Show an error message to the user on the main page
        // setError(`Error: Item with ID ${id} not found.`);
    }
  };

    // Handler to close the form modal
  const handleCancelForm = () => {
      setOpenForm(false); // Close the form modal
      setItemToEdit(null); // Reset itemToEdit (important for add mode on next open)
      setSaveError(null); // Reset save error
  };

    // Handler to save item (called by StockForm onSubmit)
  const handleSaveItem = async (formData) => {
    // Prevent save if API_URL is not configured
    if (!API_URL) {
        setSaveError("Application configuration error: API URL is not set.");
        return;
    }

      setSaveLoading(true); // Set loading during save process
      setSaveError(null); // Reset save error

      const token = getAuthToken(); // Use the helper
      if (!token) {
          setSaveError("Authentication token missing. Cannot save.");
          setSaveLoading(false);
          return;
      }

      // --- IMPORTANT: Verify formData structure matches backend expectations ---
      // The StockForm component MUST provide data in a format that the backend expects.
      // Example: if backend expects 'quantity', and your form uses 'stock', do the mapping here.
      // Verify the field names and data types required by your backend API's POST and PUT endpoints.
      const dataToSend = { ...formData };

      // Example mapping: Convert 'stock' from form to 'quantity' for backend (if needed)
      if (dataToSend.hasOwnProperty('stock')) {
          dataToSend.quantity = Number(dataToSend.stock); // Ensure it's a number
          delete dataToSend.stock;
      }
      // Example: Convert 'price' to a number (if needed)
      if (dataToSend.hasOwnProperty('price') && typeof dataToSend.price === 'string') {
          // Basic attempt to parse Rupiah format if your form outputs it like "Rp 1.234.567"
          dataToSend.price = parseFloat(dataToSend.price.replace(/[^0-9,-]+/g, "").replace(",", "."));
          if (isNaN(dataToSend.price)) dataToSend.price = 0; // Default to 0 or handle error
      }
        // Ensure required fields exist and have correct types based on your API


      const method = dataToSend.id ? 'PUT' : 'POST'; // Determine method based on presence of ID
      const url = dataToSend.id ? `${API_URL}/api/stock/${dataToSend.id}` : `${API_URL}/api/stock`; // Determine URL

      // For POST requests (add mode), remove the ID from the request body if it exists
      if (method === 'POST' && dataToSend.hasOwnProperty('id')) {
          delete dataToSend.id;
      }

      console.log('Saving data:', dataToSend); // DEBUG: Data being sent to backend
      console.log('Method:', method, 'URL:', url); // DEBUG: Request being made

      try {
          const response = await fetch(url, {
              method: method,
              headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json' // Required for sending JSON body
              },
              body: JSON.stringify(dataToSend) // Send form data as JSON
          });

          if (!response.ok) {
              // Attempt to parse error response body
              const errorData = await response.json().catch(() => ({}));
               console.error("Save API error response:", errorData); // DEBUG: Backend error response
              throw new Error(errorData.message || errorData.error || response.statusText);
          }

          // If successful, fetch data again to update the table
          fetchItems(); // This will set loading state internally

          // Close modal after success
          handleCancelForm(); // Call cancel handler to close modal and reset state

      } catch (error) {
          console.error("Saving item failed:", error);
          setSaveError(`Gagal menyimpan data: ${error.message}`); // Set error message for the form modal
      } finally {
          setSaveLoading(false); // Finish loading
      }
  };


    // TODO: Implement handlers for Incoming/Outgoing Goods
    const handleIncomingGoods = () => {
        console.log('Incoming Goods clicked');
        // Example: Open a specific modal or navigate to a different page for incoming goods
    };

    const handleOutgoingGoods = () => {
        console.log('Outgoing Goods clicked');
        // Example: Open a specific modal or navigate to a different page for outgoing goods
    };


  // Handlers for filter, sort, search - only update state, useEffect triggers fetch
  const handleSearchChange = (event) => { setSearchQuery(event.target.value); };
  const handleFilterCategoryChange = (event) => { setFilterCategory(event.target.value); };
  // Assuming the prop name in StockFiltersAndSortControls is 'filterSupplier'
  const handleFilterSupplierChange = (event) => { setFilterSupplier(event.target.value); };
  const handleSortOrderChange = (event) => { setSortOrder(event.target.value); };


  // --- Component Display ---

  // Display main loading state
  if (loading) {
      // Use MUI components for loading state
      return (
          <Box sx={{ p: theme.spacing(4), textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: theme.spacing(2) }}>Loading Stock Data...</Typography>
          </Box>
      );
  }

  // Display main error state (e.g., fetch failure)
  if (error) {
      // Use MUI components for error state
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
      {/* Use theme spacing for Stack and margin bottom */}
      <Stack direction="row" spacing={theme.spacing(2)} mb={theme.spacing(3)} flexWrap="wrap">
        {/* "Add Item" Button */}
        <Button
          variant="contained"
          size="medium"
          color="primary"
          onClick={handleAddItem} // This handler opens the form modal in add mode
        >
          Add Item
        </Button>
        {/* Other Action Buttons */}
        <Button variant="outlined" size="medium" onClick={handleIncomingGoods} >Incoming Goods</Button>
        <Button variant="outlined" size="medium" color="secondary" onClick={handleOutgoingGoods} >Outgoing Goods</Button>
      </Stack>

      {/* Filters, Sort, and Search */}
      {/* Use theme spacing for Stack and margin bottom */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={theme.spacing(2)} justifyContent="space-between" alignItems="center" mb={theme.spacing(3)} flexWrap="wrap"> {/* Responsive direction */}
        {/* Filters and Sort Controls component */}
        {/* Ensure names match expected props in StockFiltersAndSortControls */}
        <Box> {/* Wrap filters/sort if needed for alignment */}
          <StockFiltersAndSortControls
            filterCategory={filterCategory}
            onFilterCategoryChange={handleFilterCategoryChange}
            filterSupplier={filterSupplier}
            onFilterSupplierChange={handleFilterSupplierChange}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
          />
        </Box>
        {/* SearchInput component */}
        <Box sx={{ minWidth: { xs: '100%', sm: 200 } }}> {/* Responsive minWidth */}
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder="Search by ID or Name..."
          />
        </Box>
      </Stack>

      {/* Items Table */}
      {/* Added elevation and border radius from theme */}
      <Card elevation={3} sx={{ borderRadius: theme.shape.borderRadius }}>
        {/* Remove default Paper boxShadow if Card has one */}
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableHead>
              {/* Use theme grey or action.hover for header background, bold text */}
              <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                {/* Added fontWeight bold to headers */}
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
                  /* Added hover effect */
                  <TableRow key={item.id} hover>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    {/* Use nullish coalescing ?? for default 'N/A' */}
                    <TableCell>{item.part_number ?? 'N/A'}</TableCell>
                    <TableCell>{item.category ?? 'N/A'}</TableCell>
                    {/* Format price */}
                    <TableCell>
                        {item.price !== undefined && item.price !== null
                            ? `Rp ${Number(item.price).toLocaleString('id-ID')}` // Ensure it's a number before formatting
                            : 'N/A'}
                    </TableCell>
                    {/* Use nullish coalescing ?? for default 'N/A' */}
                    <TableCell>{item.stock ?? 'N/A'}</TableCell>
                    <TableCell>{item.supplier ?? 'N/A'}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          px: theme.spacing(2), py: theme.spacing(0.5), // Use theme spacing
                          borderRadius: 999, // Use a high value for pill shape
                          display: 'inline-block',
                          // Use theme colors for background and text
                          bgcolor: item.status === 'Available' ? theme.palette.success.light : theme.palette.error.light,
                          color: item.status === 'Available' ? theme.palette.success.dark : theme.palette.error.dark, // Use dark for text contrast
                          fontSize: '0.8rem',
                          fontWeight: 'medium' // Make status text slightly bolder
                        }}
                      >
                        {item.status ?? 'N/A'}
                      </Typography>
                    </TableCell>
                     <TableCell>{item.uom ?? 'N/A'}</TableCell>
                     <TableCell>{item.remarks ?? 'N/A'}</TableCell>
                    <TableCell align="center">
                      {/* Use theme spacing for Stack */}
                      <Stack direction="row" spacing={theme.spacing(0.5)} justifyContent="center">
                        {/* Action Buttons */}
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(item.id)} // Opens the form modal in edit mode
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(item.id)} // Opens the delete confirmation modal
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemId={selectedItemId} // Pass the item ID to be deleted
        loading={deleteLoading} // Pass delete loading state
        error={deleteError} // Pass the specific delete error
      />

      {/* Stock Form (for Add/Edit) */}
      {/* initialData will be null for Add, or the item object for Edit */}
      <StockForm
          open={openForm}
          onClose={handleCancelForm}
          onSubmit={handleSaveItem} // This handler processes the form data when submitted
          initialData={itemToEdit} // Pass data for editing (null for add mode)
          loading={saveLoading} // Pass the specific save loading state
          error={saveError} // Pass the specific save error message
      />
    </Box>
  );
};

export default StockManagement;