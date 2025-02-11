const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// Generate Access Token
const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "5m", // 5m for 15 minutes expiration time
  });
};

// Generate Refresh Token
const generateRefreshToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", // 7 days expiration time
  });
};

// Verify Access Token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

// Find user or create one, then generate tokens
const findOrCreateUserAndGenerateTokens = async (
  email,
  role = "user",
  socialData
) => {
  try {
    // Check if user exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new one
      user = await User.create({
        email,
        password: await bcrypt.hash("", 10), // Or handle password based on your requirement (e.g., for social logins)
        role,
        emailVerified: true, // Assuming email verification is handled for social logins
        status: "Active",
        socialData: [{ type: "google", data: socialData }] || [], // Initialize socialData if provided
      });
    } else {
      // If user exists, check if socialData is provided and push it to the user's socialData array
      if (socialData && Array.isArray(socialData)) {
        // Assuming socialData is an array of objects, you can push it to the array
        user.socialData.push({ type: "google", data: socialData });
      }
    }

    // Generate Access and Refresh tokens
    const accessToken = generateAccessToken(user._id, user.role);

    await user.save(); // Save the updated user document

    // Return the tokens
    return accessToken;
  } catch (error) {
    console.error("Error in findOrCreateUserAndGenerateTokens:", error.message);
    throw new Error("Failed to process user.");
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  findOrCreateUserAndGenerateTokens,
};
