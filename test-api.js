// Simple test script to verify API endpoints
const axios = require("axios");

const BASE_URL = "http://localhost:3001";

async function testEndpoints() {
  console.log("🧪 Testing KORSVAGEN API Endpoints...\n");

  try {
    // Test health endpoint
    console.log("1. Testing Health Check...");
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log("✅ Health Check:", healthResponse.data.status);
    console.log("   Service:", healthResponse.data.service);
    console.log("   Environment:", healthResponse.data.environment);
    console.log("   Database:", healthResponse.data.database.status);
    console.log("");

    // Test content endpoints
    console.log("2. Testing Content Pages...");
    const pagesResponse = await axios.get(`${BASE_URL}/api/content/pages`);
    console.log("✅ Pages:", pagesResponse.data.total, "pages found");
    console.log("");

    console.log("3. Testing Content Sections...");
    const sectionsResponse = await axios.get(
      `${BASE_URL}/api/content/sections?page=home`
    );
    console.log("✅ Sections:", sectionsResponse.data.total, "sections found");
    console.log("");

    console.log("4. Testing Media...");
    const mediaResponse = await axios.get(`${BASE_URL}/api/content/media`);
    console.log("✅ Media:", mediaResponse.data.total, "files found");
    console.log("");

    console.log("5. Testing Authentication...");
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: "admin",
        password: "admin123",
      });
      console.log("✅ Login successful");
      console.log("   User:", loginResponse.data.data.user.username);
      console.log("   Role:", loginResponse.data.data.user.role);
      console.log("   Token received");

      // Test token verification
      const token = loginResponse.data.data.token;
      const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Token verification successful");
    } catch (authError) {
      console.log(
        "❌ Authentication test failed:",
        authError.response?.data?.message || authError.message
      );
    }

    console.log("\n🎉 All API tests completed successfully!");
  } catch (error) {
    console.error("❌ API Test failed:", error.response?.data || error.message);
    console.error("Make sure the Vercel dev server is running on port 3001");
  }
}

// Run tests
testEndpoints();
