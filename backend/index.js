const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pool = require("./db");
require("dotenv").config();

const app = express();

// --- CORS configuration ---
const corsOptions = {
  origin: 'https://bwms-bae.vercel.app/', // Adjust based on your frontend URL
  methods: ['GET', 'POST'],
  credentials: true, // Allow credentials (cookies)
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON body

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Set secure: true in production
      httpOnly: true, // Keep this true for security
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      // sameSite: 'Lax', // Consider adding SameSite if needed, but often default works with credentials:true
    },
    proxy: true // <-- Add this line to trust the proxy (like Railway)
  })
);

// --- Routes ---

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/api/user", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    console.log("Session created:", req.session.user);

    res.json({ message: "Login successful", user: req.session.user });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Logout route
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// --- Start server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});