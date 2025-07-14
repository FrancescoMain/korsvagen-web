const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Security headers configuration
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
};

// Logging configuration
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";

module.exports = {
  cors: cors(corsOptions),
  helmet: helmet(helmetOptions),
  morgan: morgan(morganFormat),
};
