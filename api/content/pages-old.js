const { cors, helmet, morgan } = require("../utils/middleware");
const { authenticateToken } = require("../utils/auth");
const { validate, schemas } = require("../utils/validation");

// Mock pages data
const mockPages = [
  {
    id: "1",
    title: "Home Page",
    slug: "home",
    content: "Welcome to KORSVAGEN - Your trusted construction partner",
    meta_description:
      "KORSVAGEN S.R.L. - Construction and renovation services in Scafati, SA",
    status: "published",
    created_at: "2025-01-14T10:00:00.000Z",
    updated_at: "2025-01-14T10:00:00.000Z",
  },
  {
    id: "2",
    title: "About Us",
    slug: "about",
    content: "Learn more about our company history and mission",
    meta_description: "About KORSVAGEN - Our story, mission and values",
    status: "published",
    created_at: "2025-01-14T10:00:00.000Z",
    updated_at: "2025-01-14T10:00:00.000Z",
  },
  {
    id: "3",
    title: "Services",
    slug: "services",
    content: "Our comprehensive construction and renovation services",
    meta_description:
      "KORSVAGEN construction services - Building and renovation",
    status: "published",
    created_at: "2025-01-14T10:00:00.000Z",
    updated_at: "2025-01-14T10:00:00.000Z",
  },
];

// Error handler
const handleError = (error, req, res) => {
  console.error("Pages API Error:", error);

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "Failed to process pages request",
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
              // Get all pages or specific page
              const { slug } = req.query;

              if (slug) {
                const page = mockPages.find(
                  (p) => p.slug === slug && p.status === "published"
                );
                if (!page) {
                  return res.status(404).json({
                    success: false,
                    error: "Not Found",
                    message: "Page not found",
                  });
                }

                return res.status(200).json({
                  success: true,
                  data: page,
                });
              } else {
                // Return all published pages
                const publishedPages = mockPages.filter(
                  (p) => p.status === "published"
                );
                return res.status(200).json({
                  success: true,
                  data: publishedPages,
                  total: publishedPages.length,
                });
              }

            case "POST":
              // Create new page (requires authentication)
              authenticateToken(req, res, () => {
                validate(schemas.pageContent)(req, res, () => {
                  const newPage = {
                    id: String(mockPages.length + 1),
                    ...req.body,
                    slug: req.body.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^\w-]/g, ""),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };

                  mockPages.push(newPage);

                  res.status(201).json({
                    success: true,
                    message: "Page created successfully",
                    data: newPage,
                  });
                });
              });
              break;

            case "PUT":
              // Update page (requires authentication)
              authenticateToken(req, res, () => {
                const { id } = req.query;
                if (!id) {
                  return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Page ID is required",
                  });
                }

                validate(schemas.pageContent)(req, res, () => {
                  const pageIndex = mockPages.findIndex((p) => p.id === id);
                  if (pageIndex === -1) {
                    return res.status(404).json({
                      success: false,
                      error: "Not Found",
                      message: "Page not found",
                    });
                  }

                  mockPages[pageIndex] = {
                    ...mockPages[pageIndex],
                    ...req.body,
                    updated_at: new Date().toISOString(),
                  };

                  res.status(200).json({
                    success: true,
                    message: "Page updated successfully",
                    data: mockPages[pageIndex],
                  });
                });
              });
              break;

            case "DELETE":
              // Delete page (requires authentication)
              authenticateToken(req, res, () => {
                const { id } = req.query;
                if (!id) {
                  return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Page ID is required",
                  });
                }

                const pageIndex = mockPages.findIndex((p) => p.id === id);
                if (pageIndex === -1) {
                  return res.status(404).json({
                    success: false,
                    error: "Not Found",
                    message: "Page not found",
                  });
                }

                mockPages.splice(pageIndex, 1);

                res.status(200).json({
                  success: true,
                  message: "Page deleted successfully",
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
