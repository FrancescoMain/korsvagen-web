/**
 * Enhanced Logout API Endpoint
 * POST /api/auth/logout
 * Handles secure user logout with token blacklisting
 */

import { authenticateToken } from "../utils/auth.js";
import { blacklistToken, extractTokenFromHeader } from "../utils/jwt.js";
import { validateCSRFToken } from "../utils/security.js";

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
    // Apply authentication middleware
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Validate CSRF token if provided
    const csrfToken = req.headers["x-csrf-token"] || req.body.csrfToken;
    const sessionCSRF = req.cookies?.csrfToken;

    if (
      csrfToken &&
      sessionCSRF &&
      !validateCSRFToken(csrfToken, sessionCSRF)
    ) {
      return res.status(403).json({
        success: false,
        error: "CSRF Token Invalid",
        message: "Invalid CSRF token",
        code: "INVALID_CSRF",
      });
    }

    // Get tokens to blacklist
    const accessToken = req.token;
    const refreshToken = req.cookies?.refreshToken;

    // Blacklist both access and refresh tokens
    if (accessToken) {
      blacklistToken(accessToken);
    }

    if (refreshToken) {
      blacklistToken(refreshToken);
    }

    // Clear cookies
    const clearCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      expires: new Date(0),
    };

    res.setHeader("Set-Cookie", [
      `refreshToken=; ${Object.entries(clearCookieOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
      `csrfToken=; ${Object.entries({
        ...clearCookieOptions,
        httpOnly: false,
      })
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
    ]);

    // Log successful logout
    console.log(
      `Successful logout for user: ${
        req.user.email
      } at ${new Date().toISOString()}`
    );

    return res.status(200).json({
      success: true,
      message: "Logout successful",
      data: {
        loggedOut: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Logout error:", error);

    // Even if logout fails, clear cookies for security
    const clearCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      expires: new Date(0),
    };

    res.setHeader("Set-Cookie", [
      `refreshToken=; ${Object.entries(clearCookieOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
      `csrfToken=; ${Object.entries({
        ...clearCookieOptions,
        httpOnly: false,
      })
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
    ]);

    const isDevelopment = process.env.NODE_ENV === "development";

    return res.status(500).json({
      success: false,
      error: "Logout Error",
      message: isDevelopment
        ? error.message
        : "An error occurred during logout",
      ...(isDevelopment && { stack: error.stack }),
    });
  }
}
