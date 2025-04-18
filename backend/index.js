const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require('./db');
db.query('SELECT current_database()', (err, res) => {
  if (err) console.error('❌ Gagal konek DB:', err.message);
  else console.log('✅ Terkoneksi ke DB:', res.rows[0].current_database);
});


const app = express();
app.use(cors());
app.use(express.json());

// Endpoint tes
app.get("/", (req, res) => {
  res.send("API berjalan!");
});

// Import route barang
const barangRoutes = require("./routes/barangRoutes");
app.use("/api/barang", barangRoutes);

// Jalankan server
const PORT = process.env.PORT || 5432;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
