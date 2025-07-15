/**
 * Change Password API Endpoint
 * POST /api/auth/change-password
 * Handles secure password changes for authenticated users
 */

import { authenticateToken } from "../utils/auth.js";
import { User } from "../models/User.js";
import { comparePassword } from "../utils/password.js";
import { validateChangePassword, sanitizeInput } from "../utils/validation.js";
import { authRateLimit } from "../utils/rateLimiter.js";
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
    // Apply rate limiting
    await new Promise((resolve, reject) => {
      authRateLimit(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Apply authentication middleware
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Validate CSRF token
    const csrfToken = req.headers["x-csrf-token"] || req.body.csrfToken;
    const sessionCSRF = req.cookies?.csrfToken;

    if (
      !csrfToken ||
      !sessionCSRF ||
      !validateCSRFToken(csrfToken, sessionCSRF)
    ) {
      return res.status(403).json({
        success: false,
        error: "CSRF Token Required",
        message: "Valid CSRF token is required for password changes",
        code: "INVALID_CSRF",
      });
    }

    // Apply input sanitization and validation
    await new Promise((resolve, reject) => {
      sanitizeInput(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Validate input
    for (const validation of validateChangePassword) {
      await new Promise((resolve, reject) => {
        validation(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password hash
    const userResult = await User.findByEmailWithPassword(req.user.email);

    if (!userResult.success || !userResult.data) {
      return res.status(404).json({
        success: false,
        error: "User Not Found",
        message: "User account not found",
        code: "USER_NOT_FOUND",
      });
    }

    const user = userResult.data;

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password_hash
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid Current Password",
        message: "Current password is incorrect",
        code: "INVALID_CURRENT_PASSWORD",
      });
    }

    // Check if new password is different from current
    const isSamePassword = await comparePassword(
      newPassword,
      user.password_hash
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: "Same Password",
        message: "New password must be different from current password",
        code: "SAME_PASSWORD",
      });
    }

    // Update password
    const updateResult = await User.updatePassword(user.id, newPassword);

    if (!updateResult.success) {
      throw new Error("Failed to update password");
    }

    // Log password change
    console.log(
      `Password changed for user: ${user.email} at ${new Date().toISOString()}`
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: {
        passwordChanged: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Change password error:", error);

    const isDevelopment = process.env.NODE_ENV === "development";

    return res.status(500).json({
      success: false,
      error: "Password Change Error",
      message: isDevelopment
        ? error.message
        : "An error occurred while changing password",
      ...(isDevelopment && { stack: error.stack }),
    });
  }
}
