
require("dotenv").config();
const mysql = require("mysql2/promise");

console.log("Loaded DB config from .env:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? "*****" : "empty",
  database: process.env.DB_NAME,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Explicit DB connection test function
async function connectDB() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to database");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);  // Exit app on DB failure
  }
}

// Export both pool and connectDB for use elsewhere
module.exports = { pool, connectDB };
  