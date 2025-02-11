const cors = require("cors");
const { BACKEND_URL } = require("./env");

const corsConfig = () => {
  return cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = process.env.FRONTEND_URL.split(",").map((url) => {
        const domain = url.replace(/^https?:\/\//, "");
        return new RegExp(`^https?://([a-z0-9-]+\\.)?${domain}$`);
      });

      const additionalOrigins = [
        "http://localhost:5000",
        "http://localhost:3000",
        "http://127.0.0.1:5000",
        BACKEND_URL,
      ];

      if (
        allowedOrigins.some(
          (regex) => regex.test(origin) || additionalOrigins.includes(origin)
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  });
};

module.exports = corsConfig;
