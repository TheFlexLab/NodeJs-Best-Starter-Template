const ContactUs = require("../models/contactUs");
const { sendEmailMessage } = require("../services/sendEmail");
const { AWS_SES_SENDER } = require("../config/env");
const { AWS_SES_RECEIVERS } = require("../config/env");

const handleContactUs = async (req, res) => {
  try {
    const { contactPersonName, email, phone, message } = req.body;

    // Validation for common fields
    if (!contactPersonName || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: type, contactPersonName, or email.",
      });
    }
    // Create a new entry
    const contactEntry = new ContactUs({
      contactPersonName,
      email,
      phone,
      message,
    });

    // Save the entry to the database
    await contactEntry.save();

    // Prepare email content
    const emailSubject = `Someone Wants to Get in Touch!`;
    const emailBody = `
         <p>Hello Admin,</p>
         <p>Someone Wants to Get in Touch!:</p>
         <ul>
           <li>Contact Person: ${contactPersonName}</li>
           <li>Email: ${email}</li>
           <li>Phone: ${phone}</li>
           <li>Message: ${message || "No message provided"}</li>
         </ul>
         <p>Best regards,</p>
         <p>Team XYZ</p>
       `;

    // Send email to the  owner
    await sendEmailMessage(
      emailSubject,
      emailBody,
      AWS_SES_SENDER, // Sender email
      AWS_SES_RECEIVERS // Replace with the owner's email
    );

    res.status(201).json({ success: true, data: contactEntry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { handleContactUs };
