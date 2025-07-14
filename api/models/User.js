/**
 * User Model
 * Handles user management operations for admin access
 */

import { getSupabase, executeQuery } from "../utils/database.js";
import jwt from "jsonwebtoken";

export class User {
  constructor(data = {}) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role || "admin";
    this.isActive =
      data.is_active !== undefined ? data.is_active : data.isActive;
    this.lastLogin = data.last_login || data.lastLogin;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  /**
   * Get all users
   */
  static async findAll(options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (options.activeOnly !== false) {
        query = query.eq("is_active", true);
      }

      if (options.role) {
        query = query.eq("role", options.role);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    });
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    return executeQuery(async (supabase) => {
      return await supabase.from("users").select("*").eq("id", id).single();
    });
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();
    });
  }

  /**
   * Create new user
   */
  static async create(userData) {
    return executeQuery(async (supabase) => {
      const data = {
        email: userData.email.toLowerCase(),
        name: userData.name,
        role: userData.role || "admin",
        is_active: userData.isActive !== undefined ? userData.isActive : true,
        updated_at: new Date().toISOString(),
      };

      return await supabase.from("users").insert(data).select().single();
    });
  }

  /**
   * Update user
   */
  static async update(id, updateData) {
    return executeQuery(async (supabase) => {
      const data = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      // Convert camelCase to snake_case for database
      if (data.isActive !== undefined) {
        data.is_active = data.isActive;
        delete data.isActive;
      }
      if (data.lastLogin) {
        data.last_login = data.lastLogin;
        delete data.lastLogin;
      }

      // Ensure email is lowercase
      if (data.email) {
        data.email = data.email.toLowerCase();
      }

      return await supabase
        .from("users")
        .update(data)
        .eq("id", id)
        .select()
        .single();
    });
  }

  /**
   * Delete user
   */
  static async delete(id) {
    return executeQuery(async (supabase) => {
      return await supabase.from("users").delete().eq("id", id);
    });
  }

  /**
   * Update last login
   */
  static async updateLastLogin(id) {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("users")
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
    });
  }

  /**
   * Toggle user active status
   */
  static async toggleActive(id) {
    return executeQuery(async (supabase) => {
      // First get current state
      const { data: user, error: getError } = await supabase
        .from("users")
        .select("is_active")
        .eq("id", id)
        .single();

      if (getError) throw getError;

      // Toggle the state
      return await supabase
        .from("users")
        .update({
          is_active: !user.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
    });
  }

  /**
   * Authenticate user (for mock authentication)
   */
  static async authenticate(email, password) {
    // In a real implementation, you would hash and compare passwords
    // For now, this is a mock implementation
    const mockUsers = [
      {
        id: "1",
        email: "admin@korsvagen.com",
        name: "Admin User",
        role: "admin",
        password: "admin123", // In production, this would be hashed
      },
    ];

    const user = mockUsers.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return {
        success: false,
        error: "Invalid credentials",
      };
    }

    // Create user in database if doesn't exist
    const existingUser = await this.findByEmail(email);
    let dbUser;

    if (!existingUser.success || !existingUser.data) {
      const createResult = await this.create({
        email: user.email,
        name: user.name,
        role: user.role,
      });

      if (!createResult.success) {
        return {
          success: false,
          error: "Failed to create user",
        };
      }

      dbUser = createResult.data;
    } else {
      dbUser = existingUser.data;
    }

    // Update last login
    await this.updateLastLogin(dbUser.id);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      },
      process.env.JWT_SECRET || "korsvagen-secret-key",
      { expiresIn: "24h" }
    );

    return {
      success: true,
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        },
        token,
      },
    };
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "korsvagen-secret-key"
      );

      // Get fresh user data
      const userResult = await this.findById(decoded.userId);

      if (
        !userResult.success ||
        !userResult.data ||
        !userResult.data.is_active
      ) {
        return {
          success: false,
          error: "User not found or inactive",
        };
      }

      return {
        success: true,
        data: {
          user: userResult.data,
          token: decoded,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Invalid token",
      };
    }
  }

  /**
   * Get user statistics
   */
  static async getStats() {
    return executeQuery(async (supabase) => {
      const { data: total, error: totalError } = await supabase
        .from("users")
        .select("count", { count: "exact", head: true });

      if (totalError) throw totalError;

      const { data: active, error: activeError } = await supabase
        .from("users")
        .select("count", { count: "exact", head: true })
        .eq("is_active", true);

      if (activeError) throw activeError;

      const { data: byRole, error: roleError } = await supabase
        .from("users")
        .select("role, count(*)")
        .group("role");

      if (roleError) throw roleError;

      return {
        data: {
          total: total || 0,
          active: active || 0,
          inactive: (total || 0) - (active || 0),
          byRole: byRole || [],
        },
      };
    });
  }

  /**
   * Search users
   */
  static async search(searchTerm, options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("users")
        .select("*")
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (options.activeOnly !== false) {
        query = query.eq("is_active", true);
      }

      if (options.role) {
        query = query.eq("role", options.role);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    });
  }
}
