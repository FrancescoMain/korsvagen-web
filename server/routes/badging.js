import { supabaseAdmin } from '../config/supabase.js';
import { verifyToken } from '../utils/auth.js';
import { createBadgeRouter } from '../badging/router.js';

export default createBadgeRouter({
  db: supabaseAdmin,
  secret: process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET,
  verifyAdminToken: verifyToken,
});
