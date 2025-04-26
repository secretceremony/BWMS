const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pool = require("./db");
require("dotenv").config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',  // Adjust with the actual frontend URL if different
  methods: ['GET', 'POST'],
  credentials: true,  // Enable credentials (cookies) to be sent
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false, // Only save a session if it is modified
    cookie: {
      secure: false, // Set to true if you have HTTPS
      httpOnly: true, // Prevent client-side JavaScript from accessing cookie
      maxAge: 1000 * 60 * 60 * 24, // Cookie expiration: 1 day
    },
  })
);

// --- Routes ---

// Health check route to verify backend status
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/api/user", (req, res) => {
  if (req.session && req.session.user) {
    // Session exists and has user data
    res.json({ user: req.session.user });
  } else {
    // No active session
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Login route (keep as POST)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if user exists in the database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Save user details in the session if authentication is successful
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    console.log("Session created:", req.session.user);

    // Respond with success message and user data
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
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.json({ message: "Logged out successfully" });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});