// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const barangRoutes = require('./routes/barangRoutes');

require('dotenv').config();

app.use(cors());
app.use(express.json());

// Routing
app.use('/api/barang', barangRoutes);

const PORT = process.env.PORT || 5432;
app.listen(PORT, () => {
console.log(`🚀 Server berjalan di port ${PORT}`);
});
