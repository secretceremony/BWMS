// controllers/userController.js
const pool = require("../db"); // Assuming db.js exports the connection pool
const { generateToken } = require("../utils/authUtils"); // Import generateToken

// Get authenticated user profile
const getUser = (req, res) => {
  // `req.user` is available here due to the `authenticateToken` middleware
  const user = {
    id: req.user.id,
    email: req.user.email,
    username: req.user.username,
    role: req.user.role
  };
  res.json({ user });
};

// Update user profile
const updateProfile = async (req, res) => {
  // `req.user` is available here due to the `authenticateToken` middleware
  const userId = req.user.id;
  const { username, email } = req.body;

  if (username === undefined || email === undefined) {
    return res.status(400).json({ error: "Username dan email dibutuhkan." });
  }

  try {
    const updateQuery = `
      UPDATE users
      SET username = $1, email = $2
      WHERE id = $3
      RETURNING id, username, email, role;
    `;
    const result = await pool.query(updateQuery, [username, email, userId]);

    if (result.rowCount === 0) {
      // This case is unlikely if authenticateToken works, but good practice
      return res.status(404).json({ error: "User tidak ditemukan atau sudah dihapus." });
    }

    const updatedUser = result.rows[0];

    // Generate a new token with potentially updated user info (username/email)
    const newToken = generateToken(updatedUser);

    res.json({
      message: "Profil berhasil diperbarui!",
      user: updatedUser,
      token: newToken // Send back a new token with updated claims
    });

  } catch (err) {
    console.error('Error saat memperbarui profil:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui profil.' });
  }
};


module.exports = {
  getUser,
  updateProfile
};