const express = require("express");
const router = express.Router();
const { handleContactUs } = require("../controllers/contactUsController");

/**
 * @swagger
 * /api/contact-us:
 *   post:
 *     summary: Handle "Contact Us" queries conditionally based on type
 *     tags: [Contact Us]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [casino, general]
 *                 example: casino
 *               casinoName:
 *                 type: string
 *                 example: Awesome Casino
 *               contactPersonName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               country:
 *                 type: string
 *                 example: USA
 *               phone:
 *                 type: string
 *                 example: 123-456-7890
 *               message:
 *                 type: string
 *                 example: I am interested in a partnership.
 *     responses:
 *       201:
 *         description: Contact query saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example:
 *                     type: "casino"
 *                     casinoName: "Awesome Casino"
 *                     contactPersonName: "John Doe"
 *                     email: "johndoe@example.com"
 *                     country: "USA"
 *                     phone: "123-456-7890"
 *                     message: "I am interested in a partnership."
 *                     createdAt: "2024-12-20T00:00:00Z"
 *       400:
 *         description: Missing or invalid fields
 *       500:
 *         description: Internal server error
 */
router.post(
    "/",
    handleContactUs);

module.exports = router;
