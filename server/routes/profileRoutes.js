const express = require("express");

const {
  getBusiness,
  updateBusiness,
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/business", authMiddleware, getBusiness);
router.put("/business", authMiddleware, updateBusiness);

module.exports = router;