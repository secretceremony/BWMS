// backend/src/routes/stockRoutes.js
const express = require("express");
const router = express.Router();
// Import semua fungsi controller stock
const {
    getAllStock,
    getStockById,
    createStock,
    updateStock,
    deleteStock
} = require("../controllers/stockController");
const authenticateToken = require("../middleware/authMiddleware"); // Import middleware autentikasi

// --- Route untuk API Stock ---
// Semua route ini memerlukan autentikasi

// GET semua stock (dengan filter, sort, search dari query params)
router.get("/stock", authenticateToken, getAllStock);

// GET stock berdasarkan ID
router.get("/stock/:id", authenticateToken, getStockById);

// POST stock baru
router.post("/stock", authenticateToken, createStock);

// PUT update stock berdasarkan ID
router.put("/stock/:id", authenticateToken, updateStock);

// DELETE stock berdasarkan ID
router.delete("/stock/:id", authenticateToken, deleteStock);


module.exports = router;