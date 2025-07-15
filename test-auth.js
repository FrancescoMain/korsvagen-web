/**
 * Authentication System Test
 * Tests the JWT authentication endpoints
 */

import axios from "axios";

const API_BASE = "http://localhost:3000/api";
const TEST_USER = {
  email: "admin@korsvagen.com",
  password: "admin123",
};

async function testAuthentication() {
  console.log("🧪 Testing KORSVAGEN Authentication System\n");

  try {
    // Test 1: Login
    console.log("1️⃣ Testing Login...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_USER);

    if (loginResponse.data.success) {
      console.log("✅ Login successful");
      console.log(
        `   Token received: ${loginResponse.data.data.accessToken.substring(
          0,
          20
        )}...`
      );
      console.log(
        `   User: ${loginResponse.data.data.user.name} (${loginResponse.data.data.user.role})`
      );
    }

    const token = loginResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${token}` };

    // Test 2: Verify Token
    console.log("\n2️⃣ Testing Token Verification...");
    const verifyResponse = await axios.get(`${API_BASE}/auth/verify`, {
      headers,
    });

    if (verifyResponse.data.success) {
      console.log("✅ Token verification successful");
      console.log(`   User verified: ${verifyResponse.data.data.user.email}`);
    }

    // Test 3: Get User Profile
    console.log("\n3️⃣ Testing User Profile...");
    const profileResponse = await axios.get(`${API_BASE}/auth/me`, { headers });

    if (profileResponse.data.success) {
      console.log("✅ Profile retrieval successful");
      console.log(`   Profile: ${profileResponse.data.data.user.name}`);
    }

    // Test 4: Test Protected Route (should work)
    console.log("\n4️⃣ Testing Protected Route Access...");
    try {
      // This would be a protected endpoint like content management
      const protectedResponse = await axios.get(`${API_BASE}/content/pages`, {
        headers,
      });
      console.log("✅ Protected route access successful");
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(
          "ℹ️ Protected route endpoint not found (expected for this test)"
        );
      } else {
        console.log(
          "❌ Protected route access failed:",
          error.response?.data?.message
        );
      }
    }

    // Test 5: Test Invalid Token
    console.log("\n5️⃣ Testing Invalid Token...");
    try {
      const invalidHeaders = { Authorization: "Bearer invalid-token" };
      await axios.get(`${API_BASE}/auth/verify`, { headers: invalidHeaders });
      console.log("❌ Invalid token should have been rejected");
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log("✅ Invalid token properly rejected");
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    // Test 6: Logout
    console.log("\n6️⃣ Testing Logout...");
    const logoutResponse = await axios.post(
      `${API_BASE}/auth/logout`,
      {},
      { headers }
    );

    if (logoutResponse.data.success) {
      console.log("✅ Logout successful");
    }

    // Test 7: Test Token After Logout (should fail)
    console.log("\n7️⃣ Testing Token After Logout...");
    try {
      await axios.get(`${API_BASE}/auth/verify`, { headers });
      console.log("❌ Token should have been invalidated after logout");
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log("✅ Token properly invalidated after logout");
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    // Test 8: Test Rate Limiting
    console.log("\n8️⃣ Testing Rate Limiting...");
    let rateLimitTriggered = false;

    for (let i = 0; i < 6; i++) {
      try {
        await axios.post(`${API_BASE}/auth/login`, {
          email: "wrong@email.com",
          password: "wrongpassword",
        });
      } catch (error) {
        if (error.response?.status === 429) {
          console.log("✅ Rate limiting triggered after failed attempts");
          rateLimitTriggered = true;
          break;
        }
      }
    }

    if (!rateLimitTriggered) {
      console.log("ℹ️ Rate limiting not triggered (may need more attempts)");
    }

    console.log("\n🎉 Authentication system testing completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure the development server is running:");
      console.log("   npm run dev");
    }
  }
}

// Run tests if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testAuthentication();
}

export default testAuthentication;
