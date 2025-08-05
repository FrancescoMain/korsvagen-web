/**
 * ROUTES TEAM - API endpoints per gestione team aziendale
 *
 * Gestisce tutti i membri del team con informazioni complete e CV
 * Include funzionalità CRUD complete e upload/download CV
 *
 * Endpoints disponibili:
 * - GET /api/team/public - Tutti i membri per pagina pubblica
 * - GET /api/team - Tutti i membri per admin (admin only)
 * - GET /api/team/:id - Singolo membro per admin (admin only)
 * - POST /api/team - Crea nuovo membro (admin only)
 * - PUT /api/team/:id - Aggiorna membro (admin only)
 * - DELETE /api/team/:id - Elimina membro (admin only)
 * - POST /api/team/:id/cv - Carica CV (admin only)
 * - GET /api/team/:id/cv - Download CV (pubblico se membro attivo)
 * - DELETE /api/team/:id/cv - Elimina CV (admin only)
 * - PUT /api/team/reorder - Riordina membri (admin only)
 *
 * @author KORSVAGEN S.R.L.
 */

import express from "express";
import { body, param, validationResult } from "express-validator";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth, requireRole } from "../utils/auth.js";
import { supabaseClient } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Configurazione multer per upload CV
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Solo PDF
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo file PDF sono permessi per i CV"), false);
    }
  },
});

/**
 * VALIDAZIONI
 */
const validateTeamMember = [
  body("name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve essere tra 2 e 100 caratteri"),
  body("role")
    .isLength({ min: 2, max: 100 })
    .withMessage("Ruolo deve essere tra 2 e 100 caratteri"),
  body("placeholder")
    .matches(/^[A-Z]{1,4}$/)
    .withMessage("Placeholder deve essere 1-4 lettere maiuscole"),
  body("short_description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Descrizione breve max 500 caratteri"),
  body("full_description")
    .optional()
    .isLength({ max: 3000 })
    .withMessage("Descrizione completa max 3000 caratteri"),
  body("experience")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Esperienza max 200 caratteri"),
  body("education")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Formazione max 1000 caratteri"),
  body("skills")
    .optional()
    .isArray()
    .withMessage("Skills deve essere un array"),
  body("skills.*")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Ogni skill deve essere tra 1 e 100 caratteri"),
  body("display_order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Ordine visualizzazione deve essere un numero >= 0"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active deve essere true o false"),
];

const validateReorder = [
  body("memberIds")
    .isArray({ min: 1 })
    .withMessage("memberIds deve essere un array non vuoto"),
  body("memberIds.*")
    .isUUID()
    .withMessage("Ogni ID deve essere un UUID valido"),
];

/**
 * GET /api/team/status
 * Verifica lo stato del database team (pubblico per debugging)
 */
router.get("/status", async (req, res) => {
  try {
    logger.info("Verifica stato database team");

    // Test connessione base
    let membersTest, skillsTest, membersCount = 0, skillsCount = 0;
    
    try {
      const { data: members, error: membersError } = await supabaseClient
        .from("team_members") 
        .select("id, name, role, is_active")
        .limit(5);
      
      membersTest = { data: members, error: membersError };
      membersCount = members?.length || 0;
    } catch (err) {
      membersTest = { data: null, error: err.message };
    }

    try {
      const { data: skills, error: skillsError } = await supabaseClient
        .from("team_member_skills")
        .select("team_member_id, skill_name")
        .limit(5);
      
      skillsTest = { data: skills, error: skillsError };
      skillsCount = skills?.length || 0;
    } catch (err) {
      skillsTest = { data: null, error: err.message };
    }

    const status = {
      database_connected: true,
      tables: {
        team_members: {
          exists: !membersTest.error || membersTest.error.code !== '42P01',
          count: membersCount,
          error: membersTest.error?.message || null,
          sample_data: membersTest.data?.slice(0, 2) || []
        },
        team_member_skills: {
          exists: !skillsTest.error || skillsTest.error.code !== '42P01', 
          count: skillsCount,
          error: skillsTest.error?.message || null
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      status: status
    });

  } catch (error) {
    logger.error("Errore verifica stato database:", error);
    res.status(500).json({
      success: false,
      message: "Errore verifica database",
      error: error.message
    });
  }
});

/**
 * GET /api/team/public
 * Recupera tutti i membri attivi per la pagina pubblica
 */
router.get("/public", async (req, res) => {
  try {
    logger.info("Richiesta membri team pubblici");

    const { data: members, error } = await supabaseClient
      .from("team_members_complete")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (error) {
      logger.error("Errore database recupero membri team pubblici:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    // Rimuovi campi sensibili per la versione pubblica
    const publicMembers = members.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      short_description: member.short_description,
      full_description: member.full_description,
      placeholder: member.placeholder,
      experience: member.experience,
      education: member.education,
      skills: member.skills,
      display_order: member.display_order,
      // Include solo se c'è un CV caricato
      has_cv: !!member.cv_file_url,
    }));

    logger.info(`Recuperati ${publicMembers.length} membri team pubblici`);

    res.json({
      success: true,
      data: publicMembers
    });

  } catch (error) {
    logger.error("Errore recupero membri team pubblici:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "TEAM_FETCH_ERROR"
    });
  }
});

