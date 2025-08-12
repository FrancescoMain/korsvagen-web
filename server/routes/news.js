/**
 * NEWS API ROUTES
 * 
 * Gestisce tutte le API per il sistema di gestione news dinamico
 * Include endpoint pubblici per il frontend e endpoint admin per il dashboard
 * 
 * Public Endpoints:
 * - GET /api/news - Lista articoli pubblicati (con filtri)
 * - GET /api/news/categories - Lista categorie disponibili
 * - GET /api/news/:slug - Dettaglio articolo per slug
 * - GET /api/news/:slug/related - Articoli correlati
 * 
 * Admin Endpoints (richiede autenticazione):
 * - GET /api/news/admin/list - Lista completa articoli (admin)
 * - POST /api/news/admin - Crea nuovo articolo
 * - GET /api/news/admin/:id - Dettaglio articolo per modifica
 * - PUT /api/news/admin/:id - Aggiorna articolo
 * - DELETE /api/news/admin/:id - Elimina articolo
 * - POST /api/news/admin/:id/image - Upload immagine articolo
 * - DELETE /api/news/admin/:id/image - Elimina immagine articolo
 */

import express from 'express';
import { supabaseClient } from '../config/supabase.js';
import { cloudinaryConfig, cloudinary } from '../config/cloudinary.js';
import { verifyToken } from '../utils/auth.js';
import { logger } from '../utils/logger.js';
import multer from 'multer';

const router = express.Router();

// Configurazione multer per upload file
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo file immagine sono consentiti'), false);
    }
  }
});

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Genera slug da titolo
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[àáäâè|éëêì|íïîò|óöôù|úüûñç|ç]/g, (match) => {
      const map = {
        à: 'a', á: 'a', ä: 'a', â: 'a',
        è: 'e', é: 'e', ë: 'e', ê: 'e',
        ì: 'i', í: 'i', ï: 'i', î: 'i',
        ò: 'o', ó: 'o', ö: 'o', ô: 'o',
        ù: 'u', ú: 'u', ü: 'u', û: 'u',
        ñ: 'n', ç: 'c'
      };
      return map[match] || match;
    })
    .replace(/[^a-z0-9\s-]/g, '') // Rimuovi caratteri speciali
    .replace(/\s+/g, '-') // Sostituisci spazi con trattini
    .replace(/-+/g, '-') // Rimuovi trattini multipli
    .trim()
    .replace(/^-|-$/g, ''); // Rimuovi trattini all'inizio/fine
};

/**
 * Valida i dati dell'articolo
 */
