const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");
const customCss = fs.readFileSync(
  path.join(__dirname, "swagger-dark.css"),
  "utf8"
);
const basicAuth = require("express-basic-auth");
const { BACKEND_URL } = require("../env");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend API",
      version: "1.0.0",
      description: "API documentation for the Backend application",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
      {
        url: BACKEND_URL,
        description: "Dynamic Environment Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["src/routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);
const swaggerDocs = (server) => {
  server.use(
    "/api-docs",
    basicAuth({
      users: { template: "template123" },
      challenge: true,
    }),
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec, {
      customCss, // Include the custom dark mode CSS here
    })
  );
};
module.exports = swaggerDocs;
