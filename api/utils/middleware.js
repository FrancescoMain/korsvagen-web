/**
 * Enhanced Security Middleware
 * Comprehensive security configuration for the API
 */

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import { generalRateLimit } from "./rateLimiter.js";

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || [
    "http://localhost:3000",
    "https://korsvagen.vercel.app",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["X-CSRF-Token"],
};

// Enhanced security headers configuration
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:"],
      mediaSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests:
        process.env.NODE_ENV === "production" ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Allows external media
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: "deny" },
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
};

// Session configuration
const sessionOptions = {
  secret:
    process.env.SESSION_SECRET || "fallback-session-secret-for-development",
  name: "korsvagen-session",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: "strict",
  },
};

// Logging configuration
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";

// Security middleware chain
export const securityMiddleware = [
  helmet(helmetOptions),
  cors(corsOptions),
  cookieParser(),
  session(sessionOptions),
  morgan(morganFormat),
  generalRateLimit,
];

// Individual middleware exports for selective use
export const corsMiddleware = cors(corsOptions);
export const helmetMiddleware = helmet(helmetOptions);
export const morganMiddleware = morgan(morganFormat);
export const cookieMiddleware = cookieParser();
export const sessionMiddleware = session(sessionOptions);

// Legacy exports for compatibility
export {
  corsMiddleware as cors,
  helmetMiddleware as helmet,
  morganMiddleware as morgan,
};
