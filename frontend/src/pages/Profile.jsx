import React from 'react';
import { Box, Avatar, Typography, TextField, Button, MenuItem, Grid } from '@mui/material';

const Profile = () => {
  // Contoh user data, nanti bisa diganti pakai props atau API
  const user = {
    name: 'Oscar Peterson',
    email: 'oscar.peterson@example.com',
    role: 'Operator',
  };

  // State untuk form input
  const [input1, setInput1] = React.useState('');
  const [textarea, setTextarea] = React.useState('');
  const [selectValue, setSelectValue] = React.useState('');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>

      <Grid container spacing={3} alignItems="center">
        {/* Avatar */}
        <Grid item>
          <Avatar sx={{ width: 120, height: 120, fontSize: 32 }}>
            {user.name.split(' ').map(word => word[0]).join('')}
          </Avatar>
        </Grid>

        {/* User Info */}
        <Grid item>
          <Typography variant="h6">Name: {user.name}</Typography>
          <Typography variant="h6">Email: {user.email}</Typography>
          <Typography variant="h6">Role: {user.role}</Typography>
        </Grid>
      </Grid>

      {/* Form Inputs */}
      <Box sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="Label"
          value={input1}
          onChange={(e) => setInput1(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Label"
          value={textarea}
          onChange={(e) => setTextarea(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          inputProps={{ maxLength: 100 }}
          helperText={`${textarea.length}/100`}
        />
        <TextField
          fullWidth
          label="Label"
          value={selectValue}
          onChange={(e) => setSelectValue(e.target.value)}
          margin="normal"
          select
        >
          <MenuItem value="option1">Option 1</MenuItem>
          <MenuItem value="option2">Option 2</MenuItem>
          <MenuItem value="option3">Option 3</MenuItem>
        </TextField>

        <Button variant="contained" sx={{ mt: 2 }}>
          ACTION
        </Button>
      </Box>
    </Box>
  );
};

export default Profile;
