// controllers/authController.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const { generateToken, JWT_SECRET } = require("../utils/authUtils");

// Login controller
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password dibutuhkan." });
  }

  try {
    // Cari user berdasarkan email
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({ error: "Email atau password salah." });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email atau password salah." });
    }

    // Buat token JWT
    const token = generateToken(user);

    // Hapus password dari objek user sebelum mengirim response
    const { password: _, ...userWithoutPassword } = user;

    // Kirim response sukses dengan token dan data user
    res.json({
      message: "Login berhasil!",
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("Error saat login:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat login." });
  }
};

// Register controller
const register = async (req, res) => {
  const { email, username, password } = req.body;

  // Validasi input
  if (!email || !username || !password) {
    return res.status(400).json({ error: "Email, username, dan password dibutuhkan." });
  }

  try {
    // Cek apakah email sudah terdaftar
    const emailCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email sudah terdaftar." });
    }

    // Cek apakah username sudah digunakan
    const usernameCheck = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: "Username sudah digunakan." });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Default role: 'user'
    const role = 'user';

    // Insert user baru ke database
    const result = await pool.query(
      `INSERT INTO users (email, username, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, username, role`,
      [email, username, hashedPassword, role]
    );

    const newUser = result.rows[0];

    // Kirim response sukses
    res.status(201).json({
      message: "Registrasi berhasil!",
      user: newUser
    });
  } catch (err) {
    console.error("Error saat registrasi:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat registrasi." });
  }
};

// Logout controller (opsional untuk JWT, karena token disimpan di client)
const logout = (req, res) => {
  // Tidak ada tindakan khusus di server untuk logout dengan JWT
  // Penghapusan token dilakukan di sisi client
  res.json({ message: "Logout berhasil." });
};

module.exports = {
  login,
  register,
  logout
};