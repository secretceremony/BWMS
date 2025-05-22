// backend/src/routes/stockRoutes.js
const express = require("express");
const router = express.Router();
// Import all stock controller functions, including the new history function
const {
    getAllStock,
    getStockById,
    createStock,
    updateStock,
    deleteStock,
    recordIncomingGoods,
    recordOutgoingGoods,
    getStockHistory, // Import the new function
    // Import supplier functions
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require("../controllers/stockController");
const authenticateToken = require("../middleware/authMiddleware"); // Import authentication middleware

// --- Route for Stock API ---
// All these routes require authentication

// GET all stock (with filter, sort, search from query params)
router.get("/stock", authenticateToken, getAllStock);

// GET stock by ID
router.get("/stock/:id", authenticateToken, getStockById);

// POST new stock (handles custom ID in body)
router.post("/stock", authenticateToken, createStock);

// PUT update existing stock by ID (full update)
router.put("/stock/:id", authenticateToken, updateStock);

// DELETE stock by ID
router.delete("/stock/:id", authenticateToken, deleteStock);

// --- Route to record incoming goods transaction ---
router.post("/stock/incoming", authenticateToken, recordIncomingGoods);

// --- Route to record outgoing goods transaction ---
router.post("/stock/outgoing", authenticateToken, recordOutgoingGoods);

// --- NEW: Route to get stock history ---
// This matches the endpoint the frontend is trying to call
router.get("/history", authenticateToken, getStockHistory);

// --- Supplier Management Routes ---
router.get("/suppliers", authenticateToken, getAllSuppliers);
router.get("/suppliers/:id", authenticateToken, getSupplierById);
router.post("/suppliers", authenticateToken, createSupplier);
router.put("/suppliers/:id", authenticateToken, updateSupplier);
router.delete("/suppliers/:id", authenticateToken, deleteSupplier);

module.exports = router;