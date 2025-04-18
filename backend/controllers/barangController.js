// controllers/barangController.js
const db = require('../db');

const getAllBarang = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM barang');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    console.error("❌ ERROR DB:", error); // Tambahin ini
    res.status(500).json({ error: 'Gagal mengambil data barang' });
  }
};

module.exports = { getAllBarang };
