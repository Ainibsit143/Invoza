require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// Database connection
connectDB();

// Security & middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Invoza API is running",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(err.status || 500).json({
    message: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});