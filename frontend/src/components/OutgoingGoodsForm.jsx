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
} from '@mui/material';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const OutgoingGoodsForm = ({
  open,
  onClose,
  onSubmit = () => {}, // prevent crash if undefined
  loading = false,
  error = null,
}) => {
  const theme = useTheme();

  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    remarks: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  const [stockItems, setStockItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (open) {
      const fetchStockItems = async () => {
        if (!API_URL) {
          setItemsError("API URL is not configured.");
          setItemsLoading(false);
          return;
        }

        setItemsLoading(true);
        setItemsError(null);

        const token = getAuthToken();
        if (!token) {
          setItemsError("Authentication token missing.");
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
          setStockItems(data);
        } catch (err) {
          console.error("Failed to fetch stock items:", err);
          setItemsError(`Failed to load items: ${err.message}`);
        } finally {
          setItemsLoading(false);
        }
      };

      fetchStockItems();
    } else {
      setFormData({
        itemId: '',
        quantity: '',
        remarks: '',
        transactionDate: new Date().toISOString().split('T')[0],
      });
      setValidationErrors({});
      setItemsError(null);
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.itemId) errors.itemId = 'Item is required.';
    if (!formData.quantity || Number(formData.quantity) <= 0)
      errors.quantity = 'Quantity must be a positive number.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const dataToSubmit = {
      itemId: formData.itemId,
      quantity: Number(formData.quantity),
      remarks: formData.remarks,
      transactionDate: formData.transactionDate,
    };

    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record Outgoing Goods</DialogTitle>
      <DialogContent dividers sx={{ padding: theme.spacing(3) }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container direction="column" spacing={2}>
            {/* Item Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!validationErrors.itemId}>
                <InputLabel shrink>Select Item</InputLabel>
                {itemsLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Loading items...
                    </Typography>
                  </Box>
                ) : itemsError ? (
                  <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    {itemsError}
                  </Typography>
                ) : (
                  <Select
                    name="itemId"
                    value={formData.itemId}
                    onChange={handleChange}
                    displayEmpty
                    sx={{ mt: 2 }}
                  >
                    <MenuItem value="" disabled>
                      Select Item
                    </MenuItem>
                    {stockItems.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {`${item.id} - ${item.name}`}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                <Typography variant="caption" color="error">
                  {validationErrors.itemId}
                </Typography>
              </FormControl>
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity"
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
                label="Transaction Date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                fullWidth
                required
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Remarks */}
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

          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{ mt: theme.spacing(2), textAlign: 'center' }}
            >
              Transaction Error: {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: theme.spacing(2) }}>
        <Button onClick={onClose} disabled={loading || itemsLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || itemsLoading || !!itemsError}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          Record Outgoing
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OutgoingGoodsForm;