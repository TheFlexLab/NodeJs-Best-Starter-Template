const dotenv = require("dotenv");
const connectDB = require("./config/db");
const server = require("./server/server");
const { cronInitialize } = require("./services/cron");

// Load environment variables
dotenv.config();

// Server configuration
const PORT = process.env.PORT || 5000;

// Start the server only after the database connection is successful
const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log("Database connected successfully.");

    // Cron Initialize
    cronInitialize();

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with a failure code
  }
};

// Invoke the startServer function
startServer();
