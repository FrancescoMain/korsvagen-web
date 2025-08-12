/**
 * KORSVAGEN WEB APPLICATION - SERVICES API ROUTES
 * 
 * Gestisce le API per i servizi aziendali:
 * - GET /api/services - Endpoint pubblico per il frontend
 * - GET /api/admin/services - Gestione admin (lista completa)
 * - POST /api/admin/services - Crea nuovo servizio
 * - GET /api/admin/services/:id - Dettaglio servizio
 * - PUT /api/admin/services/:id - Aggiorna servizio
 * - DELETE /api/admin/services/:id - Elimina servizio
 * - PUT /api/admin/services/reorder - Riordina servizi
 * - POST /api/admin/services/:id/image - Upload immagine
 * - DELETE /api/admin/services/:id/image - Elimina immagine
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

// =====================================================
// PUBLIC API ENDPOINTS
// =====================================================

/**
 * GET /api/services
 * Public endpoint - Returns active services for frontend
 */
router.get("/", async (req, res) => {
  try {
    logger.info("Fetching public services list");
    
    const { data: services, error } = await supabaseClient
      .from("services_public")
      .select("*");

    if (error) {
      logger.error("Error fetching public services:", error);
      return res.status(500).json({
        success: false,
        error: "Errore nel recupero dei servizi",
        code: "FETCH_SERVICES_ERROR"
      });
    }

    logger.info(`Successfully fetched ${services?.length || 0} public services`);

    res.json({
      success: true,
      data: services || [],
      count: services?.length || 0
    });

  } catch (error) {
    logger.error("Unexpected error in public services endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

// =====================================================
// ADMIN API ENDPOINTS (Protected)
// =====================================================

/**
 * GET /api/services/admin
 * Admin endpoint - Returns all services with complete data
 */
router.get("/admin", requireAuth, async (req, res) => {
  try {
    logger.info(`Admin ${req.user.username} fetching all services`);
    
    const { data: services, error } = await supabaseClient
      .from("services_admin")
      .select("*");

    if (error) {
      logger.error("Error fetching admin services:", error);
      return res.status(500).json({
        success: false,
        error: "Errore nel recupero dei servizi",
        code: "FETCH_SERVICES_ERROR"
      });
    }

    logger.info(`Successfully fetched ${services?.length || 0} services for admin`);

    res.json({
      success: true,
      data: services || [],
      count: services?.length || 0
    });

  } catch (error) {
    logger.error("Unexpected error in admin services list endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Errore interno del server", 
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

/**
 * GET /api/services/admin/:id
 * Admin endpoint - Get single service details
 */
router.get("/admin/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Admin ${req.user.username} fetching service: ${id}`);

    const { data: service, error } = await supabaseClient
      .from("services_admin")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: "Servizio non trovato",
          code: "SERVICE_NOT_FOUND"
        });
      }
      
      logger.error("Error fetching service:", error);
      return res.status(500).json({
        success: false,
        error: "Errore nel recupero del servizio",
        code: "FETCH_SERVICE_ERROR"
      });
    }

    res.json({
      success: true,
      data: service
    });

  } catch (error) {
    logger.error("Unexpected error in admin service detail endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

/**
 * POST /api/services/admin
 * Admin endpoint - Create new service
 */
router.post("/admin", requireAuth, async (req, res) => {
  try {
    const { title, subtitle, description, microservices, is_active, display_order } = req.body;
    const userId = req.user.id;
    
    logger.info(`Admin ${req.user.username} creating new service: ${title}`);

    // Validation
    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Il titolo deve essere di almeno 3 caratteri",
        code: "INVALID_TITLE"
      });
    }

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "La descrizione deve essere di almeno 10 caratteri",
        code: "INVALID_DESCRIPTION"
      });
    }

    if (subtitle && subtitle.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Il sottotitolo deve essere di almeno 3 caratteri",
        code: "INVALID_SUBTITLE"
      });
    }

    // Prepare microservices
    let processedMicroservices = [];
    if (microservices && Array.isArray(microservices)) {
      processedMicroservices = microservices
        .filter(ms => ms && typeof ms === 'string' && ms.trim().length > 0)
        .map(ms => ms.trim())
        .slice(0, 20); // Limit to 20 microservices
    }

    // Determine display_order if not provided
    let finalDisplayOrder = display_order;
    if (!finalDisplayOrder) {
      const { data: maxOrderResult } = await supabaseClient
        .from("services")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);
      
      finalDisplayOrder = (maxOrderResult?.[0]?.display_order || 0) + 1;
    }

    const serviceData = {
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : null,
      description: description.trim(),
      microservices: processedMicroservices,
      is_active: is_active !== false, // Default to true
      display_order: finalDisplayOrder,
      created_by: userId,
      updated_by: userId
    };

    const { data: service, error } = await supabaseClient
      .from("services")
      .insert(serviceData)
      .select("*")
      .single();

    if (error) {
      logger.error("Error creating service:", error);
      return res.status(500).json({
        success: false,
        error: "Errore nella creazione del servizio",
        code: "CREATE_SERVICE_ERROR"
      });
    }

    logger.info(`Successfully created service: ${service.id}`);

    res.status(201).json({
      success: true,
      data: service,
      message: "Servizio creato con successo"
    });

  } catch (error) {
    logger.error("Unexpected error in create service endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

/**
 * PUT /api/services/admin/reorder
 * Admin endpoint - Reorder services
 */
router.put("/admin/reorder", requireAuth, async (req, res) => {
  try {
    const { serviceIds } = req.body;
    logger.info(`Admin ${req.user.username} reordering ${serviceIds?.length || 0} services`);

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "È richiesto un array di ID servizi",
        code: "INVALID_SERVICE_IDS"
      });
    }

    // Update each service's display_order manually (similar to projects approach)
    const updatePromises = serviceIds.map((serviceId, index) => 
      supabaseClient
        .from('services')
        .update({ display_order: index + 1 })
        .eq('id', serviceId)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      logger.error("Error reordering services:", errors);
      return res.status(500).json({
        success: false,
        message: "Errore nel riordinamento di alcuni servizi",
        code: "REORDER_SERVICES_ERROR"
      });
    }

    logger.info(`Successfully reordered ${serviceIds.length} services`);

    res.json({
      success: true,
      message: "Servizi riordinati con successo"
    });

  } catch (error) {
    logger.error("Unexpected error in reorder services endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

/**
 * PUT /api/services/admin/:id
 * Admin endpoint - Update existing service
 */
router.put("/admin/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, microservices, is_active, display_order } = req.body;
    const userId = req.user.id;
    
    logger.info(`Admin ${req.user.username} updating service: ${id}`);

    // Validation
    if (title !== undefined && (!title || title.trim().length < 3)) {
      return res.status(400).json({
        success: false,
        error: "Il titolo deve essere di almeno 3 caratteri",
        code: "INVALID_TITLE"
      });
    }

    if (description !== undefined && (!description || description.trim().length < 10)) {
      return res.status(400).json({
        success: false,
        error: "La descrizione deve essere di almeno 10 caratteri",
        code: "INVALID_DESCRIPTION"
      });
    }

    if (subtitle !== undefined && subtitle !== null && subtitle.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: "Il sottotitolo deve essere di almeno 3 caratteri",
        code: "INVALID_SUBTITLE"
      });
    }

    // Prepare update data
    const updateData = {
      updated_by: userId
    };

    if (title !== undefined) updateData.title = title.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle ? subtitle.trim() : null;
    if (description !== undefined) updateData.description = description.trim();
    if (is_active !== undefined) updateData.is_active = is_active;
    if (display_order !== undefined) updateData.display_order = display_order;

    if (microservices !== undefined) {
      let processedMicroservices = [];
      if (Array.isArray(microservices)) {
        processedMicroservices = microservices
          .filter(ms => ms && typeof ms === 'string' && ms.trim().length > 0)
          .map(ms => ms.trim())
          .slice(0, 20); // Limit to 20 microservices
      }
      updateData.microservices = processedMicroservices;
    }

    const { data: service, error } = await supabaseClient
      .from("services")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: "Servizio non trovato",
          code: "SERVICE_NOT_FOUND"
        });
      }
      
      logger.error("Error updating service:", error);
      return res.status(500).json({
        success: false,
        error: "Errore nell'aggiornamento del servizio",
        code: "UPDATE_SERVICE_ERROR"
      });
    }

    logger.info(`Successfully updated service: ${service.id}`);

    res.json({
      success: true,
      data: service,
      message: "Servizio aggiornato con successo"
    });

  } catch (error) {
    logger.error("Unexpected error in update service endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

/**
 * DELETE /api/services/admin/:id
 * Admin endpoint - Delete service
 */
router.delete("/admin/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Admin ${req.user.username} deleting service: ${id}`);

    // First, get service details to check for image cleanup
    const { data: serviceToDelete, error: fetchError } = await supabaseClient
      .from("services")
      .select("image_public_id, title")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: "Servizio non trovato",
          code: "SERVICE_NOT_FOUND"
        });
      }
      
      logger.error("Error fetching service for deletion:", fetchError);
      return res.status(500).json({
        success: false,
        error: "Errore nel recupero del servizio",
        code: "FETCH_SERVICE_ERROR"
      });
    }

    // Delete the service from database
    const { error: deleteError } = await supabaseClient
      .from("services")
      .delete()
      .eq("id", id);

    if (deleteError) {
      logger.error("Error deleting service:", deleteError);
      return res.status(500).json({
        success: false,
        error: "Errore nell'eliminazione del servizio",
        code: "DELETE_SERVICE_ERROR"
      });
    }

    // Clean up Cloudinary image if exists
    if (serviceToDelete.image_public_id) {
      try {
        await cloudinary.uploader.destroy(serviceToDelete.image_public_id);
        logger.info(`Successfully deleted Cloudinary image: ${serviceToDelete.image_public_id}`);
      } catch (cloudinaryError) {
        logger.warn(`Failed to delete Cloudinary image: ${cloudinaryError.message}`);
        // Don't fail the request if image cleanup fails
      }
    }

    logger.info(`Successfully deleted service: ${id} (${serviceToDelete.title})`);

    res.json({
      success: true,
      message: "Servizio eliminato con successo"
    });

  } catch (error) {
    logger.error("Unexpected error in delete service endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});


/**
 * POST /api/services/admin/:id/image
 * Admin endpoint - Upload service image
 */
router.post("/admin/:id/image", requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    logger.info(`Admin ${req.user.username} uploading image for service: ${id}`);
    
    // Debug: List all services to see what IDs we actually have
    const { data: allServices } = await supabaseClient
      .from("services")
      .select("id, title")
      .order("title");
    
    logger.info(`Available services in DB:`, allServices?.map(s => ({ id: s.id, title: s.title })));

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Nessun file immagine fornito",
        code: "NO_IMAGE_FILE"
      });
    }

    // Check if service exists - using more robust query
    const { data: servicesList, error: fetchError } = await supabaseClient
      .from("services")
      .select("id, title, image_public_id")
      .eq("id", id);

    if (fetchError) {
      logger.error("Error fetching service for image upload:", fetchError);
      return res.status(500).json({
        success: false,
        error: "Errore nel recupero del servizio",
        code: "FETCH_SERVICE_ERROR"
      });
    }

    if (!servicesList || servicesList.length === 0) {
      logger.warn(`Service not found for ID: ${id}`);
      return res.status(404).json({
        success: false,
        error: "Servizio non trovato",
        code: "SERVICE_NOT_FOUND"
      });
    }

    const existingService = servicesList[0];

    // Delete old image if exists
    if (existingService.image_public_id) {
      try {
        await cloudinary.uploader.destroy(existingService.image_public_id);
        logger.info(`Deleted old Cloudinary image: ${existingService.image_public_id}`);
      } catch (cloudinaryError) {
        logger.warn(`Failed to delete old image: ${cloudinaryError.message}`);
      }
    }

    // Upload new image to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'services',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const uploadResult = await uploadPromise;

    // Update service with image data
    const { data: updatedService, error: updateError } = await supabaseClient
      .from("services")
      .update({
        image_url: uploadResult.secure_url,
        image_public_id: uploadResult.public_id,
        image_upload_date: new Date().toISOString(),
        updated_by: userId
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      logger.error("Error updating service with image data:", updateError);
      // Try to cleanup the uploaded image
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      } catch (cleanupError) {
        logger.warn(`Failed to cleanup uploaded image: ${cleanupError.message}`);
      }
      
      return res.status(500).json({
        success: false,
        error: "Errore nell'aggiornamento del servizio",
        code: "UPDATE_SERVICE_ERROR"
      });
    }

    logger.info(`Successfully uploaded image for service: ${id}`);

    res.json({
      success: true,
      data: {
        service: updatedService,
        image: {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          upload_date: updatedService.image_upload_date
        }
      },
      message: "Immagine caricata con successo"
    });

  } catch (error) {
    logger.error("Unexpected error in upload service image endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

/**
 * DELETE /api/services/admin/:id/image
 * Admin endpoint - Delete service image
 */
router.delete("/admin/:id/image", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    logger.info(`Admin ${req.user.username} deleting image for service: ${id}`);

    // Get service with image data
    const { data: service, error: fetchError } = await supabaseClient
      .from("services")
      .select("id, title, image_public_id, image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: "Servizio non trovato",
          code: "SERVICE_NOT_FOUND"
        });
      }
      
      logger.error("Error fetching service for image deletion:", fetchError);
      return res.status(500).json({
        success: false,
        error: "Errore nel recupero del servizio",
        code: "FETCH_SERVICE_ERROR"
      });
    }

    if (!service.image_public_id) {
      return res.status(400).json({
        success: false,
        error: "Il servizio non ha un'immagine associata",
        code: "NO_IMAGE_FOUND"
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(service.image_public_id);
      logger.info(`Successfully deleted Cloudinary image: ${service.image_public_id}`);
    } catch (cloudinaryError) {
      logger.error(`Failed to delete Cloudinary image: ${cloudinaryError.message}`);
      return res.status(500).json({
        success: false,
        error: "Errore nell'eliminazione dell'immagine",
        code: "CLOUDINARY_DELETE_ERROR"
      });
    }

    // Update service to remove image data
    const { data: updatedService, error: updateError } = await supabaseClient
      .from("services")
      .update({
        image_url: null,
        image_public_id: null,
        image_upload_date: null,
        updated_by: userId
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      logger.error("Error updating service after image deletion:", updateError);
      return res.status(500).json({
        success: false,
        error: "Errore nell'aggiornamento del servizio",
        code: "UPDATE_SERVICE_ERROR"
      });
    }

    logger.info(`Successfully deleted image for service: ${id}`);

    res.json({
      success: true,
      data: updatedService,
      message: "Immagine eliminata con successo"
    });

  } catch (error) {
    logger.error("Unexpected error in delete service image endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

/**
 * GET /api/services/admin/stats
 * Admin endpoint - Get services statistics
 */
router.get("/admin/stats", requireAuth, async (req, res) => {
  try {
    logger.info(`Admin ${req.user.username} fetching services statistics`);

    const { data: stats, error } = await supabaseClient
      .rpc('get_services_stats');

    if (error) {
      logger.error("Error fetching services stats:", error);
      return res.status(500).json({
        success: false,
        error: "Errore nel recupero delle statistiche",
        code: "FETCH_STATS_ERROR"
      });
    }

    res.json({
      success: true,
      data: stats || {}
    });

  } catch (error) {
    logger.error("Unexpected error in services stats endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
});

export default router;