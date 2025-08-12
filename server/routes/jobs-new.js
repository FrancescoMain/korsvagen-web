/**
 * KORSVAGEN WEB APPLICATION - JOBS API ROUTES (ROUTE ORDER FIXED)
 * 
 * Gestisce le API per il sistema "Lavora con Noi":
 * 
 * IMPORTANT: Route specifiche (/admin*) DEVONO venire prima di route dinamiche (/:slug)
 * 
 * Public endpoints (Frontend):
 * - GET /api/jobs - Lista posizioni aperte per il pubblico
 * - GET /api/jobs/meta/departments - Lista dipartimenti per filtri
 * - GET /api/jobs/meta/locations - Lista sedi per filtri
 * - GET /api/jobs/:slug - Dettaglio singola posizione
 * - POST /api/jobs/:slug/apply - Invio candidatura con CV
 * 
 * Admin endpoints (Dashboard):
 * - GET /api/jobs/admin - Lista completa posizioni per admin
 * - POST /api/jobs/admin - Crea nuova posizione
 * - GET /api/jobs/admin/:id - Dettaglio posizione per modifica
 * - PUT /api/jobs/admin/:id - Aggiorna posizione
 * - DELETE /api/jobs/admin/:id - Elimina posizione
 * - PUT /api/jobs/admin/reorder - Riordina posizioni
 * 
 * Applications management:
 * - GET /api/jobs/applications - Lista candidature con filtri
 * - GET /api/jobs/applications/:id - Dettaglio candidatura
 * - PUT /api/jobs/applications/:id/status - Aggiorna status candidatura
 * - DELETE /api/jobs/applications/:id - Elimina candidatura
 * - GET /api/jobs/applications/:id/cv - Download CV candidato
 */

import express from "express";
import { supabaseClient, supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../utils/auth.js";
import { logger } from "../utils/logger.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Configure multer for CV uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for CVs
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, DOC, DOCX files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for CVs'), false);
    }
  }
});

// Helper functions
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[àáâäæã]/g, 'a')
    .replace(/[èéêë]/g, 'e') 
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôöøõ]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ñ]/g, 'n')
    .replace(/[çć]/g, 'c')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const validateJobData = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || data.title.trim().length < 3) {
      errors.push("Title must be at least 3 characters long");
    }
  }
  
  if (!isUpdate || data.department !== undefined) {
    if (!data.department || data.department.trim().length < 2) {
      errors.push("Department is required");
    }
  }
  
  if (!isUpdate || data.location !== undefined) {
    if (!data.location || data.location.trim().length < 2) {
      errors.push("Location is required");
    }
  }
  
  if (!isUpdate || data.employment_type !== undefined) {
    const validTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary'];
    if (!data.employment_type || !validTypes.includes(data.employment_type)) {
      errors.push("Employment type must be one of: " + validTypes.join(', '));
    }
  }
  
  if (!isUpdate || data.experience_level !== undefined) {
    const validLevels = ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'];
    if (!data.experience_level || !validLevels.includes(data.experience_level)) {
      errors.push("Experience level must be one of: " + validLevels.join(', '));
    }
  }
  
  if (!isUpdate || data.description !== undefined) {
    if (!data.description || data.description.trim().length < 10) {
      errors.push("Description must be at least 10 characters long");
    }
  }
  
  if (!isUpdate || data.requirements !== undefined) {
    if (!data.requirements || data.requirements.trim().length < 10) {
      errors.push("Requirements must be at least 10 characters long");
    }
  }
  
  return errors;
};

// =============================================
// TEST ENDPOINT
// =============================================

