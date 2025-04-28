// src/components/DeleteConfirmationDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';

const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  itemId,
  loading = false,
  error = null,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">{"Konfirmasi Hapus"}</DialogTitle>
      <DialogContent>
        <Typography id="delete-dialog-description" gutterBottom>
          Apakah Anda yakin ingin menghapus item dengan ID: <strong>{itemId}</strong>?
        </Typography>
        {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                Error: {error}
            </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Batal</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          Hapus
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;