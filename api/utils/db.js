// Database connection utilities
// This is a placeholder for future database integration

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "korsvagen_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  ssl: process.env.DB_SSL === "true",
};

// Mock database functions for now
const mockData = {
  companyInfo: {
    id: "1",
    company_name: "KORSVAGEN S.R.L.",
    address: {
      street: "Via Santa Maria la Carità 18",
      city: "Scafati (SA)",
      postal_code: "84018",
      country: "Italia",
    },
    contacts: {
      phone: "+39 349 429 8547",
      email: "korsvagensrl@gmail.com",
    },
    social_media: {
      instagram: "https://instagram.com/korsvagensrl",
      linkedin: "https://linkedin.com/company/korsvagen",
    },
    business_info: {
      rea: "1071429",
      vat_number: "09976601212",
      tax_code: "09976601212",
    },
  },
};

// Database utility functions
const db = {
  // Company info
  async getCompanyInfo() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockData.companyInfo), 100);
    });
  },

  // Health check
  async checkConnection() {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({ status: "connected", timestamp: new Date().toISOString() }),
        50
      );
    });
  },

  // Generic query placeholder
  async query(sql, params = []) {
    console.log("Mock DB Query:", sql, params);
    return new Promise((resolve) => {
      setTimeout(() => resolve({ rows: [], rowCount: 0 }), 100);
    });
  },
};

module.exports = {
  dbConfig,
  db,
};
