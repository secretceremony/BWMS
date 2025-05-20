require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

// Import your existing route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const stockRoutes = require("./routes/stockRoutes"); 
const reportRoutes = require("./routes/reportRoutes"); // Import report routes

const app = express();

// Read allowed origins from environment variables
// The environment variable ALLOWED_ORIGINS should be a comma-separated string,
// e.g., "http://localhost:5173,https://bwms-bae.vercel.app"
const allowedOriginsString = process.env.ALLOWED_ORIGINS;

// Split the string into an array. Handle the case where the variable is not set
// If ALLOWED_ORIGINS is not set, allowedOrigins will be an empty array, effectively disallowing all origins except same-origin.
const allowedOrigins = allowedOriginsString ? allowedOriginsString.split(',') : [];

// Log the allowed origins being used (optional, but helpful for debugging startup)
console.log("Configured Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin requests)
    if (!origin) {
        console.log("CORS check: No origin, allowing."); // Log for clarity
        return callback(null, true);
    }

    // Check if the requesting origin is in the allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      console.error(msg); // Log the blocked origin on the server side
      return callback(new Error(msg), false);
    }

    // If the origin is allowed
    console.log(`CORS check: Origin ${origin} is allowed.`); // Log for clarity
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Include all methods your API uses
  credentials: true, // Important for sending cookies/authorization headers cross-origin
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
app.use("/api", stockRoutes); // Mount stock routes
app.use("/api", reportRoutes); // Mount report routes

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Send a more generic error in production, but stack in dev
    res.status(500).send(process.env.NODE_ENV === 'production' ? 'Something broke!' : err.stack);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});