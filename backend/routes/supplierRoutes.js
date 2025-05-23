const express = require("express");
const router = express.Router();
const {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require("../controllers/supplierController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/suppliers", authenticateToken, getAllSuppliers);
router.get("/suppliers/:id", authenticateToken, getSupplierById);
router.post("/suppliers", authenticateToken, createSupplier);
router.put("/suppliers/:id", authenticateToken, updateSupplier);
router.delete("/suppliers/:id", authenticateToken, deleteSupplier);

module.exports = router; 