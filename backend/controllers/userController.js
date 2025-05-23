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

// Ambil semua user (khusus admin)
const getAllUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya admin yang boleh mengakses.' });
  }
  try {
    const result = await pool.query('SELECT id, username, email, role FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data user.' });
  }
};

// Tambah user baru (khusus admin)
const createUser = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya admin yang boleh mengakses.' });
  }
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, dan password wajib diisi.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, role || 'manager']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambah user.' });
  }
};

// Update user (khusus admin)
const updateUser = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya admin yang boleh mengakses.' });
  }
  const { id } = req.params;
  const { username, email, role } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET username=$1, email=$2, role=$3 WHERE id=$4 RETURNING id, username, email, role',
      [username, email, role, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User tidak ditemukan.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal update user.' });
  }
};

// Hapus user (khusus admin)
const deleteUser = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya admin yang boleh mengakses.' });
  }
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User tidak ditemukan.' });
    res.json({ message: 'User berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal hapus user.' });
  }
};

module.exports = {
  getUser,
  updateProfile,
  changePassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};