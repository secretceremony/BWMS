// index.js (Revised)

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db"); // Assuming db.js exports the connection pool

// Import your existing route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
// --- ADDED: Import the new stock routes ---
const stockRoutes = require("./routes/stockRoutes");
// --- END ADDED ---

const app = express();

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
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Root endpoint
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Mount the route files under the /api path
app.use("/api", authRoutes);
app.use("/api", userRoutes);
// --- ADDED: Mount the new stock routes ---
app.use("/api", stockRoutes);
// --- END ADDED ---


// Basic error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});