const { cors, helmet, morgan } = require("../utils/middleware");
const { authService, generateToken } = require("../utils/auth");
const { validate, schemas } = require("../utils/validation");

// Login validation schema
const loginSchema = schemas.contactForm
  .keys({
    username: schemas.text.min(3).max(50).required(),
    password: schemas.text.min(6).max(100).required(),
  })
  .fork(["name", "email", "phone", "subject", "message"], (schema) =>
    schema.optional()
  );

// Error handler
const handleError = (error, req, res) => {
  console.error("Login Error:", error);

  if (
    error.message === "User not found" ||
    error.message === "Invalid password"
  ) {
    return res.status(401).json({
      success: false,
      error: "Authentication Failed",
      message: "Invalid username or password",
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "Login failed",
    timestamp: new Date().toISOString(),
  });
};

// Main handler function
module.exports = async (req, res) => {
  // Apply middleware
  cors(req, res, () => {
    helmet(req, res, () => {
      morgan(req, res, () => {
        // Only handle POST requests
        if (req.method !== "POST") {
          return res.status(405).json({
            success: false,
            error: "Method Not Allowed",
            message: "Only POST requests are allowed for login",
          });
        }

        // Validate request body
        const { error } = loginSchema.validate(req.body);
        if (error) {
          const errorMessage = error.details
            .map((detail) => detail.message)
            .join(", ");
          return res.status(400).json({
            success: false,
            error: "Validation Error",
            message: errorMessage,
          });
        }

        // Process login
        const { username, password } = req.body;

        authService
          .validateUser(username, password)
          .then((user) => {
            // Generate JWT token
            const token = generateToken({
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
            });

            res.status(200).json({
              success: true,
              message: "Login successful",
              data: {
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  role: user.role,
                },
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || "24h",
              },
            });
          })
          .catch((error) => {
            handleError(error, req, res);
          });
      });
    });
  });
};
