const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'kunci-rahasia-jwt-untuk-development';
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

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password dibutuhkan' });
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

    const responseUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    res.json({
      message: 'Login berhasil',
      user: responseUser,
      token
    });
  } catch (err) {
    console.error('Error saat login:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, email } = req.body;

  if (username === undefined || email === undefined) {
    return res.status(400).json({ error: 'Username dan email dibutuhkan.' });
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
      return res.status(404).json({ error: 'User tidak ditemukan atau sudah dihapus.' });
    }

    const updatedUser = result.rows[0];
    const token = generateToken(updatedUser);

    res.json({
      message: 'Profil berhasil diperbarui!',
      user: updatedUser,
      token
    });
  } catch (err) {
    console.error('Error saat memperbarui profil:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui profil.' });
  }
};
