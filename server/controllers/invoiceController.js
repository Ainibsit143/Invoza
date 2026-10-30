const mongoose = require("mongoose");

const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const User = require("../models/User");
const { calculateTotals,
        canTransition,
        STATUS_TRANSITIONS,
 } = require("../utils/invoiceHelpers");

// Same rule as the user's default currency (real ISO 4217 codes only)
const SUPPORTED_CURRENCIES = new Set(
  Intl.supportedValuesOf("currency").filter(
    (code) => code !== "XXX" && code !== "XTS"
  )
);

const MAX_ITEMS = 100;

// Must be a 24-char hex string (rejects objects like { $gt: "" })
const isObjectIdString = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

const parseDate = (value) => {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatInvoiceNumber = (number) =>
  `INV-${String(number).padStart(4, "0")}`;

const fail = (status, message) => ({ error: { status, message } });

// Validates the request body and builds the invoice fields.
// Returns { error: { status, message } } or { data }.
// Used by both create and update so the rules live in one place.
const prepareInvoiceData = async (body, userId) => {
  const { customerId, items, currency, issueDate, dueDate, taxRate, notes } =
    body;

  if (!isObjectIdString(customerId)) {
    return fail(400, "A valid customer is required");
  }

  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
    return fail(400, `Add between 1 and ${MAX_ITEMS} items`);
  }

  for (const item of items) {
    if (!item || typeof item !== "object" || !isObjectIdString(item.productId)) {
      return fail(400, "Each item needs a valid product");
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return fail(400, "Quantity must be a whole number of at least 1");
    }

    if (
      item.unitPrice !== undefined &&
      (typeof item.unitPrice !== "number" ||
        !Number.isFinite(item.unitPrice) ||
        item.unitPrice < 0)
    ) {
      return fail(400, "Unit price must be a non-negative number");
    }
  }

  let requestedCurrency;
  if (currency !== undefined) {
    requestedCurrency =
      typeof currency === "string" ? currency.trim().toUpperCase() : "";

    if (!SUPPORTED_CURRENCIES.has(requestedCurrency)) {
      return fail(400, "Please choose a valid currency");
    }
  }

  const rate = taxRate === undefined ? 0 : taxRate;
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate < 0 || rate > 100) {
    return fail(400, "Tax rate must be a number between 0 and 100");
  }

  let issued;
  if (issueDate === undefined) {
    issued = new Date();
    issued.setUTCHours(0, 0, 0, 0);
  } else {
    issued = parseDate(issueDate);
  }

  const due = parseDate(dueDate);

  if (!issued) {
    return fail(400, "Issue date is invalid");
  }

  if (!due) {
    return fail(400, "A valid due date is required");
  }

  if (due < issued) {
    return fail(400, "Due date cannot be before the issue date");
  }

  if (notes !== undefined && (typeof notes !== "string" || notes.length > 1000)) {
    return fail(400, "Notes must be text up to 1000 characters");
  }

  const customer = await Customer.findOne({
    _id: customerId,
    userId,
  });

  if (!customer) {
    return fail(404, "Customer not found");
  }

  // Same product may appear on several lines, so look up unique IDs only
  const productIds = [
    ...new Set(items.map((item) => item.productId.toLowerCase())),
  ];

  const products = await Product.find({
    _id: { $in: productIds },
    userId,
  });

  if (products.length !== productIds.length) {
    return fail(404, "One or more products not found");
  }

  const productsById = new Map(
    products.map((product) => [product._id.toString(), product])
  );

  const lineItems = items.map((item) => {
    const product = productsById.get(item.productId.toLowerCase());

    return {
      productId: product._id,
      name: product.name,
      description: product.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice ?? product.price,
    };
  });

  const totals = calculateTotals(lineItems, rate);

  return {
    data: {
      customerId: customer._id,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
      items: totals.items,
      currency: requestedCurrency,
      issueDate: issued,
      dueDate: due,
      taxRate: rate,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      total: totals.total,
      notes: notes?.trim() || undefined,
    },
  };
};

const createInvoice = async (req, res, next) => {
  try {
    const { data, error } = await prepareInvoiceData(req.body, req.user.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    // Atomic counter: two invoices can never get the same number
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { invoiceCounter: 1 } },
      { new: true }
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const invoice = await Invoice.create({
      ...data,
      invoiceNumber: formatInvoiceNumber(user.invoiceCounter),
      currency: data.currency ?? user.currency,
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
    });

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    if (typeof status !== "string" || !Object.hasOwn(STATUS_TRANSITIONS, status)) {
      return res.status(400).json({
        message: "Invalid invoice status",
      });
    }

    const invoice = await Invoice.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    if (!canTransition(invoice.status, status)) {
      return res.status(400).json({
        message: `Cannot change status from ${invoice.status} to ${status}`,
      });
    }

    // Only update if the status is still what we just checked
    const updatedInvoice = await Invoice.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
        status: invoice.status,
      },
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return res.status(409).json({
        message: "Invoice was changed. Please refresh and try again",
      });
    }

    res.status(200).json({
      message: "Invoice status updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
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
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    if (invoice.status !== "draft") {
      return res.status(400).json({
        message: "Only draft invoices can be edited",
      });
    }

    const { data, error } = await prepareInvoiceData(req.body, req.user.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    // Invoice number, status and owner are never changed by an edit
    const { notes, ...fields } = data;

    const update = {
      $set: {
        ...fields,
        currency: data.currency ?? invoice.currency,
      },
    };

    if (notes === undefined) {
      update.$unset = { notes: "" };
    } else {
      update.$set.notes = notes;
    }

    // Only update if it is still a draft
    const updatedInvoice = await Invoice.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
        status: "draft",
      },
      update,
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return res.status(409).json({
        message: "Invoice was changed. Please refresh and try again",
      });
    }

    res.status(200).json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice,
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

    // Deletes only if the invoice is yours AND still a draft
    const invoice = await Invoice.findOneAndDelete({
      _id: id,
      userId: req.user.id,
      status: "draft",
    });

    if (!invoice) {
      const exists = await Invoice.exists({
        _id: id,
        userId: req.user.id,
      });

      if (!exists) {
        return res.status(404).json({
          message: "Invoice not found",
        });
      }

      return res.status(400).json({
        message: "Only draft invoices can be deleted",
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