/**
 * GET /api/team
 * Recupera tutti i membri per admin (inclusi non attivi)
 */
router.get("/", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    logger.info(`Admin ${req.user.email} richiede lista membri team`);

    const { data: members, error } = await supabaseClient
      .from("team_members_complete")
      .select("*")
      .order("display_order");

    if (error) {
      logger.error("Errore database recupero membri team admin:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Recuperati ${members.length} membri team per admin`);

    res.json({
      success: true,
      data: members
    });

  } catch (error) {
    logger.error("Errore recupero membri team admin:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "TEAM_FETCH_ERROR"
    });
  }
});

/**
 * GET /api/team/:id
 * Recupera singolo membro per admin
 */
router.get("/:id", requireAuth, requireRole(["admin", "editor", "super_admin"]), 
  param("id").isUUID().withMessage("ID deve essere un UUID valido"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "ID non valido",
          errors: errors.array()
        });
      }

      const { id } = req.params;
      logger.info(`Admin ${req.user.email} richiede membro team ${id}`);

      const { data: member, error } = await supabaseClient
        .from("team_members_complete")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return res.status(404).json({
            success: false,
            message: "Membro del team non trovato",
            code: "MEMBER_NOT_FOUND"
          });
        }
        logger.error("Errore database recupero membro team:", error);
        return res.status(500).json({
          success: false,
          message: "Errore interno del server",
          code: "DATABASE_ERROR"
        });
      }

      logger.info("Membro team recuperato con successo");

      res.json({
        success: true,
        data: member
      });

    } catch (error) {
      logger.error("Errore recupero membro team:", error);
      res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "TEAM_MEMBER_FETCH_ERROR"
      });
    }
  }
);

/**
 * POST /api/team
 * Crea nuovo membro del team
 */
router.post("/", requireAuth, requireRole(["admin", "editor", "super_admin"]), 
  validateTeamMember, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dati non validi",
          errors: errors.array()
        });
      }

      logger.info(`Admin ${req.user.email} crea nuovo membro team`);

      const { skills, ...memberData } = req.body;

      // Aggiungi metadata
      const newMemberData = {
        ...memberData,
        created_by: req.user.id,
        updated_by: req.user.id
      };

      // Inserisci membro
      const { data: member, error: memberError } = await supabaseClient
        .from("team_members")
        .insert(newMemberData)
        .select()
        .single();

      if (memberError) {
        logger.error("Errore inserimento membro team:", memberError);
        return res.status(500).json({
          success: false,
          message: "Errore durante la creazione del membro",
          code: "DATABASE_ERROR"
        });
      }

      // Inserisci skills se presenti
      if (skills && skills.length > 0) {
        const skillsData = skills.map((skill, index) => ({
          team_member_id: member.id,
          skill_name: skill,
          display_order: index + 1
        }));

        const { error: skillsError } = await supabaseClient
          .from("team_member_skills")
          .insert(skillsData);

        if (skillsError) {
          logger.error("Errore inserimento skills:", skillsError);
          // Non fare rollback, ma logga l'errore
        }
      }

      // Recupera il membro completo
      const { data: completeMember, error: fetchError } = await supabaseClient
        .from("team_members_complete")
        .select("*")
        .eq("id", member.id)
        .single();

      if (fetchError) {
        logger.error("Errore recupero membro completo:", fetchError);
        return res.status(500).json({
          success: false,
          message: "Membro creato ma errore nel recupero dati",
          code: "FETCH_ERROR"
        });
      }

      logger.info(`Membro team ${member.name} creato con successo`);

      res.status(201).json({
        success: true,
        message: "Membro del team creato con successo",
        data: completeMember
      });

    } catch (error) {
      logger.error("Errore creazione membro team:", error);
      res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "TEAM_MEMBER_CREATE_ERROR"
      });
    }
  }
);

