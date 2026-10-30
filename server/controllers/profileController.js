const User = require("../models/User");

// The only business fields a user can save, with their length limits
const FIELDS = {
  name: { label: "Business name", max: 100 },
  email: { label: "Business email", max: 100 },
  phone: { label: "Phone", max: 30 },
  address: { label: "Address", max: 300 },
  taxId: { label: "Tax ID", max: 50 },
  paymentDetails: { label: "Payment details", max: 500 },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toPublicBusiness = (user) =>
  Object.fromEntries(
    Object.keys(FIELDS).map((key) => [key, user.business?.[key] ?? ""])
  );

const getBusiness = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("business");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ business: toPublicBusiness(user) });
  } catch (error) {
    next(error);
  }
};

const updateBusiness = async (req, res, next) => {
  try {
    const body = req.body ?? {};

    if (typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ message: "Invalid business details" });
    }

    const business = {};

    for (const [key, { label, max }] of Object.entries(FIELDS)) {
      const value = body[key] ?? "";

      if (typeof value !== "string") {
        return res.status(400).json({ message: `${label} must be text` });
      }

      const trimmed = value.trim();

      if (trimmed.length > max) {
        return res.status(400).json({
          message: `${label} must be ${max} characters or fewer`,
        });
      }

      business[key] = trimmed;
    }

    if (business.email && !EMAIL_PATTERN.test(business.email)) {
      return res.status(400).json({ message: "Enter a valid business email" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { business },
      { returnDocument: "after", runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Business details saved",
      business: toPublicBusiness(user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBusiness, updateBusiness };