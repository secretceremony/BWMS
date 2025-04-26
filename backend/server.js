const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Default route for the root URL
app.get("/", (req, res) => {
  res.send("Welcome to the backend API! Use /api/login to authenticate.");
});

// Login route (POST)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = userResult.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    // Store user info in session
    req.session.user = { id: user.id, email: user.email, username: user.username, role: user.role };

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Check login status (GET)
app.get("/api/login", (req, res) => {
  if (req.session.user) {
    res.json({ message: "You are logged in", user: req.session.user });
  } else {
    res.status(401).json({ message: "You are not logged in" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));