/**
 * GET /api/jobs/test
 * Test endpoint for jobs functionality
 */
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Jobs API is working! (Route fix v2)",
    timestamp: new Date().toISOString(),
    endpoints: {
      public: [
        "GET /api/jobs - List active job positions",
        "GET /api/jobs/meta/departments - List departments", 
        "GET /api/jobs/meta/locations - List locations",
        "GET /api/jobs/:slug - Get job by slug",
        "POST /api/jobs/:slug/apply - Submit application"
      ],
      admin: [
        "GET /api/jobs/admin - List all jobs (admin)",
        "POST /api/jobs/admin - Create job (admin)",
        "GET /api/jobs/admin/:id - Get job by ID (admin)",
        "PUT /api/jobs/admin/:id - Update job (admin)", 
        "DELETE /api/jobs/admin/:id - Delete job (admin)",
        "PUT /api/jobs/admin/reorder - Reorder jobs (admin)"
      ],
      applications: [
        "GET /api/jobs/applications - List applications (admin)",
        "GET /api/jobs/applications/:id - Get application (admin)",
        "PUT /api/jobs/applications/:id/status - Update status (admin)",
        "DELETE /api/jobs/applications/:id - Delete application (admin)",
        "GET /api/jobs/applications/:id/cv - Download CV (admin)"
      ]
    }
  });
});

// =============================================
// ADMIN ENDPOINTS (Dashboard) - MUST COME BEFORE /:slug
// =============================================

/**
 * GET /api/jobs/admin/test
 * Test endpoint to verify admin routing without auth
 */
router.get("/admin/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Admin routing is working!",
    timestamp: new Date().toISOString(),
    route: "/admin/test"
  });
});

/**
 * GET /api/jobs/debug-route-order  
 * Debug endpoint to check route resolution order
 */
router.get("/debug-route-order", (req, res) => {
  res.json({ 
    success: true, 
    message: "Debug route working - this should come before /:slug",
    timestamp: new Date().toISOString(),
    note: "If you see this, specific routes are working correctly"
  });
});

/**
 * GET /api/jobs/admin
 * Lista completa delle posizioni per amministratori
 */
