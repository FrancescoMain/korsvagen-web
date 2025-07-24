/**
 * VERCEL SERVERLESS FUNCTION - AUTH LOGIN
 * 
 * Endpoint di login compatibile con Vercel serverless functions
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

// Inizializza Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // Configura CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e password sono richiesti'
      });
    }

    // Verifica credenziali nel database
    const { data: admins, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('active', true);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Errore del server'
      });
    }

    if (!admins || admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }

    const admin = admins[0];

    // Verifica password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenziali non valide'
      });
    }

    // Genera JWT token
    const accessToken = jwt.sign(
      {
        userId: admin.id,
        email: admin.email,
        role: admin.role,
        aud: 'korsvagen-users'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      {
        userId: admin.id,
        type: 'refresh',
        aud: 'korsvagen-users'
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Aggiorna ultimo login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    return res.status(200).json({
      success: true,
      message: 'Login effettuato con successo',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
}
