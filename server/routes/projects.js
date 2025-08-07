/**
 * KORSVAGEN WEB APPLICATION - PROJECTS API ROUTES
 * 
 * Gestisce le API per i progetti aziendali:
 * - GET /api/projects - Endpoint pubblico per il frontend
 * - GET /api/projects/:idOrSlug - Dettaglio progetto pubblico
 * - GET /api/projects/labels - Lista categorie per filtri
 * 
 * Admin endpoints:
 * - GET /api/admin/projects - Gestione admin (lista completa)
 * - POST /api/admin/projects - Crea nuovo progetto
 * - GET /api/admin/projects/:id - Dettaglio progetto per modifica
 * - PUT /api/admin/projects/:id - Aggiorna progetto
 * - DELETE /api/admin/projects/:id - Elimina progetto
 * - PUT /api/admin/projects/reorder - Riordina progetti
 * 
 * Images management:
 * - POST /api/admin/projects/:id/images - Upload multiple immagini
 * - PUT /api/admin/projects/:id/images/:imageId - Aggiorna singola immagine
 * - DELETE /api/admin/projects/:id/images/:imageId - Elimina immagine
 * - PUT /api/admin/projects/:id/images/reorder - Riordina immagini
 * - PUT /api/admin/projects/:id/images/:imageId/cover - Imposta come cover
 */

import express from "express";
import { supabaseClient } from "../config/supabase.js";
import { requireAuth } from "../utils/auth.js";
import { logger } from "../utils/logger.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Configure multer for image uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (buffer, projectId, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `korsvagen/projects/${projectId}`,
        public_id: `${projectId}_${Date.now()}_${filename}`,
        transformation: [
          { width: 1200, height: 800, crop: "fill", quality: "auto" },
          { fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// Helper function to validate project data
const validateProjectData = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push("Title is required");
    }
    if (data.title && data.title.length > 255) {
      errors.push("Title must be less than 255 characters");
    }
  }
  
  if (!isUpdate || data.year !== undefined) {
    const year = parseInt(data.year);
    if (!year || year < 1900 || year > 2100) {
      errors.push("Valid year is required (1900-2100)");
    }
  }
  
  if (!isUpdate || data.location !== undefined) {
    if (!data.location || data.location.trim().length === 0) {
      errors.push("Location is required");
    }
  }
  
  if (!isUpdate || data.status !== undefined) {
    const validStatuses = ['Completato', 'In corso', 'Progettazione'];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.push("Status must be one of: " + validStatuses.join(', '));
    }
  }
  
  if (!isUpdate || data.label !== undefined) {
    if (!data.label || data.label.trim().length === 0) {
      errors.push("Label/Category is required");
    }
  }
  
  if (!isUpdate || data.description !== undefined) {
    if (!data.description || data.description.trim().length === 0) {
      errors.push("Description is required");
    }
  }
  
  // Validate features array if provided
  if (data.features !== undefined) {
    if (data.features && !Array.isArray(data.features)) {
      errors.push("Features must be an array");
    }
  }
  
  return errors;
};

// =====================================================
// PUBLIC API ENDPOINTS
// =====================================================

/**
 * GET /api/projects
 * Public endpoint - Returns active projects for frontend with filtering
 * Query params: ?label=category&status=status&limit=12&page=1
 */
