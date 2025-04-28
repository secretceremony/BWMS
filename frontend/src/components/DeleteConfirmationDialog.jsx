// src/components/DeleteConfirmationDialog.js (Sesuaikan path jika perlu)
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress // Tambahkan jika ingin indikator loading di tombol
} from '@mui/material';

const DeleteConfirmationDialog = ({
  open, // State boolean untuk mengontrol buka/tutup modal
  onClose, // Handler saat modal ditutup (Cancel atau selesai)
  onConfirm, // Handler saat tombol 'Delete' diklik
  itemId, // ID item yang akan dihapus (untuk ditampilkan di pesan)
  loading = false, // Opsional: indikator loading saat proses delete
  error = null, // Opsional: menampilkan pesan error jika delete gagal
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
        {/* Tampilkan pesan error delete jika ada */}
        {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                Error: {error}
            </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Batal</Button> {/* Disable saat loading */}
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading} // Disable saat loading
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null} // Indikator loading
        >
          Hapus
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;