router.get("/admin", requireAuth, async (req, res) => {
  try {
    const { department, status, page = 1, limit = 20 } = req.query;
    
    logger.info(`🔒 Admin fetching job positions with filters: ${JSON.stringify(req.query)}`);
    
    let query = supabaseAdmin
      .from("job_positions")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    
    // Apply filters
    if (department && department !== 'all') {
      query = query.eq('department', department);
    }
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }
    
    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      logger.error("❌ Admin error fetching job positions:", error);
      return res.status(500).json({ 
        error: "Failed to fetch job positions", 
        details: error.message 
      });
    }
    
    logger.info(`✅ Admin successfully fetched ${data.length} job positions`);
    res.json({ 
      success: true, 
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
    
  } catch (error) {
    logger.error("❌ Admin error in GET /api/jobs/admin:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * POST /api/jobs/admin
 * Crea una nuova posizione lavorativa
 */
router.post("/admin", requireAuth, async (req, res) => {
  try {
    logger.info(`🔒 Admin creating new job position: ${req.body.title}`);
    
    // Validate job data
    const validationErrors = validateJobData(req.body);
    if (validationErrors.length > 0) {
      logger.warn(`⚠️  Validation errors in job creation:`, validationErrors);
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    // Generate slug if not provided
    let { slug } = req.body;
    if (!slug) {
      slug = generateSlug(req.body.title);
    }
    
    // Check if slug is unique
    const { data: existingJob } = await supabaseAdmin
      .from("job_positions")
      .select("id")
      .eq("slug", slug)
      .single();
    
    if (existingJob) {
      logger.warn(`⚠️  Slug already exists: ${slug}`);
      return res.status(400).json({
        error: "A job position with this slug already exists"
      });
    }
    
    // Create job position
    const { data: newJob, error } = await supabaseAdmin
      .from("job_positions")
      .insert({
        ...req.body,
        slug,
        title: req.body.title.trim(),
        department: req.body.department.trim(),
        location: req.body.location.trim(),
        description: req.body.description.trim(),
        requirements: req.body.requirements.trim(),
        nice_to_have: req.body.nice_to_have?.trim(),
        benefits: req.body.benefits?.trim(),
        salary_range: req.body.salary_range?.trim()
      })
      .select()
      .single();
    
    if (error) {
      logger.error("❌ Admin error creating job position:", error);
      return res.status(500).json({
        error: "Failed to create job position",
        details: error.message
      });
    }
    
    logger.info(`✅ Admin successfully created job position: ID ${newJob.id}, Title: ${newJob.title}`);
    res.status(201).json({ success: true, data: newJob });
    
  } catch (error) {
    logger.error("❌ Admin error in POST /api/jobs/admin:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * GET /api/jobs/admin/:id
 * Dettaglio di una posizione per modifica admin
 */
router.get("/admin/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`🔒 Admin fetching job position detail for ID: ${id}`);
    
    const { data: job, error } = await supabaseAdmin
      .from("job_positions")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error || !job) {
      logger.warn(`⚠️  Job position not found for ID: ${id}`);
      return res.status(404).json({ 
        error: "Job position not found" 
      });
    }
    
    logger.info(`✅ Admin successfully fetched job position: ${job.title}`);
    res.json({ success: true, data: job });
    
  } catch (error) {
    logger.error("❌ Admin error in GET /api/jobs/admin/:id:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * PUT /api/jobs/admin/:id
 * Aggiorna una posizione lavorativa esistente
 */
router.put("/admin/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`🔒 Admin updating job position ID: ${id}`);
    
    // Validate job data for update
    const validationErrors = validateJobData(req.body, true);
    if (validationErrors.length > 0) {
      logger.warn(`⚠️  Validation errors in job update:`, validationErrors);
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    // Check if job exists
    const { data: existingJob, error: existingError } = await supabaseAdmin
      .from("job_positions")
      .select("id, slug")
      .eq("id", id)
      .single();
    
    if (existingError || !existingJob) {
      logger.warn(`⚠️  Job position not found for update ID: ${id}`);
      return res.status(404).json({ 
        error: "Job position not found" 
      });
    }
    
    // Handle slug update if title changed
    let { slug } = req.body;
    if (req.body.title && !slug) {
      slug = generateSlug(req.body.title);
    }
    
    // Check slug uniqueness if changed
    if (slug && slug !== existingJob.slug) {
      const { data: slugCheck } = await supabaseAdmin
        .from("job_positions")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();
      
      if (slugCheck) {
        logger.warn(`⚠️  Slug already exists during update: ${slug}`);
        return res.status(400).json({
          error: "A job position with this slug already exists"
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title.trim();
    if (slug) updateData.slug = slug;
    if (req.body.department !== undefined) updateData.department = req.body.department.trim();
    if (req.body.location !== undefined) updateData.location = req.body.location.trim();
    if (req.body.employment_type !== undefined) updateData.employment_type = req.body.employment_type;
    if (req.body.experience_level !== undefined) updateData.experience_level = req.body.experience_level;
    if (req.body.description !== undefined) updateData.description = req.body.description.trim();
    if (req.body.requirements !== undefined) updateData.requirements = req.body.requirements.trim();
    if (req.body.nice_to_have !== undefined) updateData.nice_to_have = req.body.nice_to_have?.trim();
    if (req.body.benefits !== undefined) updateData.benefits = req.body.benefits?.trim();
    if (req.body.salary_range !== undefined) updateData.salary_range = req.body.salary_range?.trim();
    if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;
    if (req.body.display_order !== undefined) updateData.display_order = parseInt(req.body.display_order) || 0;
    
    // Update job position
    const { data: updatedJob, error } = await supabaseAdmin
      .from("job_positions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      logger.error("❌ Admin error updating job position:", error);
      return res.status(500).json({
        error: "Failed to update job position",
        details: error.message
      });
    }
    
    logger.info(`✅ Admin successfully updated job position: ID ${id}, Title: ${updatedJob.title}`);
    res.json({ success: true, data: updatedJob });
    
  } catch (error) {
    logger.error("❌ Admin error in PUT /api/jobs/admin/:id:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * DELETE /api/jobs/admin/:id
 * Elimina una posizione lavorativa
 */
router.delete("/admin/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`🔒 Admin deleting job position ID: ${id}`);
    
    // Check if job exists
    const { data: job, error: jobError } = await supabaseAdmin
      .from("job_positions")
      .select("id, title")
      .eq("id", id)
      .single();
    
    if (jobError || !job) {
      logger.warn(`⚠️  Job position not found for deletion ID: ${id}`);
      return res.status(404).json({ 
        error: "Job position not found" 
      });
    }
    
    // TODO: Check if there are applications when applications_count column is added
    // For now, allow deletion without checking applications
    
    // Delete job position
    const { error: deleteError } = await supabaseAdmin
      .from("job_positions")
      .delete()
      .eq("id", id);
    
    if (deleteError) {
      logger.error("❌ Admin error deleting job position:", deleteError);
      return res.status(500).json({
        error: "Failed to delete job position",
        details: deleteError.message
      });
    }
    
    logger.info(`✅ Admin successfully deleted job position: ID ${id}, Title: ${job.title}`);
    res.json({ 
      success: true, 
      message: `Job position "${job.title}" deleted successfully` 
    });
    
  } catch (error) {
    logger.error("❌ Admin error in DELETE /api/jobs/admin/:id:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * PUT /api/jobs/admin/reorder
 * Riordina le posizioni lavorative
 */
router.put("/admin/reorder", requireAuth, async (req, res) => {
  try {
    const { positions } = req.body;
    
    if (!Array.isArray(positions)) {
      return res.status(400).json({
        error: "Invalid data format. Expected array of positions."
      });
    }
    
    logger.info(`🔒 Admin reordering ${positions.length} job positions`);
    
    // Update display order for each position
    const updates = positions.map((position, index) => 
      supabaseAdmin
        .from("job_positions")
        .update({ display_order: index + 1 })
        .eq("id", position.id)
    );
    
    const results = await Promise.all(updates);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      logger.error("❌ Admin error reordering job positions:", errors);
      return res.status(500).json({
        error: "Failed to reorder some positions",
        details: errors.map(e => e.error.message)
      });
    }
    
    logger.info(`✅ Admin successfully reordered job positions`);
    res.json({ 
      success: true, 
      message: "Job positions reordered successfully" 
    });
    
  } catch (error) {
    logger.error("❌ Admin error in PUT /api/jobs/admin/reorder:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

// =============================================
// APPLICATION MANAGEMENT ENDPOINTS
// =============================================

/**
 * GET /api/jobs/applications
 * Lista candidature con filtri per admin
 */
router.get("/applications", requireAuth, async (req, res) => {
  try {
    const { job_id, status, page = 1, limit = 20, search } = req.query;
    
    logger.info(`🔒 Admin fetching job applications with filters: ${JSON.stringify(req.query)}`);
    
    let query = supabaseAdmin
      .from("job_applications_with_positions")
      .select("*")
      .order("applied_at", { ascending: false });
    
    // Apply filters
    if (job_id && job_id !== 'all') {
      query = query.eq('job_position_id', job_id);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (search && search.trim()) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      logger.error("❌ Admin error fetching applications:", error);
      return res.status(500).json({ 
        error: "Failed to fetch applications", 
        details: error.message 
      });
    }
    
    logger.info(`✅ Admin successfully fetched ${data.length} applications`);
    res.json({ 
      success: true, 
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
    
  } catch (error) {
    logger.error("❌ Admin error in GET /api/jobs/applications:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * GET /api/jobs/applications/:id/cv
 * Download CV candidato (admin only)
 */
router.get("/applications/:id/cv", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`🔒 Admin requesting CV download for application ID: ${id}`);
    
    // Get application details
    const { data: application, error } = await supabaseAdmin
      .from("job_applications")
      .select("id, first_name, last_name, cv_url, cv_public_id")
      .eq("id", id)
      .single();
    
    if (error || !application) {
      logger.warn(`⚠️  Application not found for CV download: ${id}`);
      return res.status(404).json({ 
        error: "Application not found" 
      });
    }
    
    if (!application.cv_url) {
      logger.warn(`⚠️  No CV uploaded for application: ${id}`);
      return res.status(404).json({ 
        error: "No CV uploaded for this application" 
      });
    }
    
    // Generate filename for download
    const fileName = `CV_${application.first_name}_${application.last_name}.pdf`;
    
    logger.info(`✅ CV download for ${application.first_name} ${application.last_name} -> ${application.cv_url}`);
    
    // Set headers for file download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache'
    });
    
    // Stream the file from Cloudinary to client
    try {
      const fetch = (await import('node-fetch')).default;
      const cloudinaryResponse = await fetch(application.cv_url);
      
      if (!cloudinaryResponse.ok) {
        throw new Error(`Failed to fetch CV from Cloudinary: ${cloudinaryResponse.status}`);
      }
      
      // Pipe the file stream directly to response
      cloudinaryResponse.body.pipe(res);
      
    } catch (streamError) {
      logger.error("❌ Error streaming CV file:", streamError);
      // Fallback to redirect if streaming fails
      const downloadUrl = application.cv_url.includes('?') 
        ? `${application.cv_url}&fl_attachment=${encodeURIComponent(fileName)}`
        : `${application.cv_url}?fl_attachment=${encodeURIComponent(fileName)}`;
      res.redirect(302, downloadUrl);
    }
    
  } catch (error) {
    logger.error("❌ Error downloading application CV:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

// =============================================
// META ENDPOINTS (Must come before /:slug)
// =============================================

/**
 * GET /api/jobs/meta/departments
 * Lista dei dipartimenti disponibili per filtri
 */
router.get("/meta/departments", async (req, res) => {
  try {
    logger.info(`📊 Fetching job departments for filters`);
    
    const { data, error } = await supabaseClient
      .from("job_positions")
      .select("department")
      .eq("is_active", true);
    
    if (error) {
      logger.error("❌ Error fetching departments:", error);
      return res.status(500).json({ 
        error: "Failed to fetch departments", 
        details: error.message 
      });
    }
    
    // Extract unique departments
    const departments = [...new Set(data.map(job => job.department))]
      .filter(dept => dept) // Remove null/empty
      .sort();
    
    logger.info(`✅ Successfully fetched ${departments.length} departments`);
    res.json({ success: true, data: departments });
    
  } catch (error) {
    logger.error("❌ Error in GET /api/jobs/meta/departments:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * GET /api/jobs/meta/locations
 * Lista delle sedi disponibili per filtri
 */
router.get("/meta/locations", async (req, res) => {
  try {
    logger.info(`📊 Fetching job locations for filters`);
    
    const { data, error } = await supabaseClient
      .from("job_positions")
      .select("location")
      .eq("is_active", true);
    
    if (error) {
      logger.error("❌ Error fetching locations:", error);
      return res.status(500).json({ 
        error: "Failed to fetch locations", 
        details: error.message 
      });
    }
    
    // Extract unique locations
    const locations = [...new Set(data.map(job => job.location))]
      .filter(location => location) // Remove null/empty
      .sort();
    
    logger.info(`✅ Successfully fetched ${locations.length} locations`);
    res.json({ success: true, data: locations });
    
  } catch (error) {
    logger.error("❌ Error in GET /api/jobs/meta/locations:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

// =============================================
// PUBLIC ENDPOINTS
// =============================================

/**
 * GET /api/jobs
 * Lista delle posizioni aperte (solo attive) per il pubblico
 */
router.get("/", async (req, res) => {
  try {
    const { department, location, employment_type } = req.query;
    
    logger.info(`📋 Fetching active job positions with filters: ${JSON.stringify(req.query)}`);
    
    let query = supabaseClient
      .from("job_positions")
      .select(`
        id,
        title,
        slug,
        department,
        location,
        employment_type,
        experience_level,
        description,
        benefits,
        salary_range
      `)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    
    // Apply filters for public API
    if (department) {
      query = query.eq('department', department);
    }
    if (location) {
      query = query.eq('location', location);
    }
    if (employment_type) {
      query = query.eq('employment_type', employment_type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error("❌ Error fetching active job positions:", error);
      return res.status(500).json({ 
        error: "Failed to fetch job positions", 
        details: error.message 
      });
    }
    
    logger.info(`✅ Successfully fetched ${data.length} active job positions`);
    res.json({ success: true, data });
    
  } catch (error) {
    logger.error("❌ Error in GET /api/jobs:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * GET /api/jobs/:slug  
 * Dettaglio di una specifica posizione per slug (MUST BE LAST DYNAMIC ROUTE)
 */
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    
    logger.info(`📄 Fetching job position detail for slug: ${slug}`);
    
    const { data: job, error } = await supabaseClient
      .from("job_positions")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    
    if (error || !job) {
      logger.warn(`⚠️  Job position not found for slug: ${slug}`);
      return res.status(404).json({ 
        error: "Job position not found" 
      });
    }
    
    logger.info(`✅ Successfully fetched job position: ${job.title}`);
    res.json({ success: true, data: job });
    
  } catch (error) {
    logger.error("❌ Error in GET /api/jobs/:slug:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * POST /api/jobs/:slug/apply
 * Invio candidatura per una posizione specifica
 */
router.post("/:slug/apply", upload.single('cv'), async (req, res) => {
  try {
    const { slug } = req.params;
    const { first_name, last_name, email, phone, cover_letter, linkedin_profile, portfolio_url } = req.body;
    
    logger.info(`💼 New job application for position: ${slug} from ${email}`);
    
    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        error: "Missing required fields: first_name, last_name, email are required"
      });
    }
    
    // Find job position
    const { data: job, error: jobError } = await supabaseClient
      .from("job_positions")
      .select("id, title, is_active")
      .eq("slug", slug)
      .single();
    
    if (jobError || !job) {
      logger.warn(`⚠️  Job position not found for application: ${slug}`);
      return res.status(404).json({ 
        error: "Job position not found" 
      });
    }
    
    if (!job.is_active) {
      logger.warn(`⚠️  Job position is not active: ${slug}`);
      return res.status(400).json({ 
        error: "This job position is no longer accepting applications" 
      });
    }
    
    // Check for duplicate application
    const { data: existingApp } = await supabaseAdmin
      .from("job_applications")
      .select("id")
      .eq("job_position_id", job.id)
      .eq("email", email)
      .single();
    
    if (existingApp) {
      logger.warn(`⚠️  Duplicate application attempt for ${email} on job ${slug}`);
      return res.status(400).json({
        error: "You have already applied for this position"
      });
    }
    
    let cvUrl = null;
    let cvPublicId = null;
    
    // Upload CV to Cloudinary if provided
    if (req.file) {
      try {
        logger.info(`📎 Uploading CV for application: ${first_name} ${last_name}`);
        
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "korsvagen/job_applications/cvs",
              public_id: `cv_${job.id}_${Date.now()}_${first_name}_${last_name}`,
              allowed_formats: ["pdf", "doc", "docx"]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.file.buffer);
        });
        
        cvUrl = uploadResult.secure_url;
        cvPublicId = uploadResult.public_id;
        
        logger.info(`✅ CV uploaded successfully: ${cvPublicId}`);
        
      } catch (uploadError) {
        logger.error("❌ Error uploading CV:", uploadError);
        return res.status(500).json({
          error: "Failed to upload CV. Please try again.",
          details: uploadError.message
        });
      }
    }
    
    // Create application
    const { data: application, error: appError } = await supabaseAdmin
      .from("job_applications")
      .insert({
        job_position_id: job.id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim(),
        cv_url: cvUrl,
        cv_public_id: cvPublicId,
        cover_letter: cover_letter?.trim(),
        linkedin_profile: linkedin_profile?.trim(),
        portfolio_url: portfolio_url?.trim(),
        status: 'new'
      })
      .select()
      .single();
    
    if (appError) {
      // If application creation fails and we uploaded a CV, clean it up
      if (cvPublicId) {
        try {
          await cloudinary.uploader.destroy(cvPublicId);
          logger.info(`🧹 Cleaned up uploaded CV after application error: ${cvPublicId}`);
        } catch (cleanupError) {
          logger.error("❌ Error cleaning up CV after failed application:", cleanupError);
        }
      }
      
      logger.error("❌ Error creating job application:", appError);
      return res.status(500).json({
        error: "Failed to submit application",
        details: appError.message
      });
    }
    
    logger.info(`✅ Job application submitted successfully: ID ${application.id} for position ${job.title}`);
    
    res.status(201).json({ 
      success: true, 
      message: `Application submitted successfully for ${job.title}`,
      data: {
        id: application.id,
        job_title: job.title,
        applied_at: application.applied_at
      }
    });
    
  } catch (error) {
    logger.error("❌ Error in POST /api/jobs/:slug/apply:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

export default router;