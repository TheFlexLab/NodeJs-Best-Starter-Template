const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const corsConfig = require("../config/cors");
const swaggerDocs = require("../config/swagger/index");
const routes = require("../router/router");
const passport = require("passport");
require("../services/passport");

// Load environment variables
dotenv.config();

// Initialize Express app
const server = express();

// Middleware
server.use(express.json());
server.use(cookieParser());
server.use(corsConfig());
server.use(passport.initialize());


// Routes
server.use("/api", routes);

// Swagger Documentation
swaggerDocs(server);

// Handle unhandled routes
server.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
server.use((err, req, res, next) => {
    console.error(err.stack);
    res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
});

module.exports = server;
