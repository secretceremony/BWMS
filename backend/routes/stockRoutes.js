// routes/stockRoutes.js
const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");
// authMiddleware di-apply di server.js untuk seluruh path /api/stock
const validateIdParam = require("../middleware/validateIdMiddleware"); // Import middleware validasi ID

// Catatan: middleware authenticateToken sudah di-apply ke seluruh router ini di file server.js
// Contoh: app.use('/api/stock', authenticateToken, stockRoutes);

// --- Stock Routes ---

// @route   GET /api/stock
// @desc    Get all stock items
// @access  Private (Memerlukan JWT, validasi ID tidak diperlukan di sini)
router.get("/",
  // --- Log untuk debugging di sini ---
  (req, res, next) => {
    console.log(">>> DEBUG: --- Masuk GET /api/stock route (ambil semua) ---");
    next(); // Lanjutkan ke controller
  },
  stockController.getAllStock // Controller untuk mengambil semua stok
);

// @route   POST /api/stock
// @desc    Create a new stock item
// @access  Private (Memerlukan JWT, validasi ID tidak diperlukan di sini karena ID dibuat backend)
router.post("/",
  // --- Log untuk debugging di sini ---
  (req, res, next) => {
    console.log(">>> DEBUG: --- Masuk POST /api/stock route (buat baru) ---");
    next(); // Lanjutkan ke controller
  },
  stockController.createStockItem // Controller untuk membuat stok baru
);

// @route   GET /api/stock/:id
// @desc    Get a single stock item by ID
// @access  Private (Memerlukan JWT, validasi ID diperlukan)
router.get("/:id",
  // --- Log untuk debugging di sini ---
  (req, res, next) => {
    console.log(`>>> DEBUG: --- Masuk GET /api/stock/:id route (ambil by ID) untuk ID: ${req.params.id} ---`);
    next(); // Lanjutkan ke middleware atau controller berikutnya
  },
  validateIdParam, // Middleware validasi ID
  stockController.getStockItemById // Controller untuk mengambil stok berdasarkan ID
);

// @route   PATCH /api/stock/:id
// @desc    Update a stock item by ID
// @access  Private (Memerlukan JWT, validasi ID diperlukan)
router.patch("/:id",
  // --- Log untuk debugging di sini ---
  (req, res, next) => {
     console.log(`>>> DEBUG: --- Masuk PATCH /api/stock/:id route (update by ID) untuk ID: ${req.params.id} ---`);
    next(); // Lanjutkan
  },
  validateIdParam, // Middleware validasi ID
  stockController.updateStockItem // Controller untuk update stok
);

// @route   DELETE /api/stock/:id
// @desc    Delete a stock item by ID
// @access  Private (Memerlukan JWT, validasi ID diperlukan)
router.delete("/:id",
   // --- Log untuk debugging di sini ---
  (req, res, next) => {
    console.log(`>>> DEBUG: --- Masuk DELETE /api/stock/:id route (hapus by ID) untuk ID: ${req.params.id} ---`);
    next(); // Lanjutkan
  },
  validateIdParam, // Middleware validasi ID
  stockController.deleteStockItem // Controller untuk menghapus stok
);


module.exports = router;