const validateNewsData = (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = 'Titolo obbligatorio';
  }

  if (!data.category?.trim()) {
    errors.category = 'Categoria obbligatoria';
  }

  if (!data.content?.trim()) {
    errors.content = 'Contenuto obbligatorio';
  }

  if (!data.published_date) {
    errors.published_date = 'Data pubblicazione obbligatoria';
  }

  // Valida formato data
  if (data.published_date && isNaN(Date.parse(data.published_date))) {
    errors.published_date = 'Formato data non valido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===============================
// PUBLIC ENDPOINTS
// ===============================

/**
 * GET /api/news
 * Lista articoli pubblicati con opzioni di filtro
 * Query params: category, limit, page, featured
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      limit = 10,
      page = 1,
      featured
    } = req.query;

    let query = supabaseClient
      .from('news')
      .select('id, title, subtitle, slug, category, image_url, published_date, is_featured, views_count')
      .eq('is_published', true)
      .order('published_date', { ascending: false });

    // Filtro per categoria
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filtro per articoli in evidenza
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Paginazione
    const numericLimit = Math.min(parseInt(limit) || 10, 50); // Max 50 articoli per pagina
    const numericPage = Math.max(parseInt(page) || 1, 1);
    const offset = (numericPage - 1) * numericLimit;

    query = query.range(offset, offset + numericLimit - 1);

    const { data: news, error, count } = await query;

    if (error) {
      logger.error('Errore caricamento news:', error);
      return res.status(500).json({
        success: false,
        error: 'Errore durante il caricamento delle news',
        code: 'DATABASE_ERROR'
      });
    }

    // Formatta le date per il frontend
    const formattedNews = news.map(article => ({
      ...article,
      published_date: new Date(article.published_date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));

    res.json({
      success: true,
      data: formattedNews,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total: count || formattedNews.length,
        hasMore: formattedNews.length === numericLimit
      }
    });

  } catch (error) {
    logger.error('Errore endpoint GET /api/news:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/news/categories
 * Lista di tutte le categorie disponibili
 */
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabaseClient
      .from('news')
      .select('category')
      .eq('is_published', true);

    if (error) {
      logger.error('Errore caricamento categorie:', error);
      return res.status(500).json({
        success: false,
        error: 'Errore durante il caricamento delle categorie',
        code: 'DATABASE_ERROR'
      });
    }

    // Estrae categorie uniche
    const uniqueCategories = [...new Set(categories.map(item => item.category))];

    res.json({
      success: true,
      data: uniqueCategories
    });

  } catch (error) {
    logger.error('Errore endpoint GET /api/news/categories:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/news/:slug
 * Dettaglio completo articolo per slug
 * Include incremento contatore visualizzazioni
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Recupera articolo
    const { data: article, error } = await supabaseClient
      .from('news')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !article) {
      logger.warn(`Articolo non trovato per slug: ${slug}`);
      return res.status(404).json({
        success: false,
        error: 'Articolo non trovato',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Incrementa contatore visualizzazioni
    const { error: updateError } = await supabaseClient
      .from('news')
      .update({ views_count: (article.views_count || 0) + 1 })
      .eq('id', article.id);

    if (updateError) {
      logger.warn('Errore aggiornamento views_count:', updateError);
    }

    // Formatta data per frontend
    const formattedArticle = {
      ...article,
      published_date: new Date(article.published_date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      views_count: (article.views_count || 0) + 1
    };

    res.json({
      success: true,
      data: formattedArticle
    });

  } catch (error) {
    logger.error('Errore endpoint GET /api/news/:slug:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/news/:slug/related
 * Articoli correlati (stessa categoria, escluso quello corrente)
 */
router.get('/:slug/related', async (req, res) => {
  try {
    const { slug } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 4, 10);

    // Prima trova l'articolo corrente per ottenere la categoria
    const { data: currentArticle, error: currentError } = await supabaseClient
      .from('news')
      .select('id, category')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (currentError || !currentArticle) {
      logger.warn(`Articolo corrente non trovato per slug: ${slug}`);
      return res.status(404).json({
        success: false,
        error: 'Articolo non trovato',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Trova articoli correlati nella stessa categoria
    const { data: relatedNews, error: relatedError } = await supabaseClient
      .from('news')
      .select('id, title, subtitle, slug, category, image_url, published_date, is_featured')
      .eq('category', currentArticle.category)
      .neq('id', currentArticle.id)
      .eq('is_published', true)
      .order('published_date', { ascending: false })
      .limit(limit);

    if (relatedError) {
      logger.error('Errore caricamento articoli correlati:', relatedError);
      return res.status(500).json({
        success: false,
        error: 'Errore durante il caricamento degli articoli correlati',
        code: 'DATABASE_ERROR'
      });
    }

    // Formatta le date
    const formattedRelated = relatedNews.map(article => ({
      ...article,
      published_date: new Date(article.published_date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));

    res.json({
      success: true,
      data: formattedRelated
    });

  } catch (error) {
    logger.error('Errore endpoint GET /api/news/:slug/related:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
});

// ===============================
// ADMIN ENDPOINTS (AUTH REQUIRED)
// ===============================

/**
 * GET /api/news/admin/list
 * Lista completa articoli per admin (inclusi non pubblicati)
 */
router.get('/admin/list', verifyToken, async (req, res) => {
  try {
    const {
      category,
      published = 'all', // all, published, draft
      limit = 20,
      page = 1
    } = req.query;

    let query = supabaseClient
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtro per categoria
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filtro per stato pubblicazione
    if (published === 'published') {
      query = query.eq('is_published', true);
    } else if (published === 'draft') {
      query = query.eq('is_published', false);
    }

    // Paginazione
    const numericLimit = Math.min(parseInt(limit) || 20, 100);
    const numericPage = Math.max(parseInt(page) || 1, 1);
    const offset = (numericPage - 1) * numericLimit;

    query = query.range(offset, offset + numericLimit - 1);

    const { data: news, error, count } = await query;

    if (error) {
      logger.error('Errore caricamento news admin:', error);
      return res.status(500).json({
        success: false,
        error: 'Errore durante il caricamento delle news',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      data: news,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total: count || news.length,
        hasMore: news.length === numericLimit
      }
    });

  } catch (error) {
    logger.error('Errore endpoint GET /api/news/admin/list:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/news/admin
 * Crea nuovo articolo
 */
router.post('/admin', verifyToken, async (req, res) => {
  try {
    const newsData = req.body;

    // Validazione dati
    const validation = validateNewsData(newsData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Dati non validi',
        code: 'VALIDATION_ERROR',
        details: validation.errors
      });
    }

    // Genera slug se non fornito
    if (!newsData.slug) {
      newsData.slug = generateSlug(newsData.title);
    }

    // Verifica che lo slug sia unico
    const { data: existing } = await supabaseClient
      .from('news')
      .select('id')
      .eq('slug', newsData.slug)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Slug già esistente',
        code: 'SLUG_EXISTS'
      });
    }

    // Prepara dati per inserimento
    const insertData = {
      title: newsData.title.trim(),
      subtitle: newsData.subtitle?.trim() || null,
      slug: newsData.slug,
      category: newsData.category.trim(),
      content: newsData.content.trim(),
      published_date: newsData.published_date,
      is_published: newsData.is_published !== false, // Default true
      is_featured: newsData.is_featured === true // Default false
    };

    // Inserisci articolo
    const { data: newArticle, error } = await supabaseClient
      .from('news')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      logger.error('Errore creazione articolo:', error);
      return res.status(500).json({
        success: false,
        error: 'Errore durante la creazione dell\'articolo',
        code: 'DATABASE_ERROR'
      });
    }

    logger.info(`Nuovo articolo creato: "${newArticle.title}" (ID: ${newArticle.id})`);

    res.status(201).json({
      success: true,
      data: newArticle,
      message: 'Articolo creato con successo'
    });

  } catch (error) {
    logger.error('Errore endpoint POST /api/news/admin:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/news/admin/:id
 * Dettaglio articolo per modifica (admin)
 */
router.get('/admin/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: article, error } = await supabaseClient
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !article) {
      return res.status(404).json({
        success: false,
        error: 'Articolo non trovato',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: article
    });

  } catch (error) {
    logger.error('Errore endpoint GET /api/news/admin/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /api/news/admin/:id
 * Aggiorna articolo esistente
 */
router.put('/admin/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validazione dati (escludi slug se non modificato)
    const validation = validateNewsData(updateData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Dati non validi',
        code: 'VALIDATION_ERROR',
        details: validation.errors
      });
    }

    // Verifica che l'articolo esista
    const { data: existing } = await supabaseClient
      .from('news')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Articolo non trovato',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Se lo slug è cambiato, verifica univocità
    if (updateData.slug && updateData.slug !== existing.slug) {
      const { data: slugExists } = await supabaseClient
        .from('news')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', id)
        .single();

      if (slugExists) {
        return res.status(400).json({
          success: false,
          error: 'Slug già esistente',
          code: 'SLUG_EXISTS'
        });
      }
    }

    // Prepara dati per aggiornamento
    const cleanUpdateData = {
      ...updateData,
      title: updateData.title?.trim(),
      subtitle: updateData.subtitle?.trim() || null,
      category: updateData.category?.trim(),
      content: updateData.content?.trim(),
      updated_at: new Date().toISOString()
    };

    // Rimuovi campi undefined
    Object.keys(cleanUpdateData).forEach(key => {
      if (cleanUpdateData[key] === undefined) {
        delete cleanUpdateData[key];
      }
    });

    // Aggiorna articolo
    const { data: updatedArticle, error } = await supabaseClient
      .from('news')
      .update(cleanUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Errore aggiornamento articolo:', error);
      return res.status(500).json({
        success: false,
        error: 'Errore durante l\'aggiornamento dell\'articolo',
        code: 'DATABASE_ERROR'
      });
    }

    logger.info(`Articolo aggiornato: "${updatedArticle.title}" (ID: ${id})`);

    res.json({
      success: true,
      data: updatedArticle,
      message: 'Articolo aggiornato con successo'
    });

  } catch (error) {
    logger.error('Errore endpoint PUT /api/news/admin/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * DELETE /api/news/admin/:id
 * Elimina articolo
 */
router.delete('/admin/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Prima recupera info per cleanup immagini
    const { data: article } = await supabaseClient
      .from('news')
      .select('title, image_public_id')
      .eq('id', id)
      .single();

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Articolo non trovato',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Elimina da database
    const { error } = await supabaseClient
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Errore eliminazione articolo:', error);
      return res.status(500).json({
        success: false,
        error: 'Errore durante l\'eliminazione dell\'articolo',
        code: 'DATABASE_ERROR'
      });
    }

    // Cleanup immagine Cloudinary se presente
    if (article.image_public_id) {
      try {
        await cloudinary.uploader.destroy(article.image_public_id);
        logger.info(`Immagine Cloudinary eliminata: ${article.image_public_id}`);
      } catch (cloudinaryError) {
        logger.warn('Errore eliminazione immagine Cloudinary:', cloudinaryError);
      }
    }

    logger.info(`Articolo eliminato: "${article.title}" (ID: ${id})`);

    res.status(200).json({
      success: true,
      message: 'Articolo eliminato con successo'
    });

  } catch (error) {
    logger.error('Errore endpoint DELETE /api/news/admin/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/news/admin/:id/image
 * Upload immagine per articolo
 */
router.post('/admin/:id/image', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file immagine fornito',
        code: 'NO_FILE'
      });
    }

    // Verifica che l'articolo esista
    const { data: article } = await supabaseClient
      .from('news')
      .select('id, title, image_public_id')
      .eq('id', id)
      .single();

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Articolo non trovato',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Upload su Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder: 'news',
        public_id: `news_${id}_${Date.now()}`,
        transformation: [
          { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });

      stream.end(req.file.buffer);
    });

    // Elimina vecchia immagine se presente
    if (article.image_public_id) {
      try {
        await cloudinary.uploader.destroy(article.image_public_id);
      } catch (cloudinaryError) {
        logger.warn('Errore eliminazione vecchia immagine:', cloudinaryError);
      }
    }

    // Aggiorna database con nuova immagine
    const { data: updatedArticle, error: updateError } = await supabaseClient
      .from('news')
      .update({
        image_url: uploadResult.secure_url,
        image_public_id: uploadResult.public_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Errore aggiornamento immagine nel database:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Errore durante l\'aggiornamento dell\'immagine',
        code: 'DATABASE_ERROR'
      });
    }

    logger.info(`Immagine caricata per articolo: "${article.title}" (ID: ${id})`);

    res.json({
      success: true,
      data: {
        image_url: uploadResult.secure_url,
        image_public_id: uploadResult.public_id
      },
      message: 'Immagine caricata con successo'
    });

  } catch (error) {
    logger.error('Errore endpoint POST /api/news/admin/:id/image:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il caricamento dell\'immagine',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * DELETE /api/news/admin/:id/image
 * Elimina immagine articolo
 */
router.delete('/admin/:id/image', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Recupera info immagine
    const { data: article } = await supabaseClient
      .from('news')
      .select('id, title, image_public_id')
      .eq('id', id)
      .single();

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Articolo non trovato',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    if (!article.image_public_id) {
      return res.status(400).json({
        success: false,
        error: 'Nessuna immagine da eliminare',
        code: 'NO_IMAGE'
      });
    }

    // Elimina immagine da Cloudinary
    try {
      await cloudinary.uploader.destroy(article.image_public_id);
    } catch (cloudinaryError) {
      logger.warn('Errore eliminazione immagine Cloudinary:', cloudinaryError);
    }

    // Rimuovi riferimenti immagine dal database
    const { error: updateError } = await supabaseClient
      .from('news')
      .update({
        image_url: null,
        image_public_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Errore rimozione immagine dal database:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Errore durante la rimozione dell\'immagine',
        code: 'DATABASE_ERROR'
      });
    }

    logger.info(`Immagine eliminata per articolo: "${article.title}" (ID: ${id})`);

    res.json({
      success: true,
      message: 'Immagine eliminata con successo'
    });

  } catch (error) {
    logger.error('Errore endpoint DELETE /api/news/admin/:id/image:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;