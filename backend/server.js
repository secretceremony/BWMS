const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up session handling
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key", // Use a secret key to sign the session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `secure: true` if using HTTPS in production
  })
);

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

// Add GET route for login status check
app.get("/api/login", (req, res) => {
  if (req.session.user) {
    // If the user is logged in (session exists)
    res.json({ message: "You are logged in", user: req.session.user });
  } else {
    // If the user is not logged in
    res.status(401).json({ message: "You are not logged in" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));