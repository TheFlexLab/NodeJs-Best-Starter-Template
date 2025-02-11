const mongoose = require("mongoose");
require("colors");
// MongoDB connection setup
const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `MongoDB Connected: ${db.connection.host}`.cyan.underline.bold
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
