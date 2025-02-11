const multer = require("multer");

// Define memory storage for uploaded files (store in buffer)
const storage = multer.memoryStorage(); // Store files in memory as buffer

// Filter for file types (optional)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("application/pdf")
  ) {
    cb(null, true); // Accept images and PDFs
  } else {
    cb(new Error("File type not supported"), false); // Reject other file types
  }
};

/**
 * Dynamically create multer middleware for given fields
 * @param {Array} fields - Array of field names, e.g., ["logo", "cover"]
 * @returns {Function} - Multer middleware for handling file uploads
 */
const uploadFiles = (fields) => {
  if (!Array.isArray(fields)) {
    throw new Error("Fields must be an array of strings");
  }

  const formattedFields = fields.map((field) => ({
    name: field,
    maxCount: 1, // Adjust `maxCount` as needed for each field
  }));

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5, // Limit file size to 5MB (adjust as needed)
    },
  }).fields(formattedFields);
};

module.exports = { uploadFiles };