/**
 * PUT /api/team/:id
 * Aggiorna membro del team
 */
router.put("/:id", requireAuth, requireRole(["admin", "editor", "super_admin"]),
  param("id").isUUID().withMessage("ID deve essere un UUID valido"),
  validateTeamMember, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dati non validi",
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { skills, ...memberData } = req.body;
      
      logger.info(`Admin ${req.user.email} aggiorna membro team ${id}`);

      // Verifica esistenza membro (senza .single() per evitare PGRST116)
      const { data: existingMembers, error: checkError } = await supabaseClient
        .from("team_members")
        .select("id, name")
        .eq("id", id);

      if (checkError) {
        logger.error("Errore controllo esistenza membro:", checkError);
        return res.status(500).json({
          success: false,
          message: "Errore interno del server durante controllo esistenza",
          code: "DATABASE_ERROR"
        });
      }

      if (!existingMembers || existingMembers.length === 0) {
        logger.error(`Membro team non trovato per aggiornamento: ${id}`);
        return res.status(404).json({
          success: false,
          message: "Membro del team non trovato",
          code: "MEMBER_NOT_FOUND"
        });
      }

      const existingMember = existingMembers[0];
      logger.info(`Aggiornamento membro: ${existingMember.name}`);

      // Aggiorna membro
      const updateData = {
        ...memberData,
        updated_by: req.user.id
      };

      const { data: members, error: updateError } = await supabaseClient
        .from("team_members")
        .update(updateData)
        .eq("id", id)
        .select();

      if (updateError) {
        logger.error("Errore aggiornamento membro team:", updateError);
        return res.status(500).json({
          success: false,
          message: "Errore durante l'aggiornamento del membro",
          code: "DATABASE_ERROR"
        });
      }

      // Aggiorna skills se presenti
      if (skills !== undefined) {
        // Elimina skills esistenti
        await supabaseClient
          .from("team_member_skills")
          .delete()
          .eq("team_member_id", id);

        // Inserisci nuove skills
        if (skills.length > 0) {
          const skillsData = skills.map((skill, index) => ({
            team_member_id: id,
            skill_name: skill,
            display_order: index + 1
          }));

          const { error: skillsError } = await supabaseClient
            .from("team_member_skills")
            .insert(skillsData);

          if (skillsError) {
            logger.error("Errore aggiornamento skills:", skillsError);
          }
        }
      }

      // Recupera il membro completo aggiornato
      const { data: completeMembers, error: fetchError } = await supabaseClient
        .from("team_members_complete")
        .select("*")
        .eq("id", id);

      if (fetchError) {
        logger.error("Errore recupero membro aggiornato:", fetchError);
        return res.status(500).json({
          success: false,
          message: "Membro aggiornato ma errore nel recupero dati",
          code: "FETCH_ERROR"
        });
      }

      const completeMember = completeMembers?.[0];
      if (!completeMember) {
        logger.error("Membro aggiornato ma non trovano nella vista completa:", id);
        return res.status(500).json({
          success: false,
          message: "Membro aggiornato ma errore nel recupero dati completi",
          code: "FETCH_ERROR"
        });
      }

      logger.info(`Membro team ${existingMember.name} aggiornato con successo`);

      res.json({
        success: true,
        message: "Membro del team aggiornato con successo",
        data: completeMember
      });

    } catch (error) {
      logger.error("Errore aggiornamento membro team:", error);
      res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "TEAM_MEMBER_UPDATE_ERROR"
      });
    }
  }
);

/**
 * DELETE /api/team/:id
 * Elimina membro del team
 */
