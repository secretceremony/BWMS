const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authenticateToken = require("../middleware/authMiddleware");

// Ambil semua laporan (dengan filter opsional melalui query params)
router.get("/reports", authenticateToken, reportController.getAllReports);

// Ambil laporan berdasarkan ID
router.get("/reports/:id", authenticateToken, reportController.getReportById);

// Update laporan berdasarkan ID
router.put("/reports/:id", authenticateToken, reportController.updateReport);

// Hapus laporan berdasarkan ID
router.delete("/reports/:id", authenticateToken, reportController.deleteReport);

module.exports = router; 