// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/authUtils"); // Import JWT_SECRET

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Akses ditolak. Token tidak diberikan." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user info to the request
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message); // Log error for debugging
    return res.status(403).json({ error: "Token tidak valid atau sudah kadaluarsa" });
  }
};

module.exports = authenticateToken;