router.delete("/:id", requireAuth, requireRole(["admin", "super_admin"]),
  param("id").isUUID().withMessage("ID deve essere un UUID valido"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "ID non valido",
          errors: errors.array()
        });
      }

      const { id } = req.params;
      logger.info(`Admin ${req.user.email} elimina membro team ${id}`);

      // Recupera dati membro per eliminare CV da Cloudinary
      const { data: member, error: fetchError } = await supabaseClient
        .from("team_members")
        .select("name, cv_file_url")
        .eq("id", id)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          return res.status(404).json({
            success: false,
            message: "Membro del team non trovato",
            code: "MEMBER_NOT_FOUND"
          });
        }
        logger.error("Errore recupero membro per eliminazione:", fetchError);
        return res.status(500).json({
          success: false,
          message: "Errore interno del server",
          code: "DATABASE_ERROR"
        });
      }

      // Elimina CV da Cloudinary se presente
      if (member.cv_file_url) {
        try {
          // Estrai il public_id dall'URL Cloudinary
          const urlParts = member.cv_file_url.split('/');
          const vIndex = urlParts.findIndex(part => part.startsWith('v'));
          let publicId = '';
          
          if (vIndex !== -1 && vIndex < urlParts.length - 1) {
            // Tutto dopo v{timestamp} è il public_id completo
            publicId = urlParts.slice(vIndex + 1).join('/').replace('.pdf', '');
          }
          
          logger.info(`Eliminando CV membro con public_id: ${publicId}`);
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw" // Consistente con nuovo approccio raw per PDF
          });
          logger.info("CV eliminato da Cloudinary");
        } catch (cloudinaryError) {
          logger.error("Errore eliminazione CV da Cloudinary:", cloudinaryError);
          // Non bloccare l'eliminazione del membro
        }
      }

      // Elimina membro (le skills vengono eliminate automaticamente per CASCADE)
      const { error: deleteError } = await supabaseClient
        .from("team_members")
        .delete()
        .eq("id", id);

      if (deleteError) {
        logger.error("Errore eliminazione membro team:", deleteError);
        return res.status(500).json({
          success: false,
          message: "Errore durante l'eliminazione del membro",
          code: "DATABASE_ERROR"
        });
      }

      logger.info(`Membro team ${member.name} eliminato con successo`);

      res.json({
        success: true,
        message: "Membro del team eliminato con successo"
      });

    } catch (error) {
      logger.error("Errore eliminazione membro team:", error);
      res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "TEAM_MEMBER_DELETE_ERROR"
      });
    }
  }
);

/**
 * POST /api/team/:id/cv
 * Carica CV per membro del team
 */
