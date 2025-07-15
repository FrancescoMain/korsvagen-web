/**
 * User Profile API Endpoint
 * GET /api/auth/me
 * Returns current authenticated user information
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

    // Get fresh user data from database
    const userResult = await User.findById(req.user.id);

    if (!userResult.success || !userResult.data) {
      return res.status(404).json({
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

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.is_active,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    const isDevelopment = process.env.NODE_ENV === "development";

    return res.status(500).json({
      success: false,
      error: "Profile Retrieval Error",
      message: isDevelopment
        ? error.message
        : "An error occurred while retrieving user profile",
      ...(isDevelopment && { stack: error.stack }),
    });
  }
}
