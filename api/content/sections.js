const { cors, helmet, morgan } = require("../utils/middleware");
const { authenticateToken } = require("../utils/auth");

// Mock sections data (for homepage sections like hero, services, projects, etc.)
const mockSections = [
  {
    id: "1",
    name: "hero_section",
    title: "Welcome to KORSVAGEN",
    subtitle: "Your trusted construction partner",
    content: "Professional construction and renovation services in Scafati, SA",
    image_url: "/images/hero-background.jpg",
    cta_text: "Get Started",
    cta_link: "/contact",
    order: 1,
    is_active: true,
    page: "home",
    created_at: "2025-01-14T10:00:00.000Z",
    updated_at: "2025-01-14T10:00:00.000Z",
  },
  {
    id: "2",
    name: "services_section",
    title: "Our Services",
    subtitle: "What we offer",
    content: "Complete range of construction and renovation services",
    image_url: null,
    cta_text: "View All Services",
    cta_link: "/services",
    order: 2,
    is_active: true,
    page: "home",
    created_at: "2025-01-14T10:00:00.000Z",
    updated_at: "2025-01-14T10:00:00.000Z",
  },
  {
    id: "3",
    name: "projects_section",
    title: "Our Projects",
    subtitle: "Recent work",
    content: "Take a look at our latest completed projects",
    image_url: null,
    cta_text: "View Portfolio",
    cta_link: "/projects",
    order: 3,
    is_active: true,
    page: "home",
    created_at: "2025-01-14T10:00:00.000Z",
    updated_at: "2025-01-14T10:00:00.000Z",
  },
  {
    id: "4",
    name: "contact_section",
    title: "Get In Touch",
    subtitle: "Contact us",
    content:
      "Ready to start your project? Contact us today for a free consultation",
    image_url: null,
    cta_text: "Contact Us",
    cta_link: "/contact",
    order: 4,
    is_active: true,
    page: "home",
    created_at: "2025-01-14T10:00:00.000Z",
    updated_at: "2025-01-14T10:00:00.000Z",
  },
];

// Error handler
const handleError = (error, req, res) => {
  console.error("Sections API Error:", error);

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "Failed to process sections request",
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
              // Get sections for a specific page or all sections
              const { page, name } = req.query;

              let filteredSections = mockSections.filter((s) => s.is_active);

              if (page) {
                filteredSections = filteredSections.filter(
                  (s) => s.page === page
                );
              }

              if (name) {
                filteredSections = filteredSections.filter(
                  (s) => s.name === name
                );
                if (filteredSections.length === 0) {
                  return res.status(404).json({
                    success: false,
                    error: "Not Found",
                    message: "Section not found",
                  });
                }

                return res.status(200).json({
                  success: true,
                  data: filteredSections[0],
                });
              }

              // Sort by order
              filteredSections.sort((a, b) => a.order - b.order);

              return res.status(200).json({
                success: true,
                data: filteredSections,
                total: filteredSections.length,
              });

            case "POST":
              // Create new section (requires authentication)
              authenticateToken(req, res, () => {
                const newSection = {
                  id: String(mockSections.length + 1),
                  ...req.body,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };

                mockSections.push(newSection);

                res.status(201).json({
                  success: true,
                  message: "Section created successfully",
                  data: newSection,
                });
              });
              break;

            case "PUT":
              // Update section (requires authentication)
              authenticateToken(req, res, () => {
                const { id } = req.query;
                if (!id) {
                  return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Section ID is required",
                  });
                }

                const sectionIndex = mockSections.findIndex((s) => s.id === id);
                if (sectionIndex === -1) {
                  return res.status(404).json({
                    success: false,
                    error: "Not Found",
                    message: "Section not found",
                  });
                }

                mockSections[sectionIndex] = {
                  ...mockSections[sectionIndex],
                  ...req.body,
                  updated_at: new Date().toISOString(),
                };

                res.status(200).json({
                  success: true,
                  message: "Section updated successfully",
                  data: mockSections[sectionIndex],
                });
              });
              break;

            case "DELETE":
              // Delete section (requires authentication)
              authenticateToken(req, res, () => {
                const { id } = req.query;
                if (!id) {
                  return res.status(400).json({
                    success: false,
                    error: "Bad Request",
                    message: "Section ID is required",
                  });
                }

                const sectionIndex = mockSections.findIndex((s) => s.id === id);
                if (sectionIndex === -1) {
                  return res.status(404).json({
                    success: false,
                    error: "Not Found",
                    message: "Section not found",
                  });
                }

                // Instead of deleting, we set is_active to false
                mockSections[sectionIndex].is_active = false;
                mockSections[sectionIndex].updated_at =
                  new Date().toISOString();

                res.status(200).json({
                  success: true,
                  message: "Section deactivated successfully",
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
