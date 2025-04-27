require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); 
const pool = require("./db");

const app = express();


const JWT_SECRET = process.env.JWT_SECRET || "kunci-rahasia-jwt-untuk-development";
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

const allowedOrigins = [
  'http://localhost:5173',
  'https://bwms-bae.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  
  if (!token) {
    return res.status(401).json({ error: "Akses ditolak. Token tidak diberikan." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token tidak valid atau sudah kadaluarsa" });
  }
};

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/api/user", authenticateToken, (req, res) => {

  const user = {
    id: req.user.id,
    email: req.user.email,
    username: req.user.username,
    role: req.user.role
  };
  res.json({ user });
});

// Login dengan JWT
app.post("/api/login", async (req, res) => {
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
    console.log("Token yang dibuat:", token); 

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
});


app.post("/api/logout", (req, res) => {
  res.json({ message: "Logout berhasil" });
});

app.put("/api/profile/update", authenticateToken, async (req, res) => {
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
      return res.status(404).json({ error: "User tidak ditemukan atau sudah dihapus." });
    }

    const updatedUser = result.rows[0];
    
    const token = generateToken(updatedUser);

    res.json({ 
      message: "Profil berhasil diperbarui!", 
      user: updatedUser,
      token  
    });

  } catch (err) {
    console.error('Error saat memperbarui profil:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui profil.' });
  }
});

app.post("/api/token/refresh", authenticateToken, (req, res) => {
  const token = generateToken(req.user);
  res.json({ token });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});