router.post("/:id/cv", requireAuth, requireRole(["admin", "editor", "super_admin"]),
  param("id").isUUID().withMessage("ID deve essere un UUID valido"),
  upload.single("cv"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "ID non valido",
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Nessun file CV caricato",
          code: "NO_FILE"
        });
      }

      const { id } = req.params;
      logger.info(`Admin ${req.user.email} carica CV per membro ${id}`);

      // Verifica esistenza membro (senza .single() per evitare PGRST116)
      const { data: members, error: checkError } = await supabaseClient
        .from("team_members")
        .select("name, cv_file_url")
        .eq("id", id);

      if (checkError) {
        logger.error("Errore controllo esistenza membro per CV upload:", checkError);
        return res.status(500).json({
          success: false,
          message: "Errore interno del server durante la verifica del membro",
          code: "DATABASE_ERROR"
        });
      }

      if (!members || members.length === 0) {
        logger.error("Membro non trovato per CV upload:", id);
        return res.status(404).json({
          success: false,
          message: "Membro del team non trovato. Assicurati che il membro esista prima di caricare il CV.",
          code: "MEMBER_NOT_FOUND"
        });
      }

      const member = members[0];
      logger.info(`CV upload per membro: ${member.name}`);

      // Elimina CV esistente da Cloudinary se presente
      if (member.cv_file_url) {
        try {
          // Estrai il public_id dall'URL Cloudinary
          const urlParts = member.cv_file_url.split('/');
          const vIndex = urlParts.findIndex(part => part.startsWith('v'));
          let publicId = '';
          
          if (vIndex !== -1 && vIndex < urlParts.length - 1) {
            // Tutto dopo v{timestamp} è il public_id completo
            publicId = urlParts.slice(vIndex + 1).join('/').replace('.pdf', '');
          }
          
          logger.info(`Eliminando CV precedente con public_id: ${publicId}`);
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw" // Cambio da "image" a "raw" per consistenza con upload
          });
          logger.info("CV precedente eliminato da Cloudinary");
        } catch (cloudinaryError) {
          logger.error("Errore eliminazione CV precedente:", cloudinaryError);
        }
      }

      // Upload nuovo CV a Cloudinary configurato per accesso pubblico diretto
      const timestamp = Date.now();
      const filename = `${member.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.pdf`;
      
      logger.info(`Iniziando upload CV: ${filename}, dimensione: ${req.file.size} bytes`);
      
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "raw", // Cambio da "image" a "raw" per supporto PDF completo
            public_id: `team-cvs/${filename.replace('.pdf', '')}`, // Rimuovi estensione dal public_id
            use_filename: false,
            unique_filename: false,
            type: "upload",
            invalidate: true,
            overwrite: true
          },
          (error, result) => {
            if (error) {
              logger.error("Errore upload Cloudinary:", error);
              logger.error("Dettagli errore Cloudinary:", JSON.stringify(error, null, 2));
              reject(error);
            } else {
              logger.info(`CV caricato con successo: ${result.secure_url}`);
              logger.info(`Cloudinary public_id: ${result.public_id}`);
              logger.info(`Cloudinary format: ${result.format}`);
              logger.info(`Cloudinary resource_type: ${result.resource_type}`);
              logger.info(`Public ID usato nell'upload: team-cvs/${filename}`);
              logger.info(`Public ID restituito da Cloudinary: ${result.public_id}`);
              resolve(result);
            }
          }
        ).end(req.file.buffer);
      });

      // Aggiorna database con info CV
      const { data: updatedMember, error: updateError } = await supabaseClient
        .from("team_members")
        .update({
          cv_file_name: req.file.originalname,
          cv_file_url: uploadResult.secure_url,
          cv_file_size: req.file.size,
          cv_upload_date: new Date().toISOString(),
          updated_by: req.user.id
          // Nota: cv_public_id rimosso temporaneamente - campo non esiste nel DB
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        logger.error("Errore aggiornamento dati CV:", updateError);
        return res.status(500).json({
          success: false,
          message: "CV caricato ma errore nell'aggiornamento database",
          code: "DATABASE_ERROR"
        });
      }

      logger.info(`CV caricato con successo per ${member.name}`);

      res.json({
        success: true,
        message: "CV caricato con successo",
        data: {
          cv_file_name: updatedMember.cv_file_name,
          cv_file_url: updatedMember.cv_file_url,
          cv_file_size: updatedMember.cv_file_size,
          cv_upload_date: updatedMember.cv_upload_date
        }
      });

    } catch (error) {
      logger.error("Errore caricamento CV:", error);
      res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "CV_UPLOAD_ERROR"
      });
    }
  }
);

/**
 * GET /api/team/:id/cv
 * Download CV (pubblico se membro attivo)
 */
router.get("/:id/cv", 
  param("id").isUUID().withMessage("ID deve essere un UUID valido"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "ID non valido",
          errors: errors.array()
        });
      }

      const { id } = req.params;
      logger.info(`Richiesta download CV per membro ${id}`);

      // Recupera info membro e CV
      const { data: member, error } = await supabaseClient
        .from("team_members")
        .select("name, cv_file_name, cv_file_url, is_active")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return res.status(404).json({
            success: false,
            message: "Membro del team non trovato",
            code: "MEMBER_NOT_FOUND"
          });
        }
        logger.error("Errore recupero dati membro per CV:", error);
        return res.status(500).json({
          success: false,
          message: "Errore interno del server",
          code: "DATABASE_ERROR"
        });
      }

      // Verifica se membro è attivo (per accesso pubblico)
      if (!member.is_active) {
        return res.status(404).json({
          success: false,
          message: "CV non disponibile",
          code: "CV_NOT_AVAILABLE"
        });
      }

      if (!member.cv_file_url) {
        return res.status(404).json({
          success: false,
          message: "CV non trovato per questo membro",
          code: "CV_NOT_FOUND"
        });
      }

      // Forza download diretto usando Cloudinary API con parametri di download
      const downloadUrl = member.cv_file_url.includes('?') 
        ? `${member.cv_file_url}&fl_attachment=${encodeURIComponent(member.cv_file_name || `CV_${member.name}.pdf`)}`
        : `${member.cv_file_url}?fl_attachment=${encodeURIComponent(member.cv_file_name || `CV_${member.name}.pdf`)}`;
      
      logger.info(`Download CV per ${member.name} -> ${downloadUrl}`);
      
      // Redirect con parametri per forzare download
      res.redirect(302, downloadUrl);

    } catch (error) {
      logger.error("Errore download CV:", error);
      res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "CV_DOWNLOAD_ERROR"
      });
    }
  }
);

