import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        py: 2,
        textAlign: "center",
        backgroundColor: "#e0e0e0",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Your Company Name
      </Typography>
    </Box>
  );
};

export default Footer;