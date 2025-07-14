const { cors, helmet, morgan } = require("./utils/middleware");
const { db } = require("./utils/db");

// Error handler
const handleError = (error, req, res) => {
  console.error("Health Check Error:", error);

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "Health check failed",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { details: error.message }),
  });
};

// Main handler function
module.exports = async (req, res) => {
  // Apply middleware
  cors(req, res, () => {
    helmet(req, res, () => {
      morgan(req, res, async () => {
        try {
          // Only handle GET requests
          if (req.method !== "GET") {
            return res.status(405).json({
              success: false,
              error: "Method Not Allowed",
              message: "Only GET requests are allowed for health check",
            });
          }

          // Check database connection
          const dbStatus = await db.checkConnection();

          // System information
          const healthInfo = {
            success: true,
            status: "healthy",
            timestamp: new Date().toISOString(),
            service: "KORSVAGEN API",
            version: "1.0.0",
            environment: process.env.NODE_ENV || "development",
            database: {
              status: "connected",
              ...dbStatus,
            },
            uptime: process.uptime(),
            memory: {
              used:
                Math.round(process.memoryUsage().heapUsed / 1024 / 1024) +
                " MB",
              total:
                Math.round(process.memoryUsage().heapTotal / 1024 / 1024) +
                " MB",
            },
          };

          res.status(200).json(healthInfo);
        } catch (error) {
          handleError(error, req, res);
        }
      });
    });
  });
};
