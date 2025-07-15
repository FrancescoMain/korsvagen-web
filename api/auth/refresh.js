/**
 * Refresh Token API Endpoint
 * POST /api/auth/refresh
 * Handles JWT token refresh mechanism
 */

import {
  verifyRefreshToken,
  generateAccessToken,
  blacklistToken,
} from "../utils/jwt.js";
import { User } from "../models/User.js";
import { validateRefreshToken, sanitizeInput } from "../utils/validation.js";
import { generalRateLimit } from "../utils/rateLimiter.js";

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed",
      message: "Only POST method is allowed for this endpoint",
    });
  }

  try {
    // Apply rate limiting
    await new Promise((resolve, reject) => {
      generalRateLimit(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Apply input sanitization
    await new Promise((resolve, reject) => {
      sanitizeInput(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: "No Refresh Token",
        message: "Refresh token is required",
        code: "NO_REFRESH_TOKEN",
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      // Clear invalid refresh token cookie
      res.setHeader("Set-Cookie", [
        `refreshToken=; HttpOnly; Secure=${
          process.env.NODE_ENV === "production"
        }; SameSite=Strict; Path=/api/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      ]);

      return res.status(401).json({
        success: false,
        error: "Invalid Refresh Token",
        message: "Refresh token is invalid or expired",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Verify user still exists and is active
    const userResult = await User.findById(decoded.id);
    if (!userResult.success || !userResult.data || !userResult.data.is_active) {
      // Blacklist the refresh token
      blacklistToken(refreshToken);

      // Clear refresh token cookie
      res.setHeader("Set-Cookie", [
        `refreshToken=; HttpOnly; Secure=${
          process.env.NODE_ENV === "production"
        }; SameSite=Strict; Path=/api/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      ]);

      return res.status(401).json({
        success: false,
        error: "User Not Found",
        message: "User account not found or inactive",
        code: "USER_NOT_FOUND",
      });
    }

    const user = userResult.data;

    // Generate new access token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    // Log token refresh
    console.log(
      `Token refreshed for user: ${user.email} at ${new Date().toISOString()}`
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        tokenType: "Bearer",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    const isDevelopment = process.env.NODE_ENV === "development";

    return res.status(500).json({
      success: false,
      error: "Token Refresh Error",
      message: isDevelopment
        ? error.message
        : "An error occurred while refreshing token",
      ...(isDevelopment && { stack: error.stack }),
    });
  }
}
