/**
 * JWT Utilities
 * Handles JWT token generation, validation, and refresh mechanism
 */

import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-key-for-development";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Token blacklist for logout functionality
const tokenBlacklist = new Set();

/**
 * Generate access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "korsvagen-api",
    audience: "korsvagen-cms",
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: "korsvagen-api",
    audience: "korsvagen-cms",
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error("Token has been revoked");
    }

    return jwt.verify(token, JWT_SECRET, {
      issuer: "korsvagen-api",
      audience: "korsvagen-cms",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw error;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error("Refresh token has been revoked");
    }

    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: "korsvagen-api",
      audience: "korsvagen-cms",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
};

/**
 * Generate token pair (access + refresh)
 */
export const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
    tokenType: "Bearer",
  };
};

/**
 * Blacklist token (for logout)
 */
export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * Get token payload without verification (for blacklisting)
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};
