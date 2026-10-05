require("dotenv").config();
const express = require("express");

const connectDB = require("./config/db");


const app = express();

connectDB();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    message: "Invoza API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});