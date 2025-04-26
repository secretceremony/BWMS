const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Default route to check if the server is up and running
app.get("/", (req, res) => {
  res.send("Welcome to the backend API! Use /api/login to authenticate.");
});

// Login route (POST)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Query to check if the user exists
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    // If the user is not found
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    // Compare password with the hashed password in the database
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Store user info in session
    req.session.user = { id: user.id, email: user.email, username: user.username, role: user.role };

    res.json({ message: "Login successful" });
  } catch (err) {
    // Log the error and respond with a 500 status code
    console.error("Error during login:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Check login status (GET)
app.get("/api/login", (req, res) => {
  if (req.session.user) {
    // If the user is logged in (session exists)
    res.json({ message: "You are logged in", user: req.session.user });
  } else {
    // If the user is not logged in
    res.status(401).json({ message: "You are not logged in" });
  }
});

// Session configuration (use for secure cookie handling)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key", // Replace with a strong secret key in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});