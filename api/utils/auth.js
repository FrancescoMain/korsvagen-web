const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-key-for-development";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access Denied",
      message: "Authentication token required",
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Invalid Token",
      message: error.message,
    });
  }
};

// Mock user data for development
const mockUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@korsvagen.com",
    role: "admin",
    // Password: 'admin123' (in production, this would be hashed)
    passwordHash: "mock-hash-admin123",
  },
];

// Mock authentication functions
const authService = {
  async validateUser(username, password) {
    const user = mockUsers.find((u) => u.username === username);
    if (!user) {
      throw new Error("User not found");
    }

    // In production, compare with hashed password
    if (password !== "admin123") {
      throw new Error("Invalid password");
    }

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async getUserById(id) {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw new Error("User not found");
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  authService,
};
