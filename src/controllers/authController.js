const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const otpService = require("../services/otpService");
const tokenService = require("../services/tokenService");
const { sendEmailMessage } = require("../services/sendEmail");
const { AWS_SES_SENDER, FRONTEND_URL } = require("../config/env");
const mongoose = require("mongoose");

// Sign Up
const signUp = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otpDetails = otpService.generateOtp();

    await User.create({
      email,
      password: hashedPassword,
      otp: { value: otpDetails.value, expiresAt: otpDetails.expiresAt },
    });

    // Simulate sending OTP (log it for simplicity)
    console.log(`OTP for ${email}: ${otpDetails.value}`);

    const emailBody = `
    <p>Hello,</p>
    <p>Thank you for signing up for XYZ! To verify your email address and complete your account creation, please use the following OTP:</p>
    <h2>${otpDetails.value}</h2>
    <p>If you did not sign up for XYZ, please ignore this email.</p>
    <p>Best regards,</p>
    <p>Team XYZ</p>
  `;

    // Send the email
    const sendOtpMail = await sendEmailMessage(
      "Email Verification OTP", // Subject
      emailBody, // Body (HTML formatted)
      AWS_SES_SENDER, // Sender email
      email // Recipient email
    );
    if (!sendOtpMail) throw new Error("No OTP sent :(");

    res.status(201).json({
      message: "User registered. Verify OTP to complete registration.",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp.value !== otp || new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = undefined; // Clear OTP after verification
    user.emailVerified = true;
    // Generate JWT tokens
    const accessToken = tokenService.generateAccessToken(user._id, user.role);
    const refreshToken = tokenService.generateRefreshToken(user._id, user.role);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Return tokens in response
    res.status(200).json({
      message: "OTP verified successfully",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.kyc?.name,
        selfie: user.kyc?.selfie,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Resend OTP
const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if user has already verified email
    if (!user.otp) {
      return res.status(400).json({
        message: "Email is already verified. Please log in.",
      });
    }

    // Generate a new OTP
    const otpDetails = otpService.generateOtp();
    user.otp = { value: otpDetails.value, expiresAt: otpDetails.expiresAt };
    await user.save();

    const emailBody = `
      <p>Hello,</p>
      <p>Thank you for signing up for XYZ! To verify your email address and complete your account creation, please use the following OTP:</p>
      <h2>${otpDetails.value}</h2>
      <p>If you did not sign up for XYZ, please ignore this email.</p>
      <p>Best regards,</p>
      <p>Team XYZ</p>
    `;

    // Send the email
    const sendOtpMail = await sendEmailMessage(
      "Email Verification OTP", // Subject
      emailBody, // Body (HTML formatted)
      AWS_SES_SENDER, // Sender email
      email // Recipient email
    );
    if (!sendOtpMail) throw new Error("No OTP sent :(");

    res.status(200).json({
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const login = async (req, res) => {
  const { email, password, clientType } = req.body; // 'clientType' indicates 'web' or 'native'

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle unverified email
    if (!user.emailVerified) {
      const otpDetails = otpService.generateOtp();

      // Update OTP in the database
      await User.findOneAndUpdate(
        { email },
        { otp: { value: otpDetails.value, expiresAt: otpDetails.expiresAt } }
      );

      const emailBody = `
        <p>Hello,</p>
        <p>Thank you for signing up for XYZ! To verify your email address and complete your account creation, please use the following OTP:</p>
        <h2>${otpDetails.value}</h2>
        <p>If you did not sign up for XYZ, please ignore this email.</p>
        <p>Best regards,</p>
        <p>Team XYZ</p>
      `;
      // Send the email
      const sendOtpMail = await sendEmailMessage(
        "Email Verification OTP", // Subject
        emailBody, // Body (HTML formatted)
        AWS_SES_SENDER, // Sender email
        email // Recipient email
      );

      if (!sendOtpMail) {
        throw new Error("Failed to send OTP email.");
      }

      return res.status(400).json({
        message: "Email is not verified. Please verify your email to proceed.",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user._id, user.role);
    const refreshToken = tokenService.generateRefreshToken(user._id, user.role);

    // Save refresh token to user record
    user.refreshTokens.push(refreshToken);
    await user.save();

    if (clientType === "web") {
      // Web Client: Store refresh token in HttpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        // sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        message: "Login successful",
        data: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.kyc?.name,
          selfie: user.kyc?.selfie,
        },
        token: accessToken, // Access token only
      });
    } else if (clientType === "native") {
      // React Native Client: Send refresh token in the response body
      return res.status(200).json({
        message: "Login successful",
        data: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.kyc?.name,
          selfie: user.kyc?.selfie,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid client type" });
    }
  } catch (error) {
    console.error("Login Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const accessToken = tokenService.generateAccessToken(user._id, user.role);

    // Store the token in the user's resetToken field
    user.resetToken = accessToken;
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password/${accessToken}`;

    // Create the email body with text and the reset link
    const emailBody = `
      <p>Hello,</p>
      <p>You have requested to reset your password. Please click the link below to reset your password:</p>
      <p><a href="${resetLink}" target="_blank">Reset Your Password</a></p>
      <p>If you did not request this, please ignore this email or contact support.</p>
      <p>Best regards,</p>
      <p>Team XYZ</p>
    `;

    const sendOtpMail = await sendEmailMessage(
      "Reset Password",
      emailBody,
      AWS_SES_SENDER,
      email
    );
    if (!sendOtpMail) throw new Error("No OTP sent :(");

    res.status(200).json({
      message: "Password reset link sent to your email address.",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify reset token
    const accessToken = tokenService.verifyAccessToken(token);
    const user = await User.findOne({
      _id: accessToken.userId,
      resetToken: token,
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    user.password = hashedPassword;
    user.resetToken = undefined; // Clear the reset token
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  try {
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token is required" });

    // Verify refresh token
    const decoded = tokenService.verifyRefreshToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find user in DB
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new tokens
    const newAccessToken = tokenService.generateAccessToken(
      user._id,
      user.role
    );
    const newRefreshToken = tokenService.generateRefreshToken(
      user._id,
      user.role
    );

    // Update refresh tokens array (replace the old one with the new one)
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      // sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "New tokens generated",
      token: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

// Logout
const logout = async (req, res) => {
  const { refreshToken } = req.body;
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove the specific refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logoutAll = async (req, res) => {
  const { userId } = req.user;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Clear all refresh tokens
    user.refreshTokens = [];
    await user.save();

    res
      .status(200)
      .json({ message: "Logged out from all devices successfully" });
  } catch (error) {
    console.error("Logout All error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Find the user by userId
    const user = await User.findById(req?.user?.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the old password matches
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const socialAuth = async (req, res) => {
  try {
    const { userId, role } = req.user; // Extracted from the decoded token in middleware

    // Check if the user exists
    let user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
      role: role,
    });

    // Generate access and refresh tokens
    const accessToken = tokenService.generateAccessToken(userId, role);

    const refreshToken = tokenService.generateRefreshToken(userId, role);

    // Add the refresh token to the user's record
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error during social auth:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  signUp,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  logoutAll,
  changePassword,
  socialAuth,
};
