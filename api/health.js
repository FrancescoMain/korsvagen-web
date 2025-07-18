// Simple health check endpoint for Vercel
export default async (req, res) => {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only handle GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method Not Allowed",
      message: "Only GET requests are allowed for health check",
    });
  }

  try {
    // Simple health check response
    res.status(200).json({
      success: true,
      message: "API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    });
  } catch (error) {
    console.error("Health Check Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Health check failed",
      timestamp: new Date().toISOString(),
    });
  }
};
