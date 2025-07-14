/**
 * Supabase Database Configuration and Connection
 * Optimized for Vercel serverless functions
 */

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
let supabase = null;

/**
 * Get Supabase client instance (singleton pattern for serverless)
 */
export const getSupabase = () => {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Important for serverless
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "X-Client-Info": "korsvagen-web-api",
        },
      },
    });
  }

  return supabase;
};

/**
 * Database health check
 */
export const checkDatabaseHealth = async () => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("pages")
      .select("count", { count: "exact", head: true });

    if (error) throw error;

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      recordCount: data || 0,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
};

/**
 * Generic database query wrapper with error handling
 */
export const executeQuery = async (queryFn) => {
  try {
    const supabase = getSupabase();
    const result = await queryFn(supabase);

    if (result.error) {
      throw new Error(`Database query failed: ${result.error.message}`);
    }

    return {
      success: true,
      data: result.data,
      count: result.count,
    };
  } catch (error) {
    console.error("Database query error:", error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

/**
 * Database migration utilities
 */
export const migrations = {
  /**
   * Create initial tables if they don't exist
   */
  createTables: async () => {
    const supabase = getSupabase();

    // Note: In production, use Supabase migration files
    // This is for development/testing purposes
    const tables = [
      // Pages table
      `
        CREATE TABLE IF NOT EXISTS pages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          page_id VARCHAR(100) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          og_image VARCHAR(500),
          is_published BOOLEAN DEFAULT true,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,

      // Sections table
      `
        CREATE TABLE IF NOT EXISTS sections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          section_id VARCHAR(100) UNIQUE NOT NULL,
          page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255),
          content JSONB DEFAULT '{}',
          order_index INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,

      // Media table
      `
        CREATE TABLE IF NOT EXISTS media (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          cloudinary_id VARCHAR(255) UNIQUE NOT NULL,
          public_id VARCHAR(255) NOT NULL,
          url VARCHAR(500) NOT NULL,
          secure_url VARCHAR(500) NOT NULL,
          format VARCHAR(20),
          resource_type VARCHAR(20) DEFAULT 'image',
          width INTEGER,
          height INTEGER,
          bytes INTEGER,
          alt_text VARCHAR(255),
          folder VARCHAR(255),
          tags TEXT[],
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,

      // Users table (for admin access)
      `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    ];

    try {
      for (const sql of tables) {
        const { error } = await supabase.rpc("exec_sql", { sql });
        if (error) throw error;
      }

      return { success: true, message: "Tables created successfully" };
    } catch (error) {
      console.error("Migration error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Seed initial data
   */
  seedData: async () => {
    const supabase = getSupabase();

    try {
      // Seed home page
      const { data: homePage, error: homeError } = await supabase
        .from("pages")
        .upsert({
          page_id: "home",
          title: "KORSVAGEN - Home",
          slug: "home",
          description: "KORSVAGEN costruzioni edili - Home page",
          is_published: true,
          metadata: {
            seo_title: "KORSVAGEN - Costruzioni Edili di Qualità",
            seo_description:
              "KORSVAGEN offre servizi di costruzione edile di alta qualità in tutta Italia.",
          },
        })
        .select()
        .single();

      if (homeError && homeError.code !== "23505") throw homeError; // Ignore unique constraint violations

      // Seed default sections for home page
      if (homePage) {
        const sections = [
          {
            section_id: "home-hero",
            page_id: homePage.id,
            type: "hero",
            title: "Hero Section",
            content: {
              title: "KORSVAGEN",
              subtitle: "Costruzioni Edili di Qualità",
              description:
                "Da oltre 20 anni realizziamo progetti edili di eccellenza",
              cta_text: "Scopri i nostri progetti",
              cta_link: "/progetti",
              background_video: "/korsvagen-hero.mp4",
            },
            order_index: 1,
            is_active: true,
          },
          {
            section_id: "home-services",
            page_id: homePage.id,
            type: "services",
            title: "I Nostri Servizi",
            content: {
              title: "Servizi di Costruzione",
              description:
                "Offriamo una gamma completa di servizi per il settore edile",
              services: [],
            },
            order_index: 2,
            is_active: true,
          },
        ];

        const { error: sectionsError } = await supabase
          .from("sections")
          .upsert(sections);

        if (sectionsError && sectionsError.code !== "23505")
          throw sectionsError;
      }

      return { success: true, message: "Initial data seeded successfully" };
    } catch (error) {
      console.error("Seeding error:", error);
      return { success: false, error: error.message };
    }
  },
};
