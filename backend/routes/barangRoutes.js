// routes/barangRoutes.js
const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');

// Tes: GET semua barang
router.get('/', barangController.getAllBarang);

module.exports = router;
