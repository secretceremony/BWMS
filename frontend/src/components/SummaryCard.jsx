import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

function SummaryCard({ title, value }) {
  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default SummaryCard;