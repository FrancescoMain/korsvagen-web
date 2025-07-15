/**
 * Authentication Migration
 * Adds password and security fields to users table
 */

import { getSupabase } from "../utils/database.js";

export const authenticationMigration = {
  version: "004_authentication_fields",

  async up() {
    const supabase = getSupabase();

    console.log("Running authentication migration...");

    try {
      // Add authentication fields to users table
      const { error: alterError } = await supabase.rpc("exec_sql", {
        sql: `
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS password_hash TEXT,
          ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
          ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
          ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
          ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE;
        `,
      });

      if (alterError) {
        throw alterError;
      }

      // Create index for email lookups
      const { error: indexError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token);
        `,
      });

      if (indexError) {
        throw indexError;
      }

      // Create admin user if it doesn't exist
      const { data: existingAdmin } = await supabase
        .from("users")
        .select("id")
        .eq("email", "admin@korsvagen.com")
        .single();

      if (!existingAdmin) {
        // Import password hashing function
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash("admin123", 12);

        const { error: insertError } = await supabase.from("users").insert({
          email: "admin@korsvagen.com",
          name: "Administrator",
          role: "admin",
          is_active: true,
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          throw insertError;
        }

        console.log(
          "Default admin user created: admin@korsvagen.com / admin123"
        );
      }

      // Create audit log table for authentication events
      const { error: auditError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS auth_audit_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            event_type VARCHAR(50) NOT NULL,
            ip_address INET,
            user_agent TEXT,
            success BOOLEAN DEFAULT false,
            details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON auth_audit_log(user_id);
          CREATE INDEX IF NOT EXISTS idx_auth_audit_event_type ON auth_audit_log(event_type);
          CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON auth_audit_log(created_at);
        `,
      });

      if (auditError) {
        throw auditError;
      }

      console.log("✅ Authentication migration completed successfully");

      return {
        success: true,
        message: "Authentication fields added to users table",
        changes: [
          "Added password_hash field",
          "Added failed_login_attempts field",
          "Added locked_until field",
          "Added last_login field",
          "Added password_reset_token field",
          "Added password_reset_expires field",
          "Created email and reset token indexes",
          "Created default admin user",
          "Created auth_audit_log table",
        ],
      };
    } catch (error) {
      console.error("❌ Authentication migration failed:", error);
      throw error;
    }
  },

  async down() {
    const supabase = getSupabase();

    console.log("Rolling back authentication migration...");

    try {
      // Remove authentication fields
      const { error: alterError } = await supabase.rpc("exec_sql", {
        sql: `
          ALTER TABLE users 
          DROP COLUMN IF EXISTS password_hash,
          DROP COLUMN IF EXISTS failed_login_attempts,
          DROP COLUMN IF EXISTS locked_until,
          DROP COLUMN IF EXISTS last_login,
          DROP COLUMN IF EXISTS password_reset_token,
          DROP COLUMN IF EXISTS password_reset_expires;
        `,
      });

      if (alterError) {
        throw alterError;
      }

      // Drop audit log table
      const { error: dropError } = await supabase.rpc("exec_sql", {
        sql: "DROP TABLE IF EXISTS auth_audit_log;",
      });

      if (dropError) {
        throw dropError;
      }

      console.log("✅ Authentication migration rollback completed");

      return {
        success: true,
        message: "Authentication fields removed from users table",
      };
    } catch (error) {
      console.error("❌ Authentication migration rollback failed:", error);
      throw error;
    }
  },
};

// Export for use in migrations.js
export default authenticationMigration;
