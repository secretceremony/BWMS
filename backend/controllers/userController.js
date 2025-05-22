// controllers/userController.js
const pool = require("../db"); // Assuming db.js exports the connection pool
const { generateToken } = require("../utils/authUtils"); // Import generateToken
const bcrypt = require("bcrypt"); // Import bcrypt untuk hash password

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

// Change user password
const changePassword = async (req, res) => {
  // `req.user` is available here due to the `authenticateToken` middleware
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  // Validasi input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Password lama dan baru dibutuhkan." });
  }

  try {
    // Ambil data user dari database untuk verifikasi password saat ini
    const userQuery = "SELECT * FROM users WHERE id = $1";
    const userResult = await pool.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan." });
    }

    const user = userResult.rows[0];
    
    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password saat ini tidak sesuai." });
    }

    // Hash password baru
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password di database
    const updatePasswordQuery = `
      UPDATE users
      SET password = $1
      WHERE id = $2
      RETURNING id, username, email, role;
    `;
    
    const updateResult = await pool.query(updatePasswordQuery, [hashedNewPassword, userId]);
    
    if (updateResult.rowCount === 0) {
      return res.status(500).json({ error: "Gagal memperbarui password." });
    }

    const updatedUser = updateResult.rows[0];
    
    // Generate token baru
    const newToken = generateToken(updatedUser);

    res.json({
      message: "Password berhasil diubah!",
      user: updatedUser,
      token: newToken
    });

  } catch (err) {
    console.error('Error saat mengubah password:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengubah password.' });
  }
};

module.exports = {
  getUser,
  updateProfile,
  changePassword
};