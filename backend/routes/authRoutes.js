// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route untuk login
router.post("/login", authController.login);

// Route untuk register
router.post("/register", authController.register);

// Route untuk logout
router.post("/logout", authController.logout);

module.exports = router;