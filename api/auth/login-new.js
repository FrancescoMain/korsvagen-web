/**
 * Enhanced Login API Endpoint
 * POST /api/auth/login
 * Handles user authentication with security features
 */

import { User } from "../models/User.js";
import { generateTokenPair } from "../utils/jwt.js";
import {
  authRateLimit,
  progressiveRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
} from "../utils/rateLimiter.js";
import { validateLogin, sanitizeInput } from "../utils/validation.js";
import { generateCSRFToken } from "../utils/security.js";

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
      authRateLimit(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Apply progressive rate limiting
    await new Promise((resolve, reject) => {
      progressiveRateLimit(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Apply input sanitization and validation
    await new Promise((resolve, reject) => {
      sanitizeInput(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Validate input
    for (const validation of validateLogin) {
      await new Promise((resolve, reject) => {
        validation(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      recordFailedAttempt(req, email);
      return res.status(400).json({
        success: false,
        error: "Missing Credentials",
        message: "Email and password are required",
        code: "MISSING_CREDENTIALS",
      });
    }

    // Authenticate user
    let user;
    try {
      user = await User.authenticate(email, password);
    } catch (authError) {
      recordFailedAttempt(req, email);

      return res.status(401).json({
        success: false,
        error: "Authentication Failed",
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Clear failed attempts on successful authentication
    clearFailedAttempts(req, email);

    // Generate JWT token pair
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(tokenPayload);

    // Generate CSRF token
    const csrfToken = generateCSRFToken();

    // Set secure HTTP-only cookie for refresh token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/auth",
    };

    res.setHeader("Set-Cookie", [
      `refreshToken=${tokens.refreshToken}; ${Object.entries(cookieOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
      `csrfToken=${csrfToken}; ${Object.entries({
        ...cookieOptions,
        httpOnly: false, // CSRF token needs to be accessible to client
      })
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`,
    ]);

    // Log successful login
    console.log(
      `Successful login for user: ${user.email} at ${new Date().toISOString()}`
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
        tokenType: tokens.tokenType,
        csrfToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === "development";

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: isDevelopment ? error.message : "An unexpected error occurred",
      ...(isDevelopment && { stack: error.stack }),
    });
  }
}
