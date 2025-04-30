import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import themeOptions from './theme';
import { createTheme, ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider

const theme = createTheme(themeOptions); // Create a theme object

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap your App with the ThemeProvider */}
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);