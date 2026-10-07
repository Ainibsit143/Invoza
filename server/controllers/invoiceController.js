const mongoose = require("mongoose");

const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

const createInvoice = async (req, res, next) => {
  try {
    const { customerId, items, status } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Customer and at least one item are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findOne({
      _id: customerId,
      userId: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const productIds = items.map((item) => item.productId);

    if (
      productIds.some(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      )
    ) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const products = await Product.find({
      _id: { $in: productIds },
      userId: req.user.id,
    });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        message: "One or more products not found",
      });
    }

    let total = 0;
    const invoiceItems = [];

    for (const item of items) {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Quantity must be positive",
        });
      }

      const product = products.find(
        (product) => product._id.toString() === item.productId
      );

      const itemTotal = product.price * item.quantity;

      total += itemTotal;

      invoiceItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const invoice = await Invoice.create({
      customerId,
      items: invoiceItems,
      total,
      status,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({
      userId: req.user.id,
    })
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    const invoice = await Invoice.findOne({
      _id: id,
      userId: req.user.id,
    }).populate("customerId", "name email");

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["draft", "sent", "paid", "cancelled"];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid invoice status",
      });
    }

    const invoice = await Invoice.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      message: "Invoice status updated successfully",
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerId, items, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Customer and at least one item are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findOne({
      _id: customerId,
      userId: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const productIds = items.map((item) => item.productId);

    if (
      productIds.some(
        (productId) => !mongoose.Types.ObjectId.isValid(productId)
      )
    ) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const products = await Product.find({
      _id: { $in: productIds },
      userId: req.user.id,
    });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        message: "One or more products not found",
      });
    }

    let total = 0;
    const invoiceItems = [];

    for (const item of items) {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Quantity must be positive",
        });
      }

      const product = products.find(
        (product) => product._id.toString() === item.productId
      );

      const itemTotal = product.price * item.quantity;

      total += itemTotal;

      invoiceItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const invoice = await Invoice.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
      },
      {
        customerId,
        items: invoiceItems,
        total,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    const invoice = await Invoice.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
};