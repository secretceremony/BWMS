// db.js
const { Pool } = require("pg");
require("dotenv").config();

// --- TEMPORARY LOGGING ---
console.log("DB_URL being used:", process.env.DATABASE_URL);
// --- END TEMPORARY LOGGING ---

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err, client) => {
  console.error('DB Pool Error:', err); // More descriptive logging on error
});

module.exports = pool;