import React from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  InputBase,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Paper,
} from '@mui/material';

const users = [
  {
    name: 'Prabodhan Fitzgerald',
    email: 'name@email.com',
    location: 'Izaiahport',
    status: 'Active',
    id: '345679',
  },
  {
    name: 'Hiro Joyce',
    email: 'name@email.com',
    location: 'Strackeside',
    status: 'Active',
    id: '345679',
  },
  {
    name: 'Lloyd Jefferson',
    email: 'name@email.com',
    location: 'Texas City',
    status: 'Active',
    id: '345679',
  },
  {
    name: 'Ceiran Mayo',
    email: 'name@email.com',
    location: 'Lake Esmeralda',
    status: 'Active',
    id: '345679',
  },
  {
    name: 'Thumbiko James',
    email: 'name@email.com',
    location: 'East Paige',
    status: 'Suspended',
    id: '345679',
  },
];

const Dashboard = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" mb={4}>
          Stock Management
        </Typography>

        {/* Filters */}
        <Stack direction="row" spacing={2} mb={4} flexWrap="wrap">
          {['LABEL', 'LABEL', 'LABEL'].map((label, index) => (
            <Button key={index} variant="contained" color="primary">
              {label}
            </Button>
          ))}
        </Stack>

        {/* Search + Actions */}
        <Stack direction="row" spacing={2} alignItems="center" mb={4} flexWrap="wrap">
          <InputBase
            placeholder="Name, email, etc..."
            sx={{
              bgcolor: 'white',
              px: 2,
              py: 1,
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
              flex: 1,
              minWidth: '200px',
            }}
          />
          <Select
            defaultValue=""
            displayEmpty
            sx={{
              bgcolor: 'white',
              px: 2,
              py: 1,
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
              minWidth: '150px',
            }}
          >
            <MenuItem value="">
              <em>Property</em>
            </MenuItem>
          </Select>
          <Button variant="outlined">Filter</Button>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1}>
            <Button variant="outlined">ACTION</Button>
            <Button variant="contained" color="primary">
              ACTION
            </Button>
          </Stack>
        </Stack>

        {/* Table */}
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Account Status</TableCell>
                  <TableCell>ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index} hover>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar src={`https://via.placeholder.com/32?text=${user.name[0]}`} />
                        <Typography>{user.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 999,
                          display: 'inline-block',
                          bgcolor: user.status === 'Active' ? 'success.light' : 'warning.main',
                          color: user.status === 'Active' ? 'success.contrastText' : 'warning.contrastText',
                          fontSize: '0.8rem',
                        }}
                      >
                        {user.status}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
