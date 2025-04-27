const bcrypt = require("bcryptjs");
const pool = require("../db");
const { generateToken } = require("../utils/authUtils");

// Handle user login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password dibutuhkan" });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    const token = generateToken(user);
    console.log("Token yang dibuat:", token); // Log generated token

    const responseUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    res.json({
      message: "Login berhasil",
      user: responseUser,
      token
    });

  } catch (err) {
    console.error('Error saat login:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};

// Handle user logout (simple server-side response)
const logout = (req, res) => {
  // In a JWT system, logout is typically handled client-side by discarding the token.
  // This endpoint is more for confirming the action or performing server-side cleanup if needed.
  res.json({ message: "Logout berhasil" });
};

// Handle token refresh
const refreshToken = (req, res) => {
  // `req.user` is available here due to the `authenticateToken` middleware
  const userForToken = {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      role: req.user.role
  };
  const newToken = generateToken(userForToken);
  res.json({ token: newToken });
};


module.exports = {
  login,
  logout,
  refreshToken
};