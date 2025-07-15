/**
 * Enhanced Authentication Utilities
 * Handles authentication middleware and user validation
 */

import { verifyAccessToken, extractTokenFromHeader } from "./jwt.js";
import { User } from "../models/User.js";
import { sanitizeError } from "./security.js";

/**
 * Authentication middleware
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access Denied",
        message: "Authentication token required",
        code: "NO_TOKEN",
      });
    }

    const decoded = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Access Denied",
        message: "User account not found or inactive",
        code: "INVALID_USER",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    req.token = token;

    next();
  } catch (error) {
    const isDevelopment = process.env.NODE_ENV === "development";

    if (error.message === "Token expired") {
      return res.status(401).json({
        success: false,
        error: "Token Expired",
        message: "Authentication token has expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(403).json({
      success: false,
      error: "Invalid Token",
      message: sanitizeError(error, isDevelopment),
      code: "INVALID_TOKEN",
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
        code: "NO_AUTH",
      });
    }

    const userRole = req.user.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
};

/**
 * Admin role requirement
 */
export const requireAdmin = requireRole("admin");

/**
 * Editor or Admin role requirement
 */
export const requireEditor = requireRole(["admin", "editor"]);

/**
 * Optional authentication (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
        req.token = token;
      }
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
  }

  next();
};

/**
 * Mock authentication service for development
 * In production, this would integrate with the User model and database
 */
export const authService = {
  async validateUser(email, password) {
    // This would be replaced with actual database lookup
    const mockUser = {
      id: "1",
      email: "admin@korsvagen.com",
      name: "Administrator",
      role: "admin",
      isActive: true,
    };

    if (email === "admin@korsvagen.com" && password === "admin123") {
      return mockUser;
    }

    throw new Error("Invalid credentials");
  },

  async getUserById(id) {
    // This would be replaced with actual database lookup
    if (id === "1") {
      return {
        id: "1",
        email: "admin@korsvagen.com",
        name: "Administrator",
        role: "admin",
        isActive: true,
      };
    }

    throw new Error("User not found");
  },
};
