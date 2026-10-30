const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },
     currency: {
      type: String,
      trim: true,
      uppercase: true,
      match: /^[A-Z]{3}$/,
      default: "USD",
    },
        invoiceCounter: {
      type: Number,
      default: 0,
      min: 0,
    },

        business: {
            name: { type: String, trim: true, maxlength: 100 },
            email: { type: String, trim: true, lowercase:true, maxlength: 100 },
            phone: { type: String, trim: true, maxlength: 30 },
            address: { type: String, trim: true, maxlength: 300 },
            taxId: { type: String, trim: true, maxlength: 50 },   
            paymentDetails: { type: String, trim: true, maxlength: 500 },
        },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;