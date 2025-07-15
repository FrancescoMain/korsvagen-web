/**
 * Token Verification API Endpoint
 * GET /api/auth/verify
 * Verifies JWT token validity and returns user info
 */

import { authenticateToken } from "../utils/auth.js";
import { User } from "../models/User.js";

export default async function handler(req, res) {
  // Only allow GET method
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed",
      message: "Only GET method is allowed for this endpoint",
    });
  }

  try {
    // Apply authentication middleware
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get fresh user data from database to ensure account is still active
    const userResult = await User.findById(req.user.id);

    if (!userResult.success || !userResult.data) {
      return res.status(401).json({
        success: false,
        error: "User Not Found",
        message: "User account not found",
        code: "USER_NOT_FOUND",
      });
    }

    const user = userResult.data;

    // Check if user is still active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: "Account Inactive",
        message: "User account has been deactivated",
        code: "ACCOUNT_INACTIVE",
      });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({
        success: false,
        error: "Account Locked",
        message: "User account is temporarily locked",
        code: "ACCOUNT_LOCKED",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
      data: {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.is_active,
          lastLogin: user.last_login,
        },
        tokenInfo: {
          issuedAt: req.user.iat
            ? new Date(req.user.iat * 1000).toISOString()
            : null,
          expiresAt: req.user.exp
            ? new Date(req.user.exp * 1000).toISOString()
            : null,
        },
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);

    // Handle specific authentication errors
    if (error.message === "Token expired") {
      return res.status(401).json({
        success: false,
        error: "Token Expired",
        message: "Authentication token has expired",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.message === "Invalid token" || error.message.includes("token")) {
      return res.status(401).json({
        success: false,
        error: "Invalid Token",
        message: "Authentication token is invalid",
        code: "INVALID_TOKEN",
      });
    }

    const isDevelopment = process.env.NODE_ENV === "development";

    return res.status(500).json({
      success: false,
      error: "Verification Error",
      message: isDevelopment
        ? error.message
        : "An error occurred during token verification",
      ...(isDevelopment && { stack: error.stack }),
    });
  }
}
