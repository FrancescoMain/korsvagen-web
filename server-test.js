const express = require("express");
const path = require("path");

// Import API handlers
const healthHandler = require("./api/health");
const loginHandler = require("./api/auth/login");
const logoutHandler = require("./api/auth/logout");
const verifyHandler = require("./api/auth/verify");
const pagesHandler = require("./api/content/pages");
const sectionsHandler = require("./api/content/sections");
const mediaHandler = require("./api/content/media");

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/health", healthHandler);
app.use("/api/auth/login", loginHandler);
app.use("/api/auth/logout", logoutHandler);
app.use("/api/auth/verify", verifyHandler);
app.use("/api/content/pages", pagesHandler);
app.use("/api/content/sections", sectionsHandler);
app.use("/api/content/media", mediaHandler);

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `API endpoint ${req.path} not found`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KORSVAGEN API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`📄 Pages endpoint: http://localhost:${PORT}/api/content/pages`);
  console.log("\n✨ Server ready for testing!");
});

module.exports = app;
