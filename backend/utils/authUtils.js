// utils/authUtils.js
require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "kunci-rahasia-jwt-untuk-development";
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

module.exports = {
  generateToken,
  JWT_SECRET // Exporting SECRET might be useful for middleware verification
};