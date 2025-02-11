const User = require("../models/userModel");
const { uploadToS3 } = require("../services/uploadToS3");
const mongoose = require("mongoose");

/**
 * Complete KYC submission
 * Handles uploaded files (selfie and document) and user details
 */
const completeKycSubmission = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.user.userId);
    const { name, dateOfBirth, address } = req.body;
    const files = req.files;

    if (!files?.document || !files.selfie) {
      return res.status(400).json({ error: "Identity Document is required" });
    }
    let docUpload, selfieUpload;
    try {
      docUpload = await uploadToS3(
        files?.document[0].buffer,
        `kyc/${id}`,
        "document",
        files?.document[0]
      );
      selfieUpload = await uploadToS3(
        files?.selfie[0].buffer,
        `kyc/${id}`,
        "selfie",
        files?.selfie[0]
      );

      // Update the savedPayment with the screenshot URL
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload",
        error: uploadError.message,
      });
    }

    // Find the user and update KYC details
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.kyc = {
      status: "Pending",
      document: docUpload.url, // Save file path
      selfie: selfieUpload.url, // Save file path
      name,
      dateOfBirth,
      address,
    };

    await user.save();

    res.status(200).json({ message: "KYC submission successful." });
  } catch (error) {
    console.error("Error completing KYC submission:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Review KYC status (Approve or Reject)
 * Allows admin to change the KYC status
 */
const reviewKycStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // Expected status: "Approved" or "Rejected"

    // Validate status
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status value. It must be 'Approved' or 'Rejected'.",
      });
    }

    // Find the user and update the KYC status
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.kyc.status = status; // Update the KYC status
    if (reason) user.kyc.reason = reason;
    await user.save();

    res.status(200).json({ message: `KYC status updated to ${status}.` });
  } catch (error) {
    console.error("Error reviewing KYC status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  completeKycSubmission,
  reviewKycStatus,
};
