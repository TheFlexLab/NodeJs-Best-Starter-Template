const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    contactPersonName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }, // Required for casino-related queries
    message: { type: String }, // Optional field for casino queries
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ContactUs", contactUsSchema);
