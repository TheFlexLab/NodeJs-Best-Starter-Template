const express = require("express");
const {
  signUp,
  verifyOtp,
  login,
  resendOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  logoutAll,
  changePassword,
  socialAuth,
} = require("../controllers/authController");
const {
  validateSignUp,
  validateLogin,
} = require("../validators/authValidator");
const { authenticateJWT } = require("../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints (Sign Up, Login, OTP verification)
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     description: Creates a new user and sends an OTP for email verification.
 *     tags: [Auth]
 *     requestBody:
 *       description: User's email and password to create an account
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: securepassword123
 *     responses:
 *       201:
 *         description: User registered successfully. OTP sent for email verification.
 *       400:
 *         description: User already exists.
 *       500:
 *         description: Internal server error.
 */
router.post("/signup", validateSignUp, signUp);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for user registration or login
 *     description: Verifies the OTP sent to the user's email to complete registration or login.
 *     tags: [Auth]
 *     requestBody:
 *       description: Email and OTP for verification
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       400:
 *         description: Invalid or expired OTP.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/verify-otp", verifyOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP for email verification
 *     description: Sends a new OTP to the user's email if the original OTP expired or is invalid.
 *     tags: [Auth]
 *     requestBody:
 *       description: Email address for OTP resend
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: A new OTP has been sent to the user's email.
 *       400:
 *         description: Email is already verified, no OTP sent.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/resend-otp", resendOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user using email and password. Sends OTP for 'admin' or 'vendor' roles.
 *     tags: [Auth]
 *     requestBody:
 *       description: User's email and password for login
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Login successful. OTP sent for 'admin' or 'vendor' roles if applicable.
 *       400:
 *         description: Invalid credentials or email not verified.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/login", validateLogin, login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send a password reset link
 *     description: Sends a password reset link to the user's email address.
 *     tags: [Auth]
 *     requestBody:
 *       description: Email address for password reset
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset the user's password
 *     description: Resets the user's password using the reset token.
 *     tags: [Auth]
 *     requestBody:
 *       description: Reset token and new password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: resetToken12345
 *               newPassword:
 *                 type: string
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       404:
 *         description: User not found or invalid reset token.
 *       500:
 *         description: Internal server error.
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh the user's access token
 *     description: Generates a new access token using a valid refresh token.
 *     tags: [Auth]
 *     requestBody:
 *       description: Refresh token required to generate a new access token
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: refreshToken12345
 *     responses:
 *       200:
 *         description: New access token generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: New access token generated
 *                 accessToken:
 *                   type: string
 *                   example: newAccessToken12345
 *       401:
 *         description: Refresh token is required.
 *       403:
 *         description: Invalid or expired refresh token.
 *       500:
 *         description: Internal server error.
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the user
 *     description: Logs the user out by clearing their refresh token.
 *     tags: [Auth]
 *     requestBody:
 *       description: User ID required to clear the refresh token
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: userId12345
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/logout", authenticateJWT, logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User's ID
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out from all devices successfully
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/logout-all", authenticateJWT, logoutAll);

/**
 * @swagger
 * /api/auth/changePassword:
 *   post:
 *     summary: Change the password of a logged-in user.
 *     description: Allows a logged-in user to change their password by providing their old password and a new password.
 *     tags:
 *       - [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The current password of the user.
 *               newPassword:
 *                 type: string
 *                 description: The new password the user wants to set.
 *             example:
 *               oldPassword: "currentPassword123"
 *               newPassword: "newPassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Old password is incorrect.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Old password is incorrect"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Error details here"
 */
router.post("/changePassword", authenticateJWT, changePassword);

/**
 * @swagger
 * /api/auth/socialAuth:
 *   post:
 *     summary: Authenticate a user via a social token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Social authentication token.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR..."
 *     responses:
 *       200:
 *         description: User authenticated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       401:
 *         description: Unauthorized or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired token."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post(
  "/socialAuth",
  authenticateJWT,
  socialAuth
);

module.exports = router;
