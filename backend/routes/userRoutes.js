// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware"); // Import middleware

// Route to get user profile (requires authentication)
router.get("/user", authenticateToken, userController.getUser);

// Route to update user profile (requires authentication)
router.put("/profile/update", authenticateToken, userController.updateProfile);

module.exports = router;