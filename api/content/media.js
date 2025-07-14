const { cors, helmet, morgan } = require("../utils/middleware");
const { authenticateToken } = require("../utils/auth");

// Mock media data
const mockMedia = [
  {
    id: "1",
    filename: "hero-background.jpg",
    original_name: "korsvagen-hero-image.jpg",
    mime_type: "image/jpeg",
    size: 1024000,
    url: "/images/hero-background.jpg",
    alt_text: "KORSVAGEN construction site",
    description: "Hero image showing construction work",
    category: "hero",
    is_active: true,
    uploaded_by: "admin",
    created_at: "2025-01-14T10:00:00.000Z",
    updated_at: "2025-01-14T10:00:00.000Z",
  },
  {
    id: "2",
    filename: "project-1.jpg",
    original_name: "residential-project-1.jpg",
    mime_type: "image/jpeg",
    size: 854000,
    url: "/images/projects/project-1.jpg",
    alt_text: "Residential renovation project",
    description: "Completed residential renovation in Scafati",
    category: "projects",
    is_active: true,
    uploaded_by: "admin",
    created_at: "2025-01-14T10:00:00.000Z",
    updated_at: "2025-01-14T10:00:00.000Z",
  },
  {
    id: "3",
    filename: "company-logo.png",
    original_name: "LOGO KORSVAGEN.png",
    mime_type: "image/png",
    size: 45000,
    url: "/images/logo/LOGO KORSVAGEN.png",
    alt_text: "KORSVAGEN company logo",
    description: "Official company logo",
    category: "branding",
    is_active: true,
    uploaded_by: "admin",
    created_at: "2025-01-14T10:00:00.000Z",
    updated_at: "2025-01-14T10:00:00.000Z",
  },
];

// Error handler
const handleError = (error, req, res) => {
  console.error("Media API Error:", error);

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "Failed to process media request",
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
          const { method } = req;

          switch (method) {
            case "GET":
              // Get media files
              const { category, id } = req.query;

              let filteredMedia = mockMedia.filter((m) => m.is_active);

              if (id) {
                const media = filteredMedia.find((m) => m.id === id);
                if (!media) {
                  return res.status(404).json({
                    success: false,
                    error: "Not Found",
                    message: "Media file not found",
                  });
                }

                return res.status(200).json({
                  success: true,
                  data: media,
                });
              }

              if (category) {
                filteredMedia = filteredMedia.filter(
                  (m) => m.category === category
                );
              }

              // Sort by created_at desc
              filteredMedia.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
              );

              return res.status(200).json({
                success: true,
                data: filteredMedia,
                total: filteredMedia.length,
              });

            case "POST":
              // Upload new media (requires authentication)
              authenticateToken(req, res, () => {
                // In a real implementation, this would handle file upload
                // For now, we'll simulate with metadata
                const {
                  filename,
                  original_name,
                  mime_type,
                  size,
                  alt_text,
                  description,
                  category,
                } = req.body;

                if (!filename || !original_name || !mime_type) {
                  return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message:
                      "Missing required fields: filename, original_name, mime_type",
                  });
                }

                const newMedia = {
                  id: String(mockMedia.length + 1),
                  filename,
                  original_name,
                  mime_type,
                  size: size || 0,
                  url: `/images/${category || "uploads"}/${filename}`,
                  alt_text: alt_text || "",
                  description: description || "",
                  category: category || "general",
                  is_active: true,
                  uploaded_by: req.user.username || "unknown",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };

                mockMedia.push(newMedia);

                res.status(201).json({
                  success: true,
                  message: "Media uploaded successfully",
                  data: newMedia,
                });
              });
              break;

            case "PUT":
              // Update media metadata (requires authentication)
              authenticateToken(req, res, () => {
                const { id } = req.query;
                if (!id) {
                  return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Media ID is required",
                  });
                }

                const mediaIndex = mockMedia.findIndex((m) => m.id === id);
                if (mediaIndex === -1) {
                  return res.status(404).json({
                    success: false,
                    error: "Not Found",
                    message: "Media file not found",
                  });
                }

                // Only allow updating certain fields
                const allowedFields = [
                  "alt_text",
                  "description",
                  "category",
                  "is_active",
                ];
                const updates = {};

                allowedFields.forEach((field) => {
                  if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                  }
                });

                mockMedia[mediaIndex] = {
                  ...mockMedia[mediaIndex],
                  ...updates,
                  updated_at: new Date().toISOString(),
                };

                res.status(200).json({
                  success: true,
                  message: "Media updated successfully",
                  data: mockMedia[mediaIndex],
                });
              });
              break;

            case "DELETE":
              // Delete media (requires authentication)
              authenticateToken(req, res, () => {
                const { id } = req.query;
                if (!id) {
                  return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Media ID is required",
                  });
                }

                const mediaIndex = mockMedia.findIndex((m) => m.id === id);
                if (mediaIndex === -1) {
                  return res.status(404).json({
                    success: false,
                    error: "Not Found",
                    message: "Media file not found",
                  });
                }

                // Mark as inactive instead of deleting
                mockMedia[mediaIndex].is_active = false;
                mockMedia[mediaIndex].updated_at = new Date().toISOString();

                res.status(200).json({
                  success: true,
                  message: "Media file deleted successfully",
                });
              });
              break;

            default:
              res.status(405).json({
                success: false,
                error: "Method Not Allowed",
                message: `Method ${method} not allowed`,
              });
              break;
          }
        } catch (error) {
          handleError(error, req, res);
        }
      });
    });
  });
};
