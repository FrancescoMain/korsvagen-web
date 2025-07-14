/**
 * Database Migrations Utility
 * Handles database schema creation and initial data seeding
 */

import { getSupabase, migrations } from "./database.js";

/**
 * Run all migrations
 */
export const runMigrations = async () => {
  console.log("Starting database migrations...");

  try {
    // Create tables
    console.log("Creating database tables...");
    const tablesResult = await migrations.createTables();

    if (!tablesResult.success) {
      throw new Error(`Failed to create tables: ${tablesResult.error}`);
    }

    console.log("✅ Database tables created successfully");

    // Seed initial data
    console.log("Seeding initial data...");
    const seedResult = await migrations.seedData();

    if (!seedResult.success) {
      throw new Error(`Failed to seed data: ${seedResult.error}`);
    }

    console.log("✅ Initial data seeded successfully");

    return {
      success: true,
      message: "All migrations completed successfully",
    };
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check migration status
 */
export const checkMigrationStatus = async () => {
  try {
    const supabase = getSupabase();

    // Check if main tables exist by trying to count records
    const tables = ["pages", "sections", "media", "users"];
    const status = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("count", { count: "exact", head: true });

        status[table] = {
          exists: !error,
          count: error ? 0 : data || 0,
          error: error?.message,
        };
      } catch (err) {
        status[table] = {
          exists: false,
          count: 0,
          error: err.message,
        };
      }
    }

    return {
      success: true,
      data: status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Reset database (WARNING: This will delete all data)
 */
export const resetDatabase = async () => {
  console.log("⚠️  WARNING: Resetting database will delete all data!");

  try {
    const supabase = getSupabase();

    // Drop tables in reverse order to avoid foreign key constraints
    const dropQueries = [
      "DROP TABLE IF EXISTS sections CASCADE;",
      "DROP TABLE IF EXISTS media CASCADE;",
      "DROP TABLE IF EXISTS pages CASCADE;",
      "DROP TABLE IF EXISTS users CASCADE;",
    ];

    for (const sql of dropQueries) {
      try {
        const { error } = await supabase.rpc("exec_sql", { sql });
        if (error) console.warn(`Drop table warning: ${error.message}`);
      } catch (err) {
        console.warn(`Drop table error: ${err.message}`);
      }
    }

    console.log("🗑️  All tables dropped");

    // Recreate everything
    const migrationResult = await runMigrations();

    return migrationResult;
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Backup database content to JSON
 */
export const backupDatabase = async () => {
  try {
    const supabase = getSupabase();
    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      data: {},
    };

    // Backup each table
    const tables = ["pages", "sections", "media", "users"];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        backup.data[table] = data || [];
      } catch (err) {
        console.warn(`Failed to backup table ${table}:`, err.message);
        backup.data[table] = [];
      }
    }

    return {
      success: true,
      data: backup,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Restore database from backup
 */
export const restoreDatabase = async (backupData) => {
  try {
    const supabase = getSupabase();

    if (!backupData || !backupData.data) {
      throw new Error("Invalid backup data");
    }

    // Clear existing data
    const tables = ["sections", "media", "pages", "users"];
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

        if (error) console.warn(`Clear table ${table} warning:`, error.message);
      } catch (err) {
        console.warn(`Failed to clear table ${table}:`, err.message);
      }
    }

    // Restore data in correct order (respecting foreign keys)
    const restoreOrder = ["users", "pages", "sections", "media"];

    for (const table of restoreOrder) {
      const tableData = backupData.data[table];

      if (tableData && tableData.length > 0) {
        try {
          const { error } = await supabase.from(table).insert(tableData);

          if (error) throw error;

          console.log(`✅ Restored ${tableData.length} records to ${table}`);
        } catch (err) {
          console.error(`❌ Failed to restore table ${table}:`, err.message);
        }
      }
    }

    return {
      success: true,
      message: "Database restored successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
  try {
    const supabase = getSupabase();
    const stats = {
      timestamp: new Date().toISOString(),
      tables: {},
    };

    const tables = ["pages", "sections", "media", "users"];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("count", { count: "exact", head: true });

        stats.tables[table] = {
          count: error ? 0 : data || 0,
          error: error?.message,
        };
      } catch (err) {
        stats.tables[table] = {
          count: 0,
          error: err.message,
        };
      }
    }

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// CLI-like interface for migrations
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case "migrate":
      runMigrations().then((result) => {
        console.log(result);
        process.exit(result.success ? 0 : 1);
      });
      break;

    case "status":
      checkMigrationStatus().then((result) => {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
      });
      break;

    case "reset":
      resetDatabase().then((result) => {
        console.log(result);
        process.exit(result.success ? 0 : 1);
      });
      break;

    case "backup":
      backupDatabase().then((result) => {
        if (result.success) {
          console.log(JSON.stringify(result.data, null, 2));
        } else {
          console.error(result);
        }
        process.exit(result.success ? 0 : 1);
      });
      break;

    case "stats":
      getDatabaseStats().then((result) => {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
      });
      break;

    default:
      console.log(`
Usage: node api/utils/migrations.js <command>

Commands:
  migrate  - Run all migrations
  status   - Check migration status
  reset    - Reset database (WARNING: deletes all data)
  backup   - Backup database to JSON
  stats    - Show database statistics
      `);
      process.exit(1);
  }
}
