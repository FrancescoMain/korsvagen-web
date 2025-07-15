const { cors, helmet, morgan } = require("../utils/middleware");

// Error handler
const handleError = (error, req, res) => {
  console.error("Logout Error:", error);

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "Logout failed",
    timestamp: new Date().toISOString(),
  });
};

// Main handler function
module.exports = async (req, res) => {
  // Apply middleware
  cors(req, res, () => {
    helmet(req, res, () => {
      morgan(req, res, async () => {
        try {
          // Only handle POST requests
          if (req.method !== "POST") {
            return res.status(405).json({
              success: false,
              error: "Method Not Allowed",
              message: "Only POST requests are allowed for logout",
            });
          }

          // In a stateless JWT system, logout is handled client-side
          // by removing the token from storage
          // Here we can log the logout event and potentially blacklist the token

          const authHeader = req.headers["authorization"];
          const token = authHeader && authHeader.split(" ")[1];

          if (token) {
            // In production, you might want to add the token to a blacklist
            console.log(
              "User logout - Token invalidated:",
              token.substring(0, 20) + "..."
            );
          }

          res.status(200).json({
            success: true,
            message: "Logout successful",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          handleError(error, req, res);
        }
      });
    });
  });
};
