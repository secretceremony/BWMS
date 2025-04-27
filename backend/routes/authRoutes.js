// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

// Public route for login
router.post("/login", authController.login);

// Route for logout (usually client-side token removal)
router.post("/logout", authController.logout); // Optional: keep if you have server-side logout logic

// Route for refreshing token (requires a valid token to be refreshed)
router.post("/token/refresh", authenticateToken, authController.refreshToken);


module.exports = router;