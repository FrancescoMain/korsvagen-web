/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and abuse
 */

import rateLimit from "express-rate-limit";
import { rateLimitStore } from "../utils/security.js";

/**
 * Get client IP address
 */
const getClientIP = (req) => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "127.0.0.1"
  );
};

/**
 * General API rate limiter
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too Many Requests",
    message: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP,
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    error: "Too Many Login Attempts",
    message: "Too many login attempts from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIP,
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    const ip = getClientIP(req);
    console.warn(`Rate limit exceeded for IP: ${ip}`);

    res.status(429).json({
      success: false,
      error: "Too Many Login Attempts",
      message: "Too many login attempts. Please try again later.",
      retryAfter: "15 minutes",
      code: "RATE_LIMIT_EXCEEDED",
    });
  },
});

/**
 * Progressive rate limiter for failed login attempts
 * Tracks failed attempts per email/IP combination
 */
export const progressiveRateLimit = (req, res, next) => {
  const ip = getClientIP(req);
  const email = req.body?.email;

  // Check if IP is blocked
  if (rateLimitStore.isIPBlocked(ip)) {
    return res.status(429).json({
      success: false,
      error: "IP Blocked",
      message:
        "Your IP has been temporarily blocked due to suspicious activity.",
      code: "IP_BLOCKED",
    });
  }

  // Check failed attempts for this IP
  const ipAttempts = rateLimitStore.getFailedAttempts(ip);
  const emailAttempts = email ? rateLimitStore.getFailedAttempts(ip, email) : 0;

  // Block after 10 failed attempts from same IP
  if (ipAttempts >= 10) {
    rateLimitStore.blockIP(ip, 60 * 60 * 1000); // Block for 1 hour
    return res.status(429).json({
      success: false,
      error: "Too Many Failed Attempts",
      message:
        "Your IP has been blocked due to too many failed login attempts.",
      code: "IP_BLOCKED_ATTEMPTS",
    });
  }

  // Progressive delays for email-specific attempts
  if (email && emailAttempts >= 3) {
    const delay = Math.min(emailAttempts * 2000, 30000); // Max 30 seconds

    return setTimeout(() => {
      res.status(429).json({
        success: false,
        error: "Account Temporarily Locked",
        message: `Too many failed attempts for this account. Try again in ${
          delay / 1000
        } seconds.`,
        code: "ACCOUNT_LOCKED",
        retryAfter: delay,
      });
    }, delay);
  }

  next();
};

/**
 * Record failed login attempt
 */
export const recordFailedAttempt = (req, email = null) => {
  const ip = getClientIP(req);
  rateLimitStore.recordFailedAttempt(ip, email);
};

/**
 * Clear failed attempts (on successful login)
 */
export const clearFailedAttempts = (req, email = null) => {
  const ip = getClientIP(req);
  rateLimitStore.clearAttempts(ip, email);
};

/**
 * Password reset rate limiter
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    error: "Too Many Password Reset Requests",
    message:
      "Too many password reset requests from this IP, please try again later.",
    retryAfter: "1 hour",
  },
  keyGenerator: getClientIP,
});

/**
 * File upload rate limiter
 */
export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 uploads per 15 minutes
  message: {
    success: false,
    error: "Upload Rate Limit Exceeded",
    message: "Too many file uploads, please try again later.",
  },
  keyGenerator: getClientIP,
});
