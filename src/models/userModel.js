const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    reason: {
      type: String,
    },
    document: {
      type: String, // Path to uploaded document
    },
    selfie: {
      type: String, // Path to uploaded selfie
    },
    name: String,
    dateOfBirth: Date,
    address: String,
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    otp: {
      value: String,
      expiresAt: Date,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [String], // Array to store multiple refresh tokens
      default: [],
    },
    resetToken: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    location: String,
    socialData: { type: Array },
    kyc: kycSchema,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
