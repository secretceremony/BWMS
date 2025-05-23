// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware"); // Import middleware

// Route to get user profile (requires authentication)
router.get("/user", authenticateToken, userController.getUser);

// Route to update user profile (requires authentication)
router.put("/profile/update", authenticateToken, userController.updateProfile);

// Route to change user password (requires authentication)
router.post("/profile/change-password", authenticateToken, userController.changePassword);

// Endpoint admin untuk kelola user
router.get('/users', authenticateToken, userController.getAllUsers);
router.post('/users', authenticateToken, userController.createUser);
router.put('/users/:id', authenticateToken, userController.updateUser);
router.delete('/users/:id', authenticateToken, userController.deleteUser);

module.exports = router;