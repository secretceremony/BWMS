import React from 'react';
import { Card, CardContent, Typography, Divider, Grid, TextField, Button, CircularProgress } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const EditProfileForm = ({ user, onUserUpdate }) => {
  const [editingUsername, setEditingUsername] = React.useState(user?.username || '');
  const [editingEmail, setEditingEmail] = React.useState(user?.email || '');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleUpdateProfile = async () => {
    // ... logic update profile sama seperti sebelumnya ...
  };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Edit Profile</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Username" value={editingUsername} onChange={e => setEditingUsername(e.target.value)} margin="normal" variant="outlined" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Email" value={editingEmail} onChange={e => setEditingEmail(e.target.value)} margin="normal" variant="outlined" type="email" />
          </Grid>
        </Grid>
        <Button variant="contained" sx={{ mt: 3 }} onClick={handleUpdateProfile} disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>{isSaving ? 'Saving...' : 'UPDATE PROFILE'}</Button>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm; 