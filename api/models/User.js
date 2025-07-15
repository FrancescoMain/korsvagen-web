/**
 * User Model
 * Handles user management operations for admin access
 */

import { getSupabase, executeQuery } from "../utils/database.js";
import { hashPassword, comparePassword } from "../utils/password.js";
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
   * Find user by email with password (for authentication)
   */
  static async findByEmailWithPassword(email) {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("users")
        .select(
          "id, email, name, role, is_active, password_hash, failed_login_attempts, locked_until, last_login"
        )
        .eq("email", email.toLowerCase())
        .single();
    });
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticate(email, password) {
    try {
      const result = await User.findByEmailWithPassword(email);
      if (!result.success || !result.data) {
        throw new Error("Invalid credentials");
      }

      const user = result.data;

      // Check if user is active
      if (!user.is_active) {
        throw new Error("Account is inactive");
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const lockDuration = Math.ceil(
          (new Date(user.locked_until) - new Date()) / 60000
        );
        throw new Error(`Account is locked for ${lockDuration} more minutes`);
      }

      // Verify password
      const isPasswordValid = await comparePassword(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        // Increment failed login attempts
        await User.incrementFailedAttempts(user.id);
        throw new Error("Invalid credentials");
      }

      // Reset failed attempts and update last login
      await User.resetFailedAttempts(user.id);
      await User.updateLastLogin(user.id);

      // Return user without sensitive data
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        lastLogin: user.last_login,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(id, newPassword) {
    return executeQuery(async (supabase) => {
      const hashedPassword = await hashPassword(newPassword);

      return await supabase
        .from("users")
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
    });
  }

  /**
   * Increment failed login attempts
   */
  static async incrementFailedAttempts(id) {
    return executeQuery(async (supabase) => {
      const { data: user } = await supabase
        .from("users")
        .select("failed_login_attempts")
        .eq("id", id)
        .single();

      const attempts = (user?.failed_login_attempts || 0) + 1;
      const maxAttempts = 5;
      const lockDuration = 30 * 60 * 1000; // 30 minutes

      const updateData = {
        failed_login_attempts: attempts,
        updated_at: new Date().toISOString(),
      };

      // Lock account after max attempts
      if (attempts >= maxAttempts) {
        updateData.locked_until = new Date(
          Date.now() + lockDuration
        ).toISOString();
      }

      return await supabase.from("users").update(updateData).eq("id", id);
    });
  }

  /**
   * Reset failed login attempts
   */
  static async resetFailedAttempts(id) {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("users")
        .update({
          failed_login_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    });
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id) {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("users")
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    });
  }

  /**
   * Create user with hashed password
   */
  static async createWithPassword(userData) {
    return executeQuery(async (supabase) => {
      const hashedPassword = await hashPassword(userData.password);

      const data = {
        email: userData.email.toLowerCase(),
        name: userData.name,
        password_hash: hashedPassword,
        role: userData.role || "admin",
        is_active: userData.isActive !== undefined ? userData.isActive : true,
        failed_login_attempts: 0,
        updated_at: new Date().toISOString(),
      };

      return await supabase
        .from("users")
        .insert(data)
        .select("id, email, name, role, is_active, created_at, updated_at")
        .single();
    });
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