/**
 * DELETE /api/team/:id/cv
 * Elimina CV membro del team
 */
router.delete("/:id/cv", requireAuth, requireRole(["admin", "editor", "super_admin"]),
  param("id").isUUID().withMessage("ID deve essere un UUID valido"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "ID non valido",
          errors: errors.array()
        });
      }

      const { id } = req.params;
      logger.info(`Admin ${req.user.email} elimina CV per membro ${id}`);

      // Recupera info CV
      const { data: member, error: fetchError } = await supabaseClient
        .from("team_members")
        .select("name, cv_file_url")
        .eq("id", id)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          return res.status(404).json({
            success: false,
            message: "Membro del team non trovato",
            code: "MEMBER_NOT_FOUND"
          });
        }
        logger.error("Errore recupero membro per eliminazione CV:", fetchError);
        return res.status(500).json({
          success: false,
          message: "Errore interno del server",
          code: "DATABASE_ERROR"
        });
      }

      if (!member.cv_file_url) {
        return res.status(404).json({
          success: false,
          message: "CV non trovato per questo membro",
          code: "CV_NOT_FOUND"
        });
      }

      // Elimina da Cloudinary
      try {
        // Estrai il public_id dall'URL Cloudinary
        const urlParts = member.cv_file_url.split('/');
        const vIndex = urlParts.findIndex(part => part.startsWith('v'));
        let publicId = '';
        
        if (vIndex !== -1 && vIndex < urlParts.length - 1) {
          // Tutto dopo v{timestamp} è il public_id completo
          publicId = urlParts.slice(vIndex + 1).join('/').replace('.pdf', '');
        }
        
        logger.info(`Eliminando CV con public_id: ${publicId}`);
        const deleteResult = await cloudinary.uploader.destroy(publicId, {
          resource_type: "raw" // Consistente con nuovo approccio raw per PDF
        });
        logger.info(`CV eliminato da Cloudinary, risultato: ${deleteResult.result}`);
      } catch (cloudinaryError) {
        logger.error("Errore eliminazione CV da Cloudinary:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Errore eliminazione CV da storage",
          code: "CLOUDINARY_ERROR"
        });
      }

      // Rimuovi riferimenti CV dal database
      const { error: updateError } = await supabaseClient
        .from("team_members")
        .update({
          cv_file_name: null,
          cv_file_url: null,
          cv_file_size: null,
          cv_upload_date: null,
          updated_by: req.user.id
        })
        .eq("id", id);

      if (updateError) {
        logger.error("Errore aggiornamento database eliminazione CV:", updateError);
        return res.status(500).json({
          success: false,
          message: "CV eliminato ma errore aggiornamento database",
          code: "DATABASE_ERROR"
        });
      }

      logger.info(`CV eliminato con successo per ${member.name}`);

      res.json({
        success: true,
        message: "CV eliminato con successo"
      });

    } catch (error) {
      logger.error("Errore eliminazione CV:", error);
      res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "CV_DELETE_ERROR"
      });
    }
  }
);

/**
 * PUT /api/team/reorder
 * Riordina membri del team
 */
router.put("/reorder", requireAuth, requireRole(["admin", "editor", "super_admin"]),
  validateReorder, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dati non validi",
          errors: errors.array()
        });
      }

      const { memberIds } = req.body;
      logger.info(`Admin ${req.user.email} riordina ${memberIds.length} membri team`);

      // Aggiorna ordine per ogni membro
      const updates = memberIds.map((memberId, index) => 
        supabaseClient
          .from("team_members")
          .update({ 
            display_order: index + 1,
            updated_by: req.user.id 
          })
          .eq("id", memberId)
      );

      const results = await Promise.all(updates);

      // Verifica errori
      const updateErrors = results.filter(result => result.error);
      if (updateErrors.length > 0) {
        logger.error("Errori durante riordinamento:", updateErrors);
        return res.status(500).json({
          success: false,
          message: "Errore durante il riordinamento",
          code: "REORDER_ERROR"
        });
      }

      logger.info("Membri team riordinati con successo");

      res.json({
        success: true,
        message: "Ordine membri aggiornato con successo"
      });

    } catch (error) {
      logger.error("Errore riordinamento membri team:", error);
      res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "TEAM_REORDER_ERROR"
      });
    }
  }
);

export default router;