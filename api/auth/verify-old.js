const { cors, helmet, morgan } = require("../utils/middleware");
const { verifyToken, authService } = require("../utils/auth");

// Error handler
const handleError = (error, req, res) => {
  console.error("Verify Token Error:", error);

  if (
    error.message === "Invalid or expired token" ||
    error.message === "User not found"
  ) {
    return res.status(401).json({
      success: false,
      error: "Authentication Failed",
      message: error.message,
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "Token verification failed",
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
          // Only handle GET requests
          if (req.method !== "GET") {
            return res.status(405).json({
              success: false,
              error: "Method Not Allowed",
              message: "Only GET requests are allowed for token verification",
            });
          }

          // Get token from Authorization header
          const authHeader = req.headers["authorization"];
          const token = authHeader && authHeader.split(" ")[1];

          if (!token) {
            return res.status(401).json({
              success: false,
              error: "Access Denied",
              message: "Authentication token required",
            });
          }

          // Verify token
          const decoded = verifyToken(token);

          // Get fresh user data
          const user = await authService.getUserById(decoded.id);

          res.status(200).json({
            success: true,
            message: "Token is valid",
            data: {
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
              },
              tokenExpiry: decoded.exp,
              issuedAt: decoded.iat,
            },
          });
        } catch (error) {
          handleError(error, req, res);
        }
      });
    });
  });
};
