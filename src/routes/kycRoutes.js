const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kycController");
const { uploadFiles } = require("../services/uploadFiles");
const { authenticateJWT, authorizeRoles } = require("../middlewares/auth");
// const { upload } = require("../middleware/multerConfig"); // file not exists

/**
 * @swagger
 * tags:
 *   name: KYC
 *   description: KYC management APIs
 */

/**
 * @swagger
 * /api/kyc/submit:
 *   post:
 *     summary: Submit KYC details
 *     tags: [KYC]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *               - selfie
 *               - name
 *               - dateOfBirth
 *               - address
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Identity document file
 *               selfie:
 *                 type: string
 *                 format: binary
 *                 description: Selfie image file
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *               dateOfBirth:
 *                 type: string
 *                 format: date-time
 *                 description: Date of birth of the user in ISO 8601 format
 *               address:
 *                 type: string
 *                 description: Residential address of the user
 *     responses:
 *       200:
 *         description: KYC submission successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: KYC submission successful.
 *       400:
 *         description: Validation or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Identity Document is required.
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */
router.post(
  "/submit",
  authenticateJWT,
  authorizeRoles(["user"]),
  uploadFiles(["document", "selfie"]),
  kycController.completeKycSubmission
);

/**
 * @swagger
 * /kyc/{id}/review:
 *   patch:
 *     summary: Review KYC status (Approve or Reject)
 *     tags: [KYC]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Approved, Rejected]
 *     responses:
 *       200:
 *         description: KYC status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:id/review",
  authenticateJWT,
  authorizeRoles(["admin"]),
  kycController.reviewKycStatus
);

module.exports = router;
