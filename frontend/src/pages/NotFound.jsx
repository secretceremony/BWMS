import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme // Import useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { SentimentDissatisfied as SadFaceIcon } from '@mui/icons-material';

function NotFound() {
  const theme = useTheme(); // Use the theme hook

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          // Use theme background color
          backgroundColor: theme.palette.background.default,
          // Use theme spacing for vertical padding
          py: theme.spacing(5),
          // Ensure no extra padding/margin interfering with full height
          width: '100%', // Explicitly set width
          boxSizing: 'border-box', // Include padding in width calculation
        }}
      >
        <SadFaceIcon
          sx={{
            fontSize: 100,
            // Use theme color for the icon (text.secondary is standard)
            color: theme.palette.text.secondary,
            // Use theme spacing for bottom margin
            mb: theme.spacing(3)
          }}
        />
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          // Use theme text secondary color
          color={theme.palette.text.secondary}
          paragraph
          sx={{ mb: theme.spacing(4) }} // Use theme spacing
        >
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          // Button variant="contained" automatically uses theme primary colors
          // You can add custom hover/styles here if needed, but default is good
          // sx={{ ... }}
        >
          Return to Dashboard
        </Button>
      </Box>
    </Container>
  );
}

export default NotFound;