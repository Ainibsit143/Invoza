const mongoose = require("mongoose");

const Customer = require("../models/Customer");

const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      address: address?.trim(),
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      customers,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      customer,
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
      },
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim(),
        address: address?.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};