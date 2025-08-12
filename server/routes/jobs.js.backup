/**
 * KORSVAGEN WEB APPLICATION - JOBS API ROUTES
 * 
 * Gestisce le API per il sistema "Lavora con Noi":
 * 
 * Public endpoints (Frontend):
 * - GET /api/jobs - Lista posizioni aperte per il pubblico
 * - GET /api/jobs/:slug - Dettaglio singola posizione
 * - POST /api/jobs/:slug/apply - Invio candidatura con CV
 * - GET /api/jobs/meta/departments - Lista dipartimenti per filtri
 * - GET /api/jobs/meta/locations - Lista sedi per filtri
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
import { supabaseClient } from "../config/supabase.js";
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
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for CV upload'), false);
    }
  }
});

// Test endpoint to verify deployment
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Jobs API is working!",
    timestamp: new Date().toISOString(),
    routes: [
      "GET /api/jobs - Public job positions",
      "GET /api/jobs/:slug - Job position detail",
      "POST /api/jobs/:slug/apply - Submit application",
      "GET /api/jobs/admin - Admin job positions list",
      "POST /api/jobs/admin - Create job position"
    ]
  });
});

// Helper function to upload CV to Cloudinary
const uploadCVToCloudinary = async (buffer, applicantEmail, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "korsvagen/job_applications",
        public_id: `cv_${applicantEmail.replace('@', '_at_')}_${Date.now()}`,
        resource_type: "raw", // For non-image files like PDFs
        access_mode: "authenticated" // Restrict access for privacy
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to validate job position data
const validateJobData = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push("Title is required");
    }
    if (data.title && data.title.length > 255) {
      errors.push("Title must be less than 255 characters");
    }
  }
  
  if (!isUpdate || data.department !== undefined) {
    if (!data.department || data.department.trim().length === 0) {
      errors.push("Department is required");
    }
  }
  
  if (!isUpdate || data.location !== undefined) {
    if (!data.location || data.location.trim().length === 0) {
      errors.push("Location is required");
    }
  }
  
  if (!isUpdate || data.employment_type !== undefined) {
    const validTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
    if (!data.employment_type || !validTypes.includes(data.employment_type)) {
      errors.push(`Employment type must be one of: ${validTypes.join(', ')}`);
    }
  }
  
  if (!isUpdate || data.experience_level !== undefined) {
    const validLevels = ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'];
    if (!data.experience_level || !validLevels.includes(data.experience_level)) {
      errors.push(`Experience level must be one of: ${validLevels.join(', ')}`);
    }
  }
  
  if (!isUpdate || data.description !== undefined) {
    if (!data.description || data.description.trim().length === 0) {
      errors.push("Description is required");
    }
  }
  
  if (!isUpdate || data.requirements !== undefined) {
    if (!data.requirements || data.requirements.trim().length === 0) {
      errors.push("Requirements are required");
    }
  }
  
  return errors;
};

// Helper function to validate application data
const validateApplicationData = (data) => {
  const errors = [];
  
  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.push("First name is required");
  }
  
  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.push("Last name is required");
  }
  
  if (!data.email || data.email.trim().length === 0) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Invalid email format");
    }
  }
  
  if (data.linkedin_profile && data.linkedin_profile.trim().length > 0) {
    try {
      new URL(data.linkedin_profile);
    } catch {
      errors.push("Invalid LinkedIn profile URL");
    }
  }
  
  if (data.portfolio_url && data.portfolio_url.trim().length > 0) {
    try {
      new URL(data.portfolio_url);
    } catch {
      errors.push("Invalid portfolio URL");
    }
  }
  
  return errors;
};

// =============================================
// PUBLIC ENDPOINTS (Frontend)
// =============================================

/**
 * GET /api/jobs
 * Lista tutte le posizioni aperte per il pubblico
 * Query params: ?department=IT&location=Milano&employment_type=Full-time
 */
