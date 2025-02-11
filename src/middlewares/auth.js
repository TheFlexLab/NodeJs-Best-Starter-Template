const { verifyAccessToken } = require("../services/tokenService");
const User = require("../models/userModel"); // Import your User model

// Middleware to check JWT and extract user data
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader || req.body.token) {
    const token = authHeader?.split(" ")[1] ?? req?.body?.token;

    try {
      const decoded = verifyAccessToken(token);

      // Fetch user from database to verify the role
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      req.user = { userId: decoded.userId, role: user.role }; // Attach userId and role to req.user
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token",
      });
    }
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Token is required",
    });
  }
};

// Middleware to check if the user has one of the allowed roles
const authorizeRoles = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: User role "${req.user.role}" is not authorized to access this resource`,
    });
  }
  next();
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
};
