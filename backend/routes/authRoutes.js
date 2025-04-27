const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.put('/profile/update', authenticateToken, authController.updateProfile);

module.exports = router;