router.get("/", async (req, res) => {
  try {
    const { department, location, employment_type } = req.query;
    
    logger.info(`📋 Fetching active job positions with filters: ${JSON.stringify(req.query)}`);
    
    let query = supabaseClient
      .from("active_job_positions")
      .select("id, title, slug, department, location, employment_type, experience_level, description, benefits, salary_range, current_applications_count")
      .order("display_order", { ascending: true });
    
    // Apply filters
    if (department && department !== 'all') {
      query = query.eq('department', department);
    }
    if (location && location !== 'all') {
      query = query.ilike('location', `%${location}%`);
    }
    if (employment_type && employment_type !== 'all') {
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
 * Dettaglio di una specifica posizione per slug
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
    const {
      first_name,
      last_name,
      email,
      phone,
      cover_letter,
      linkedin_profile,
      portfolio_url
    } = req.body;
    
    logger.info(`📝 Processing job application for position: ${slug} from: ${email}`);
    
    // Validate application data
    const validationErrors = validateApplicationData(req.body);
    if (validationErrors.length > 0) {
      logger.warn(`⚠️  Validation errors in application:`, validationErrors);
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    // Find job position
    const { data: job, error: jobError } = await supabaseClient
      .from("job_positions")
      .select("id, title")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    
    if (jobError || !job) {
      logger.warn(`⚠️  Job position not found for slug: ${slug}`);
      return res.status(404).json({ 
        error: "Job position not found or no longer active" 
      });
    }
    
    // Check for duplicate application
    const { data: existingApplication } = await supabaseClient
      .from("job_applications")
      .select("id")
      .eq("job_position_id", job.id)
      .eq("email", email.toLowerCase())
      .single();
    
    if (existingApplication) {
      logger.warn(`⚠️  Duplicate application detected for ${email} on position ${job.title}`);
      return res.status(400).json({
        error: "You have already applied for this position"
      });
    }
    
    // Handle CV upload if present
    let cv_url = null;
    let cv_public_id = null;
    
    if (req.file) {
      logger.info(`📄 Uploading CV for ${email}`);
      
      try {
        const uploadResult = await uploadCVToCloudinary(
          req.file.buffer, 
          email, 
          req.file.originalname
        );
        
        cv_url = uploadResult.secure_url;
        cv_public_id = uploadResult.public_id;
        
        logger.info(`✅ CV uploaded successfully to Cloudinary: ${cv_public_id}`);
      } catch (uploadError) {
        logger.error("❌ Error uploading CV to Cloudinary:", uploadError);
        return res.status(500).json({
          error: "Failed to upload CV. Please try again."
        });
      }
    } else {
      logger.warn(`⚠️  No CV file provided for application from ${email}`);
      return res.status(400).json({
        error: "CV file is required for job application"
      });
    }
    
    // Save application to database
    const { data: application, error: applicationError } = await supabaseClient
      .from("job_applications")
      .insert({
        job_position_id: job.id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        cv_url,
        cv_public_id,
        cover_letter: cover_letter?.trim(),
        linkedin_profile: linkedin_profile?.trim(),
        portfolio_url: portfolio_url?.trim()
      })
      .select()
      .single();
    
    if (applicationError) {
      logger.error("❌ Error saving application to database:", applicationError);
      
      // Clean up uploaded CV if database save fails
      if (cv_public_id) {
        try {
          await cloudinary.uploader.destroy(cv_public_id, { resource_type: "raw" });
          logger.info(`🗑️  Cleaned up uploaded CV after database error: ${cv_public_id}`);
        } catch (cleanupError) {
          logger.error("❌ Error cleaning up CV after database error:", cleanupError);
        }
      }
      
      return res.status(500).json({
        error: "Failed to submit application. Please try again.",
        details: applicationError.message
      });
    }
    
    logger.info(`✅ Application submitted successfully: ID ${application.id} for ${job.title}`);
    
    // TODO: Send confirmation email to applicant
    // TODO: Send notification email to HR
    
    res.status(201).json({
      success: true,
      message: "Application submitted successfully! We will review your application and contact you soon.",
      data: {
        application_id: application.id,
        job_title: job.title,
        submitted_at: application.applied_at
      }
    });
    
  } catch (error) {
    logger.error("❌ Error in POST /api/jobs/:slug/apply:", error);
    res.status(500).json({
      error: "Internal server error during application submission",
      details: error.message
    });
  }
});

/**
 * GET /api/jobs/meta/departments
 * Lista tutti i dipartimenti disponibili per filtri
 */
router.get("/meta/departments", async (req, res) => {
  try {
    logger.info("📊 Fetching available departments");
    
    const { data, error } = await supabaseClient
      .from("job_positions")
      .select("department")
      .eq("is_active", true);
    
    if (error) {
      logger.error("❌ Error fetching departments:", error);
      return res.status(500).json({ error: "Failed to fetch departments" });
    }
    
    // Extract unique departments
    const departments = [...new Set(data.map(item => item.department))].sort();
    
    logger.info(`✅ Found ${departments.length} unique departments`);
    res.json({ success: true, data: departments });
    
  } catch (error) {
    logger.error("❌ Error in GET /api/jobs/meta/departments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/jobs/meta/locations
 * Lista tutte le sedi disponibili per filtri
 */
router.get("/meta/locations", async (req, res) => {
  try {
    logger.info("📊 Fetching available locations");
    
    const { data, error } = await supabaseClient
      .from("job_positions")
      .select("location")
      .eq("is_active", true);
    
    if (error) {
      logger.error("❌ Error fetching locations:", error);
      return res.status(500).json({ error: "Failed to fetch locations" });
    }
    
    // Extract unique locations
    const locations = [...new Set(data.map(item => item.location))].sort();
    
    logger.info(`✅ Found ${locations.length} unique locations`);
    res.json({ success: true, data: locations });
    
  } catch (error) {
    logger.error("❌ Error in GET /api/jobs/meta/locations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =============================================
// ADMIN ENDPOINTS (Dashboard)
// =============================================

/**
 * GET /api/jobs/admin
 * Lista completa delle posizioni per amministratori
 */
router.get("/admin", requireAuth, async (req, res) => {
  try {
    const { department, status, page = 1, limit = 20 } = req.query;
    
    logger.info(`🔒 Admin fetching job positions with filters: ${JSON.stringify(req.query)}`);
    
    let query = supabaseClient
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
    const { data: existingJob } = await supabaseClient
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
    const { data: newJob, error } = await supabaseClient
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
    
    const { data: job, error } = await supabaseClient
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
    const { data: existingJob, error: existingError } = await supabaseClient
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
      const { data: slugCheck } = await supabaseClient
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
    const { data: updatedJob, error } = await supabaseClient
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
    
    // Check if job exists and get applications count
    const { data: job, error: jobError } = await supabaseClient
      .from("job_positions")
      .select("id, title, applications_count")
      .eq("id", id)
      .single();
    
    if (jobError || !job) {
      logger.warn(`⚠️  Job position not found for deletion ID: ${id}`);
      return res.status(404).json({ 
        error: "Job position not found" 
      });
    }
    
    // Check if there are applications
    if (job.applications_count > 0) {
      logger.warn(`⚠️  Cannot delete job position with applications: ${job.title} (${job.applications_count} applications)`);
      return res.status(400).json({
        error: "Cannot delete job position that has received applications. Set it as inactive instead.",
        details: `This position has ${job.applications_count} application(s)`
      });
    }
    
    // Delete job position
    const { error: deleteError } = await supabaseClient
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
      supabaseClient
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
    
    let query = supabaseClient
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
 * GET /api/jobs/applications/:id
 * Dettaglio di una specifica candidatura
 */
router.get("/applications/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`🔒 Admin fetching application detail for ID: ${id}`);
    
    const { data: application, error } = await supabaseClient
      .from("job_applications_with_positions")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error || !application) {
      logger.warn(`⚠️  Application not found for ID: ${id}`);
      return res.status(404).json({ 
        error: "Application not found" 
      });
    }
    
    logger.info(`✅ Admin successfully fetched application: ${application.first_name} ${application.last_name}`);
    res.json({ success: true, data: application });
    
  } catch (error) {
    logger.error("❌ Admin error in GET /api/jobs/applications/:id:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * PUT /api/jobs/applications/:id/status
 * Aggiorna lo status di una candidatura
 */
router.put("/applications/:id/status", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    
    logger.info(`🔒 Admin updating application status ID: ${id} to: ${status}`);
    
    // Validate status
    const validStatuses = ['new', 'reviewed', 'contacted', 'interview', 'hired', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Update application
    const { data: updatedApplication, error } = await supabaseClient
      .from("job_applications")
      .update({ 
        status, 
        admin_notes: admin_notes?.trim(),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      logger.error("❌ Admin error updating application status:", error);
      return res.status(500).json({
        error: "Failed to update application status",
        details: error.message
      });
    }
    
    if (!updatedApplication) {
      logger.warn(`⚠️  Application not found for status update ID: ${id}`);
      return res.status(404).json({ 
        error: "Application not found" 
      });
    }
    
    logger.info(`✅ Admin successfully updated application status: ID ${id} to ${status}`);
    res.json({ success: true, data: updatedApplication });
    
  } catch (error) {
    logger.error("❌ Admin error in PUT /api/jobs/applications/:id/status:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * DELETE /api/jobs/applications/:id
 * Elimina una candidatura (con cleanup CV)
 */
router.delete("/applications/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`🔒 Admin deleting application ID: ${id}`);
    
    // Get application data before deletion
    const { data: application, error: fetchError } = await supabaseClient
      .from("job_applications")
      .select("id, first_name, last_name, email, cv_public_id")
      .eq("id", id)
      .single();
    
    if (fetchError || !application) {
      logger.warn(`⚠️  Application not found for deletion ID: ${id}`);
      return res.status(404).json({ 
        error: "Application not found" 
      });
    }
    
    // Delete from database first
    const { error: deleteError } = await supabaseClient
      .from("job_applications")
      .delete()
      .eq("id", id);
    
    if (deleteError) {
      logger.error("❌ Admin error deleting application:", deleteError);
      return res.status(500).json({
        error: "Failed to delete application",
        details: deleteError.message
      });
    }
    
    // Clean up CV file from Cloudinary if exists
    if (application.cv_public_id) {
      try {
        await cloudinary.uploader.destroy(application.cv_public_id, { resource_type: "raw" });
        logger.info(`🗑️  Cleaned up CV file: ${application.cv_public_id}`);
      } catch (cleanupError) {
        logger.error("❌ Error cleaning up CV file:", cleanupError);
        // Don't fail the request for cleanup errors
      }
    }
    
    logger.info(`✅ Admin successfully deleted application: ID ${id}, Name: ${application.first_name} ${application.last_name}`);
    res.json({ 
      success: true, 
      message: `Application from ${application.first_name} ${application.last_name} deleted successfully` 
    });
    
  } catch (error) {
    logger.error("❌ Admin error in DELETE /api/jobs/applications/:id:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

/**
 * GET /api/jobs/applications/:id/cv
 * Download CV file (proxy for secure access)
 */
router.get("/applications/:id/cv", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`🔒 Admin requesting CV download for application ID: ${id}`);
    
    // Get application with CV URL
    const { data: application, error } = await supabaseClient
      .from("job_applications")
      .select("id, first_name, last_name, cv_url, cv_public_id")
      .eq("id", id)
      .single();
    
    if (error || !application) {
      logger.warn(`⚠️  Application not found for CV download ID: ${id}`);
      return res.status(404).json({ 
        error: "Application not found" 
      });
    }
    
    if (!application.cv_url) {
      logger.warn(`⚠️  No CV file for application ID: ${id}`);
      return res.status(404).json({ 
        error: "No CV file attached to this application" 
      });
    }
    
    // Redirect to Cloudinary URL (with authentication if needed)
    logger.info(`✅ Admin CV download redirect: ${application.first_name} ${application.last_name}`);
    res.redirect(application.cv_url);
    
  } catch (error) {
    logger.error("❌ Admin error in GET /api/jobs/applications/:id/cv:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

export default router;