const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pool = require("./db");
require("dotenv").config(); // Make sure dotenv is configured to load .env file

const app = express();

// --- CORS configuration ---
// Allow multiple origins based on environment
const allowedOrigins = [
    'http://localhost:5173', // Your local frontend development URL
    'https://bwms-bae.vercel.app', // Your public frontend URL on Vercel
    // Add other frontend origins if needed
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Add methods your frontend will use
  credentials: true, // Allow credentials (cookies)
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (if you have forms)


// Session configuration
app.use(
  session({
    // Use the environment variable SESSION_SECRET for production, fallback to a default for dev (but use a strong one!)
    secret: process.env.SESSION_SECRET || "a-very-strong-default-secret-for-dev", // !! CHANGE THIS DEFAULT !!
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
    store: /* Add a session store here for production (e.g., connect-pg-simple) */ undefined, // In-memory store is NOT for production!

    cookie: {
      // Set secure to true only if the connection is HTTPS
      // Railway terminates SSL, so 'proxy: true' is needed for express to detect HTTPS
      secure: process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT !== undefined, // Be explicit for Railway HTTPS
      httpOnly: true, // Keep true
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Often needed for cross-site cookies in modern browsers (None requires secure: true)
    },
    proxy: true // <-- Required if running behind a reverse proxy like Railway, needed for 'secure' cookie flag
  })
);

// --- Routes ---

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Authentication check for frontend
app.get("/api/user", (req, res) => {
  if (req.session && req.session.user) {
    // Avoid sending password hash back!
    const user = {
      id: req.session.user.id,
      email: req.session.user.email,
      username: req.session.user.username,
      role: req.session.user.role,
      // Add other non-sensitive user data from session
    };
    res.json({ user: user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      console.log(`Login failed: User not found for email ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords (ensure 'password' column exists and contains hashed passwords)
    const isMatch = await bcrypt.compare(password, user.password); // Make sure 'user.password' is the HASHED password
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for user ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store non-sensitive user info in the session
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      // Only store necessary, non-sensitive data here
    };

    console.log("Session created for user:", req.session.user.email);

    // Send back only non-sensitive user info
     const responseUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      // Add other non-sensitive user data
    };

      res.json({ message: "Login successful", user: responseUser });
    // });


  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
});

// Logout route
app.post("/api/logout", (req, res) => {
  // Check if a session exists before destroying
  if (!req.session) {
       return res.json({ message: "Already logged out or no session" });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: "Failed to log out" });
    }
    // Clear the session cookie from the browser
    res.clearCookie("connect.sid", {
        // Add cookie options that were used when setting it
        secure: process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT !== undefined,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/' // Match the path the cookie was set for
    });
    console.log("Session destroyed");
    res.json({ message: "Logged out successfully" });
  });
});

// --- Start server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // In production, this might be misleading as Railway provides HTTPS
  if (process.env.NODE_ENV === 'production') {
      console.log('Note: Running in production mode. Access via public URL.');
  }
});