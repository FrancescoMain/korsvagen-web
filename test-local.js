import dotenv from 'dotenv';
import { getSupabase, checkDatabaseHealth } from './api/utils/database.js';

// Load environment variables
dotenv.config();

console.log('🧪 Test del sistema in locale...\n');

async function testLocal() {
  try {
    // 1. Test connessione database
    console.log('📡 Test connessione Supabase...');
    const supabase = getSupabase();
    console.log('✅ Client Supabase inizializzato');

    // 2. Test health check
    console.log('\n🏥 Test health check...');
    const health = await checkDatabaseHealth();
    console.log('Health status:', health);

    // 3. Test esistenza tabelle
    console.log('\n📋 Test esistenza tabelle...');
    const tables = ['pages', 'sections', 'media', 'users'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: tabella esistente`);
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
      }
    }

    // 4. Test Cloudinary vars
    console.log('\n☁️ Test variabili Cloudinary...');
    const cloudinaryVars = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];
    
    for (const varName of cloudinaryVars) {
      if (process.env[varName]) {
        console.log(`✅ ${varName}: configurata`);
      } else {
        console.log(`❌ ${varName}: mancante`);
      }
    }

    // 5. Test JWT secret
    console.log('\n🔐 Test JWT secret...');
    if (process.env.JWT_SECRET) {
      console.log('✅ JWT_SECRET: configurato');
    } else {
      console.log('❌ JWT_SECRET: mancante');
    }

    console.log('\n🎉 Test completato!');
    
  } catch (error) {
    console.error('\n💥 Errore durante il test:', error.message);
  }
}

testLocal();