router.get("/", async (req, res) => {
  try {
    const { 
      label, 
      status, 
      limit = 12, 
      page = 1 
    } = req.query;

    logger.info("Fetching public projects list", { 
      label, 
      status, 
      limit: parseInt(limit), 
      page: parseInt(page) 
    });

    // Build query
    let query = supabaseClient
      .from('projects_with_cover')
      .select('*')
      .eq('is_active', true);

    // Apply filters
    if (label && label !== 'tutti') {
      query = query.eq('label', label);
    }
    
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const limitInt = Math.min(parseInt(limit) || 12, 50); // Max 50 per page
    const pageInt = Math.max(parseInt(page) || 1, 1);
    const offset = (pageInt - 1) * limitInt;

    query = query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitInt - 1);

    const { data: projects, error } = await query;

    if (error) {
      logger.error("Error fetching projects:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching projects"
      });
    }

    // Get total count for pagination
    let countQuery = supabaseClient
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (label && label !== 'tutti') {
      countQuery = countQuery.eq('label', label);
    }
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      logger.warn("Error getting project count:", countError);
    }

    const totalPages = Math.ceil((count || 0) / limitInt);

    logger.info(`Successfully fetched ${projects.length} projects`);

    res.json({
      success: true,
      data: {
        projects: projects || [],
        pagination: {
          current_page: pageInt,
          total_pages: totalPages,
          total_items: count || 0,
          per_page: limitInt,
          has_next: pageInt < totalPages,
          has_prev: pageInt > 1
        }
      }
    });

  } catch (error) {
    logger.error("Unexpected error in GET /api/projects:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * GET /api/projects/labels
 * Public endpoint - Returns available project labels for filters
 */
router.get("/labels", async (req, res) => {
  try {
    logger.info("Fetching project labels");

    const { data: labels, error } = await supabaseClient
      .from('project_labels')
      .select('name, display_name, color')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      logger.error("Error fetching project labels:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching project labels"
      });
    }

    logger.info(`Successfully fetched ${labels.length} project labels`);

    res.json({
      success: true,
      data: labels || []
    });

  } catch (error) {
    logger.error("Unexpected error in GET /api/projects/labels:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * GET /api/projects/:idOrSlug
 * Public endpoint - Returns single project with all images
 * Accepts both numeric ID and slug
 */
router.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    
    logger.info("Fetching project detail", { idOrSlug });

    // Determine if it's an ID (numeric) or slug
    const isNumeric = /^\d+$/.test(idOrSlug);
    
    let query = supabaseClient
      .from('projects_complete')
      .select('*')
      .eq('is_active', true);
    
    if (isNumeric) {
      query = query.eq('id', parseInt(idOrSlug));
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data: projects, error } = await query;

    if (error) {
      logger.error("Error fetching project detail:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching project"
      });
    }

    if (!projects || projects.length === 0) {
      logger.warn("Project not found", { idOrSlug });
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const project = projects[0];

    logger.info(`Successfully fetched project: ${project.title}`);

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    logger.error("Unexpected error in GET /api/projects/:idOrSlug:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// =====================================================
// ADMIN API ENDPOINTS
// =====================================================

/**
 * GET /api/admin/projects
 * Admin endpoint - Returns all projects for management
 */
router.get("/admin", requireAuth, async (req, res) => {
  try {
    logger.info("Admin fetching projects list", { userId: req.user.id });

    const { data: projects, error } = await supabaseClient
      .from('projects_with_cover')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      logger.error("Error fetching admin projects:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching projects"
      });
    }

    logger.info(`Admin successfully fetched ${projects.length} projects`);

    res.json({
      success: true,
      data: projects || []
    });

  } catch (error) {
    logger.error("Unexpected error in GET /api/admin/projects:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * POST /api/admin/projects
 * Admin endpoint - Creates new project
 */
router.post("/admin", requireAuth, async (req, res) => {
  try {
    const projectData = req.body;
    
    logger.info("Admin creating new project", { 
      userId: req.user.id, 
      title: projectData.title 
    });

    // Validate data
    const validationErrors = validateProjectData(projectData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: validationErrors
      });
    }

    // Parse features if it's a string
    if (typeof projectData.features === 'string') {
      try {
        projectData.features = JSON.parse(projectData.features);
      } catch (e) {
        projectData.features = [];
      }
    }

    // Ensure features is an array
    if (!Array.isArray(projectData.features)) {
      projectData.features = [];
    }

    const { data: project, error } = await supabaseClient
      .from('projects')
      .insert([{
        title: projectData.title.trim(),
        subtitle: projectData.subtitle?.trim() || null,
        year: parseInt(projectData.year),
        location: projectData.location.trim(),
        status: projectData.status,
        label: projectData.label,
        description: projectData.description.trim(),
        long_description: projectData.long_description?.trim() || null,
        client: projectData.client?.trim() || null,
        surface: projectData.surface?.trim() || null,
        budget: projectData.budget?.trim() || null,
        duration: projectData.duration?.trim() || null,
        features: projectData.features,
        is_active: projectData.is_active !== undefined ? projectData.is_active : true,
        display_order: parseInt(projectData.display_order) || 0,
        meta_title: projectData.meta_title?.trim() || null,
        meta_description: projectData.meta_description?.trim() || null
      }])
      .select()
      .single();

    if (error) {
      logger.error("Error creating project:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating project",
        error: error.message
      });
    }

    logger.info(`Admin successfully created project: ${project.title}`, { 
      projectId: project.id 
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });

  } catch (error) {
    logger.error("Unexpected error in POST /api/admin/projects:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * GET /api/admin/projects/:id
 * Admin endpoint - Returns single project with all details for editing
 */
router.get("/admin/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info("Admin fetching project detail", { userId: req.user.id, projectId: id });

    const { data: projects, error } = await supabaseClient
      .from('projects_complete')
      .select('*')
      .eq('id', parseInt(id));

    if (error) {
      logger.error("Error fetching admin project detail:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching project"
      });
    }

    if (!projects || projects.length === 0) {
      logger.warn("Project not found for admin", { projectId: id });
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const project = projects[0];

    logger.info(`Admin successfully fetched project: ${project.title}`);

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    logger.error("Unexpected error in GET /api/admin/projects/:id:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * PUT /api/admin/projects/:id
 * Admin endpoint - Updates existing project
 */
router.put("/admin/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    logger.info("Admin updating project", { 
      userId: req.user.id, 
      projectId: id 
    });

    // Validate data
    const validationErrors = validateProjectData(updates, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: validationErrors
      });
    }

    // Parse features if it's a string
    if (updates.features && typeof updates.features === 'string') {
      try {
        updates.features = JSON.parse(updates.features);
      } catch (e) {
        updates.features = [];
      }
    }

    // Clean up the updates object
    const cleanUpdates = {};
    const allowedFields = [
      'title', 'subtitle', 'year', 'location', 'status', 'label',
      'description', 'long_description', 'client', 'surface', 'budget',
      'duration', 'features', 'is_active', 'display_order', 'slug',
      'meta_title', 'meta_description'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (typeof updates[field] === 'string') {
          cleanUpdates[field] = updates[field].trim();
        } else {
          cleanUpdates[field] = updates[field];
        }
      }
    });

    // Convert numeric fields
    if (cleanUpdates.year) cleanUpdates.year = parseInt(cleanUpdates.year);
    if (cleanUpdates.display_order !== undefined) {
      cleanUpdates.display_order = parseInt(cleanUpdates.display_order) || 0;
    }

    const { data: project, error } = await supabaseClient
      .from('projects')
      .update(cleanUpdates)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      logger.error("Error updating project:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating project",
        error: error.message
      });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    logger.info(`Admin successfully updated project: ${project.title}`);

    res.json({
      success: true,
      message: "Project updated successfully",
      data: project
    });

  } catch (error) {
    logger.error("Unexpected error in PUT /api/admin/projects/:id:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * DELETE /api/admin/projects/:id
 * Admin endpoint - Deletes project (and all associated images)
 */
router.delete("/admin/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info("Admin deleting project", { userId: req.user.id, projectId: id });

    // First get project images to delete from Cloudinary
    const { data: images } = await supabaseClient
      .from('project_images')
      .select('image_public_id')
      .eq('project_id', parseInt(id));

    // Delete project (cascade will handle images table)
    const { data: project, error } = await supabaseClient
      .from('projects')
      .delete()
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      logger.error("Error deleting project:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting project"
      });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Delete images from Cloudinary in background
    if (images && images.length > 0) {
      const deletePromises = images.map(img => 
        cloudinary.uploader.destroy(img.image_public_id)
          .catch(err => logger.warn("Failed to delete image from Cloudinary:", err))
      );
      
      // Don't wait for Cloudinary deletion to complete
      Promise.all(deletePromises).catch(err => 
        logger.warn("Some Cloudinary deletions failed:", err)
      );
    }

    logger.info(`Admin successfully deleted project: ${project.title}`);

    res.json({
      success: true,
      message: "Project deleted successfully"
    });

  } catch (error) {
    logger.error("Unexpected error in DELETE /api/admin/projects/:id:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// =====================================================
// PROJECT IMAGES MANAGEMENT
// =====================================================

/**
 * POST /api/admin/projects/:id/images
 * Admin endpoint - Upload multiple images for a project
 */
router.post("/admin/:id/images", requireAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided"
      });
    }

    logger.info("Admin uploading project images", { 
      userId: req.user.id, 
      projectId: id, 
      imageCount: files.length 
    });

    // Verify project exists
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, title')
      .eq('id', parseInt(id))
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Upload images to Cloudinary and save to database
    const uploadedImages = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          file.buffer, 
          id, 
          file.originalname.replace(/\.[^/.]+$/, "")
        );

        // Get next display order
        const { data: lastImage } = await supabaseClient
          .from('project_images')
          .select('display_order')
          .eq('project_id', parseInt(id))
          .order('display_order', { ascending: false })
          .limit(1)
          .single();

        const nextOrder = (lastImage?.display_order || 0) + 1;

        // Save to database
        const { data: savedImage, error: saveError } = await supabaseClient
          .from('project_images')
          .insert([{
            project_id: parseInt(id),
            image_url: result.secure_url,
            image_public_id: result.public_id,
            title: file.originalname.replace(/\.[^/.]+$/, ""),
            alt_text: `${project.title} - Image ${nextOrder}`,
            display_order: nextOrder,
            is_cover: uploadedImages.length === 0 && i === 0, // First image as cover if none exist
            width: result.width,
            height: result.height
          }])
          .select()
          .single();

        if (saveError) {
          logger.error("Error saving image to database:", saveError);
          errors.push(`Failed to save ${file.originalname}`);
        } else {
          uploadedImages.push(savedImage);
        }

      } catch (uploadError) {
        logger.error("Error uploading image:", uploadError);
        errors.push(`Failed to upload ${file.originalname}`);
      }
    }

    logger.info(`Admin uploaded ${uploadedImages.length} images for project ${project.title}`);

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} images`,
      data: {
        uploaded: uploadedImages,
        errors: errors
      }
    });

  } catch (error) {
    logger.error("Unexpected error in POST /api/admin/projects/:id/images:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * PUT /api/admin/projects/:id/images/:imageId
 * Admin endpoint - Update single image details
 */
router.put("/admin/:id/images/:imageId", requireAuth, async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const { title, alt_text } = req.body;
    
    logger.info("Admin updating project image", { 
      userId: req.user.id, 
      projectId: id, 
      imageId 
    });

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (alt_text !== undefined) updates.alt_text = alt_text.trim();

    const { data: image, error } = await supabaseClient
      .from('project_images')
      .update(updates)
      .eq('id', parseInt(imageId))
      .eq('project_id', parseInt(id))
      .select()
      .single();

    if (error) {
      logger.error("Error updating project image:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating image"
      });
    }

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    logger.info("Admin successfully updated project image");

    res.json({
      success: true,
      message: "Image updated successfully",
      data: image
    });

  } catch (error) {
    logger.error("Unexpected error in PUT /api/admin/projects/:id/images/:imageId:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * PUT /api/admin/projects/:id/images/:imageId/cover
 * Admin endpoint - Set image as project cover
 */
router.put("/admin/:id/images/:imageId/cover", requireAuth, async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    logger.info("Admin setting project cover image", { 
      userId: req.user.id, 
      projectId: id, 
      imageId 
    });

    const { data: image, error } = await supabaseClient
      .from('project_images')
      .update({ is_cover: true })
      .eq('id', parseInt(imageId))
      .eq('project_id', parseInt(id))
      .select()
      .single();

    if (error) {
      logger.error("Error setting cover image:", error);
      return res.status(500).json({
        success: false,
        message: "Error setting cover image"
      });
    }

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    logger.info("Admin successfully set cover image");

    res.json({
      success: true,
      message: "Cover image set successfully",
      data: image
    });

  } catch (error) {
    logger.error("Unexpected error in PUT /api/admin/projects/:id/images/:imageId/cover:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * DELETE /api/admin/projects/:id/images/:imageId
 * Admin endpoint - Delete single project image
 */
router.delete("/admin/:id/images/:imageId", requireAuth, async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    logger.info("Admin deleting project image", { 
      userId: req.user.id, 
      projectId: id, 
      imageId 
    });

    // Get image details before deleting
    const { data: image, error: fetchError } = await supabaseClient
      .from('project_images')
      .select('image_public_id, title, is_cover')
      .eq('id', parseInt(imageId))
      .eq('project_id', parseInt(id))
      .single();

    if (fetchError || !image) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    // Delete from database
    const { error: deleteError } = await supabaseClient
      .from('project_images')
      .delete()
      .eq('id', parseInt(imageId))
      .eq('project_id', parseInt(id));

    if (deleteError) {
      logger.error("Error deleting project image:", deleteError);
      return res.status(500).json({
        success: false,
        message: "Error deleting image"
      });
    }

    // Delete from Cloudinary in background
    if (image.image_public_id) {
      cloudinary.uploader.destroy(image.image_public_id)
        .catch(err => logger.warn("Failed to delete image from Cloudinary:", err));
    }

    // If deleted image was cover, set first remaining image as cover
    if (image.is_cover) {
      const { data: firstImage } = await supabaseClient
        .from('project_images')
        .select('id')
        .eq('project_id', parseInt(id))
        .order('display_order')
        .limit(1)
        .single();

      if (firstImage) {
        await supabaseClient
          .from('project_images')
          .update({ is_cover: true })
          .eq('id', firstImage.id);
      }
    }

    logger.info(`Admin successfully deleted project image: ${image.title}`);

    res.json({
      success: true,
      message: "Image deleted successfully"
    });

  } catch (error) {
    logger.error("Unexpected error in DELETE /api/admin/projects/:id/images/:imageId:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * PUT /api/admin/projects/:id/images/reorder
 * Admin endpoint - Reorder project images
 * Body: { imageOrders: [{ id: 1, display_order: 1 }, ...] }
 */
router.put("/admin/:id/images/reorder", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { imageOrders } = req.body;
    
    if (!Array.isArray(imageOrders)) {
      return res.status(400).json({
        success: false,
        message: "imageOrders must be an array"
      });
    }

    logger.info("Admin reordering project images", { 
      userId: req.user.id, 
      projectId: id,
      orderCount: imageOrders.length
    });

    // Update each image's display_order
    const updatePromises = imageOrders.map(({ id: imageId, display_order }) => 
      supabaseClient
        .from('project_images')
        .update({ display_order: parseInt(display_order) })
        .eq('id', parseInt(imageId))
        .eq('project_id', parseInt(id))
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      logger.error("Error reordering images:", errors);
      return res.status(500).json({
        success: false,
        message: "Error reordering some images"
      });
    }

    logger.info("Admin successfully reordered project images");

    res.json({
      success: true,
      message: "Images reordered successfully"
    });

  } catch (error) {
    logger.error("Unexpected error in PUT /api/admin/projects/:id/images/reorder:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * PUT /api/admin/projects/reorder
 * Admin endpoint - Reorder projects
 * Body: { projectOrders: [{ id: 1, display_order: 1 }, ...] }
 */
router.put("/admin/reorder", requireAuth, async (req, res) => {
  try {
    const { projectOrders } = req.body;
    
    if (!Array.isArray(projectOrders)) {
      return res.status(400).json({
        success: false,
        message: "projectOrders must be an array"
      });
    }

    logger.info("Admin reordering projects", { 
      userId: req.user.id,
      orderCount: projectOrders.length
    });

    // Update each project's display_order
    const updatePromises = projectOrders.map(({ id, display_order }) => 
      supabaseClient
        .from('projects')
        .update({ display_order: parseInt(display_order) })
        .eq('id', parseInt(id))
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      logger.error("Error reordering projects:", errors);
      return res.status(500).json({
        success: false,
        message: "Error reordering some projects"
      });
    }

    logger.info("Admin successfully reordered projects");

    res.json({
      success: true,
      message: "Projects reordered successfully"
    });

  } catch (error) {
    logger.error("Unexpected error in PUT /api/admin/projects/reorder:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;