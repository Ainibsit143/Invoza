const express = require("express");

const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/me", authMiddleware, updateCurrentUser);

module.exports = router;