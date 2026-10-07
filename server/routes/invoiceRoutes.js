const express = require("express");

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} = require("../controllers/invoiceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createInvoice);
router.get("/", authMiddleware, getInvoices);
router.get("/:id", authMiddleware, getInvoiceById);
router.put("/:id", authMiddleware, updateInvoice);
router.patch("/:id/status", authMiddleware, updateInvoiceStatus);
router.delete("/:id", authMiddleware, deleteInvoice);

module.exports = router;