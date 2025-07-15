/**
 * Security Utilities
 * General security functions and CSRF protection
 */

import crypto from "crypto";

/**
 * Generate secure random string
 */
export const generateSecureRandom = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token, sessionToken) => {
  return token && sessionToken && token === sessionToken;
};

/**
 * Generate secure session ID
 */
export const generateSessionId = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash string with SHA-256
 */
export const hashString = (input) => {
  return crypto.createHash("sha256").update(input).digest("hex");
};

/**
 * Create HMAC signature
 */
export const createHMAC = (data, secret) => {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
};

/**
 * Verify HMAC signature
 */
export const verifyHMAC = (data, signature, secret) => {
  const expectedSignature = createHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
};

/**
 * Sanitize error messages for production
 */
export const sanitizeError = (error, isDevelopment = false) => {
  if (isDevelopment) {
    return error.message;
  }

  // Generic error messages for production
  const secureMessages = {
    "Invalid password": "Invalid credentials",
    "User not found": "Invalid credentials",
    "Token expired": "Session expired",
    "Invalid token": "Invalid session",
    "Access denied": "Access denied",
  };

  return secureMessages[error.message] || "An error occurred";
};

/**
 * Rate limiting store (in-memory for simplicity)
 * In production, use Redis or similar persistent store
 */
class RateLimitStore {
  constructor() {
    this.attempts = new Map();
    this.blockedIPs = new Map();
  }

  /**
   * Record failed attempt
   */
  recordFailedAttempt(ip, identifier = null) {
    const key = identifier || ip;
    const now = Date.now();

    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }

    const attempts = this.attempts.get(key);
    attempts.push(now);

    // Keep only attempts from last 15 minutes
    const fifteenMinutesAgo = now - 15 * 60 * 1000;
    this.attempts.set(
      key,
      attempts.filter((time) => time > fifteenMinutesAgo)
    );
  }

  /**
   * Get failed attempts count
   */
  getFailedAttempts(ip, identifier = null) {
    const key = identifier || ip;
    const attempts = this.attempts.get(key) || [];
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

    return attempts.filter((time) => time > fifteenMinutesAgo).length;
  }

  /**
   * Block IP temporarily
   */
  blockIP(ip, durationMs = 60 * 60 * 1000) {
    // 1 hour default
    this.blockedIPs.set(ip, Date.now() + durationMs);
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ip) {
    const blockUntil = this.blockedIPs.get(ip);
    if (!blockUntil) return false;

    if (Date.now() > blockUntil) {
      this.blockedIPs.delete(ip);
      return false;
    }

    return true;
  }

  /**
   * Clear attempts for identifier
   */
  clearAttempts(ip, identifier = null) {
    const key = identifier || ip;
    this.attempts.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;

    // Cleanup attempts
    for (const [key, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter((time) => time > fifteenMinutesAgo);
      if (validAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, validAttempts);
      }
    }

    // Cleanup blocked IPs
    for (const [ip, blockUntil] of this.blockedIPs.entries()) {
      if (now > blockUntil) {
        this.blockedIPs.delete(ip);
      }
    }
  }
}

export const rateLimitStore = new RateLimitStore();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  rateLimitStore.cleanup();
}, 5 * 60 * 1000);
