/**
 * MIGRATION SCRIPT - Import static projects to dynamic system
 * 
 * This script migrates the existing static project data from the frontend
 * into the new dynamic projects database system.
 * 
 * Usage:
 * node migrate-projects.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Static project data from the frontend (extracted from ProjectsPage.tsx)
const staticProjects = [
  {
    title: "Villa Residenziale Moderna",
    subtitle: "Progetto residenziale di lusso",
    year: 2024,
    location: "Milano, Italia",
    status: "Completato",
    label: "residenziale",
    description: "Progettazione e costruzione di villa unifamiliare con design contemporaneo e soluzioni tecnologiche avanzate.",
    long_description: `
      Questo progetto rappresenta l'eccellenza nell'architettura residenziale moderna. La villa, situata in una zona esclusiva di Milano, 
      combina design contemporaneo con sostenibilità ambientale.
      
      Il progetto ha previsto la realizzazione di una villa unifamiliare di 450 mq su tre livelli, caratterizzata da ampi spazi aperti, 
      grandi vetrate e un perfetto equilibrio tra interno ed esterno. L'utilizzo di materiali sostenibili e tecnologie innovative 
      ha permesso di ottenere la certificazione energetica A+.
      
      La villa è dotata di un sistema domotico avanzato che consente il controllo totale di illuminazione, climatizzazione, sicurezza 
      e entertainment. Il giardino è stato progettato con essenze autoctone e un sistema di irrigazione intelligente.
    `,
    client: "Famiglia Bianchi",
    surface: "450 mq",
    budget: "€ 950.000",
    duration: "18 mesi",
    features: [
      "Design sostenibile",
      "Domotica avanzata", 
      "Certificazione energetica A+",
      "Giardino paesaggistico",
      "Pannelli solari integrati",
      "Sistema geotermico",
      "Piscina infinity",
      "Garage per 3 auto"
    ],
    is_active: true,
    display_order: 1
  },
  {
    title: "Centro Commerciale Metropolitan",
    subtitle: "Complesso commerciale multifunzionale",
    year: 2023,
    location: "Roma, Italia",
    status: "Completato",
    label: "commerciale",
    description: "Realizzazione di complesso commerciale multifunzionale con aree retail, uffici e spazi comuni innovativi.",
    long_description: `
      Il Centro Commerciale Metropolitan rappresenta una nuova concezione di shopping center, dove il commercio si integra 
      con servizi, uffici e spazi di socializzazione in un ambiente architettonicamente all'avanguardia.
      
      Il progetto si sviluppa su una superficie di 25.000 mq distribuiti su 4 livelli, ospitando oltre 150 negozi, 
      20 ristoranti, un cinema multisala da 12 sale, spazi uffici e aree dedicate al coworking. 
      
      Particolare attenzione è stata dedicata alla sostenibilità ambientale con sistemi di climatizzazione ad alta efficienza, 
      illuminazione LED, giardini pensili e un sistema di raccolta e riutilizzo delle acque piovane.
      
      L'architettura è caratterizzata da ampie corti interne che favoriscono l'illuminazione naturale e creano spazi 
      di aggregazione sociale. La struttura è completamente accessibile e dotata di tecnologie smart per una migliore 
      gestione dei flussi e dei servizi.
    `,
    client: "Gruppo Immobiliare Roma",
    surface: "25.000 mq",
    budget: "€ 18.500.000",
    duration: "36 mesi",
    features: [
      "150 negozi e boutique",
      "20 ristoranti e bar",
      "Cinema multisala 12 sale",
      "Spazi coworking",
      "Giardini pensili",
      "Parcheggio multipiano 800 posti",
      "Sistemi smart building",
      "Certificazione LEED Gold"
    ],
    is_active: true,
    display_order: 2
  },
  {
    title: "Ristrutturazione Palazzo Storico",
    subtitle: "Restauro conservativo XVIII secolo",
    year: 2024,
    location: "Firenze, Italia", 
    status: "In corso",
    label: "ristrutturazione",
    description: "Restauro conservativo e riqualificazione energetica di palazzo storico del XVIII secolo nel centro di Firenze.",
    long_description: `
      Il progetto di restauro di Palazzo Medici rappresenta una sfida tecnica e culturale di grande prestigio. 
      L'edificio, risalente al 1750, è un esempio eccezionale di architettura barocca fiorentina che richiede 
      un approccio conservativo estremamente specializzato.
      
      Il restauro prevede il consolidamento strutturale, il recupero degli affreschi originali, la sistemazione 
      dei pavimenti in cotto antico e la realizzazione di un sistema impiantistico invisibile che rispetti 
      l'integrità architettonica dell'edificio.
      
      Il palazzo, di 1.200 mq su 3 piani, sarà destinato a sede museale e spazi culturali. Il progetto include 
      il restauro del giardino interno secondo i disegni originali del XVIII secolo e l'installazione di sistemi 
      di sicurezza e climatizzazione museali all'avanguardia.
      
      I lavori sono condotti sotto la supervisione della Soprintendenza ai Beni Architettonici di Firenze 
      e seguono le più rigorose tecniche di restauro conservativo.
    `,
    client: "Fondazione Palazzo Medici",
    surface: "1.200 mq",
    budget: "€ 3.200.000",
    duration: "42 mesi",
    features: [
      "Restauro affreschi XVIII secolo",
      "Consolidamento strutturale",
      "Recupero pavimenti cotto antico",
      "Impianti invisibili museali",
      "Sistema antincendio specializzato",
      "Climatizzazione museale",
      "Restauro giardino storico",
      "Ascensore panoramico in vetro"
    ],
    is_active: true,
    display_order: 3
  },
  {
    title: "Complesso Industriale Green Tech",
    subtitle: "Stabilimento produttivo sostenibile",
    year: 2023,
    location: "Torino, Italia",
    status: "Completato", 
    label: "industriale",
    description: "Progettazione e costruzione di stabilimento produttivo con uffici amministrativi integrati e tecnologie sostenibili.",
    long_description: `
      Il nuovo stabilimento Green Tech rappresenta l'eccellenza nell'architettura industriale sostenibile. 
      Progettato per un'azienda leader nel settore dell'automotive, il complesso integra produzione, ricerca e amministrazione 
      in un'unica struttura architettonica innovativa.
      
      Il progetto si sviluppa su 15.000 mq coperti con capannoni produttivi ad alta tecnologia, laboratori di ricerca e sviluppo, 
      uffici amministrativi e spazi per la formazione del personale. La struttura è progettata con criteri di massima flessibilità 
      per adattarsi alle future evoluzioni tecnologiche.
      
      L'impianto è completamente alimentato da energie rinnovabili grazie a un sistema fotovoltaico da 2 MW installato sulla copertura. 
      Il sistema di climatizzazione utilizza tecnologie geotermiche e di recupero calore dai processi produttivi.
      
      Il complesso include anche servizi per i dipendenti come mensa aziendale, palestra, asilo nido e ampi parcheggi con stazioni 
      di ricarica per veicoli elettrici.
    `,
    client: "Green Tech Industries S.p.A.",
    surface: "15.000 mq",
    budget: "€ 8.500.000",
    duration: "24 mesi",
    features: [
      "Capannoni produttivi flessibili",
      "Laboratori R&D avanzati",
      "Impianto fotovoltaico 2 MW",
      "Sistema geotermico",
      "Recupero calore industriale",
      "Mensa e servizi dipendenti",
      "Stazioni ricarica elettrica",
      "Certificazione ISO 14001"
    ],
    is_active: true,
    display_order: 4
  },
  {
    title: "Residenza Eco-Sostenibile San Donato",
    subtitle: "Condominio certificato CasaClima A+",
    year: 2024,
    location: "Bologna, Italia",
    status: "In corso",
    label: "residenziale", 
    description: "Condominio residenziale con certificazione energetica A+ e sistemi di energia rinnovabile integrati.",
    long_description: `
      La Residenza Eco-Sostenibile San Donato è un progetto pilota nel campo dell'edilizia residenziale sostenibile. 
      Il complesso, situato in una zona residenziale di Bologna, rappresenta un modello di abitazione del futuro 
      che coniuga comfort abitativo e rispetto per l'ambiente.
      
      Il progetto prevede la realizzazione di 48 appartamenti distribuiti in 3 palazzine di 4 piani ciascuna, 
      circondate da 3.000 mq di verde condominiale con essenze autoctone e sistemi di fitodepurazione naturale.
      
      Ogni abitazione è dotata di sistemi domotici per la gestione intelligente di climatizzazione, illuminazione e sicurezza. 
      L'intero complesso è alimentato da un sistema fotovoltaico condominiale integrato da pompe di calore geotermiche.
      
      Gli appartamenti sono caratterizzati da ampi terrazzi e giardini privati, finiture in materiali naturali e 
      sistemi di ventilazione meccanica controllata per garantire la massima qualità dell'aria interna.
      
      Il progetto punta alla certificazione CasaClima A+ e LEED Platinum, rappresentando un benchmark per l'edilizia 
      residenziale sostenibile in Italia.
    `,
    client: "Cooperativa Edilizia Verde",
    surface: "6.800 mq",
    budget: "€ 4.200.000",
    duration: "30 mesi",
    features: [
      "48 appartamenti eco-sostenibili",
      "Certificazione CasaClima A+",
      "Impianto fotovoltaico condominiale",
      "Pompe di calore geotermiche",
      "Sistemi domotici integrati",
      "VMC centralizzata",
      "Giardini condominiali 3.000 mq", 
      "Car sharing elettrico"
    ],
    is_active: true,
    display_order: 5
  },
  {
    title: "Torre Direzionale Smart Office",
    subtitle: "Uffici intelligenti di nuova generazione",
    year: 2024,
    location: "Napoli, Italia",
    status: "Progettazione",
    label: "commerciale",
    description: "Torre per uffici con tecnologie smart building e spazi flessibili per coworking e business center.",
    long_description: `
      La Torre Direzionale Smart Office rappresenta il futuro degli spazi lavorativi urbani. Situata nel nuovo distretto 
      degli affari di Napoli, la torre di 20 piani offre 15.000 mq di uffici di alta qualità progettati secondo i più 
      avanzati criteri di wellness e produttività.
      
      L'edificio integra tecnologie smart building all'avanguardia per la gestione automatizzata di climatizzazione, 
      illuminazione, sicurezza e servizi. Ogni piano può essere configurato secondo le esigenze specifiche delle aziende 
      insediate, con sistemi modulari che permettono la massima flessibilità degli spazi.
      
      La torre include un business center con sale riunioni high-tech, spazi coworking, area fitness, roof garden 
      panoramico e un sistema di parcheggio automatizzato. Il piano terra ospita servizi commerciali e di ristorazione 
      aperti anche alla cittadinanza.
      
      L'architettura è caratterizzata da una facciata dinamica con sistemi di ombreggiamento automatici e vetrate 
      ad alte prestazioni energetiche. Il sistema HVAC utilizza tecnologie di recupero calore e climatizzazione 
      a espansione diretta ad alta efficienza.
      
      Il progetto punta alla certificazione LEED Platinum e WELL Building Standard per garantire i massimi livelli 
      di sostenibilità ambientale e benessere occupazionale.
    `,
    client: "Napoli Business Development",
    surface: "15.000 mq",
    budget: "€ 22.000.000",
    duration: "48 mesi",
    features: [
      "20 piani uffici flessibili",
      "Tecnologie smart building",
      "Business center hi-tech",
      "Spazi coworking",
      "Roof garden panoramico",
      "Parcheggio automatizzato",
      "Facciata dinamica intelligente",
      "Certificazioni LEED + WELL"
    ],
    is_active: true,
    display_order: 6
  }
];

// Sample images for projects (using placeholder images)
const sampleImages = [
  {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    title: "Vista principale",
    alt_text: "Vista principale dell'edificio"
  },
  {
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", 
    title: "Interni moderni",
    alt_text: "Spazi interni moderni"
  },
  {
    url: "https://images.unsplash.com/photo-1600047508788-786564deb7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    title: "Area esterna", 
    alt_text: "Vista dell'area esterna"
  },
  {
    url: "https://images.unsplash.com/photo-1590479773265-7464e5d48118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    title: "Dettagli architettonici",
    alt_text: "Dettagli architettonici e costruttivi"
  }
];

async function migrateProjects() {
  console.log('🚀 Starting projects migration...\n');

  try {
    // 1. Check if tables exist and are accessible
    console.log('1️⃣ Checking database connection...');
    const { data: tablesCheck, error: tablesError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (tablesError) {
      throw new Error(`Database connection failed: ${tablesError.message}`);
    }
    console.log('✅ Database connection successful\n');

    // 2. Check existing projects
    console.log('2️⃣ Checking existing projects...');
    const { data: existingProjects, error: existingError } = await supabase
      .from('projects')
      .select('id, title');

    if (existingError) {
      throw new Error(`Error checking existing projects: ${existingError.message}`);
    }

    console.log(`📊 Found ${existingProjects.length} existing projects`);
    
    if (existingProjects.length > 0) {
      console.log('⚠️  Warning: Projects already exist in database');
      console.log('Existing projects:');
      existingProjects.forEach(project => {
        console.log(`   - ${project.title} (ID: ${project.id})`);
      });
      
      const proceed = process.argv.includes('--force');
      if (!proceed) {
        console.log('\n❌ Migration cancelled. Use --force flag to proceed anyway.');
        return;
      }
      console.log('🔄 Proceeding with --force flag...\n');
    }

    // 3. Migrate projects
    console.log('3️⃣ Migrating projects...');
    
    for (let i = 0; i < staticProjects.length; i++) {
      const project = staticProjects[i];
      console.log(`   📁 Creating project: ${project.title}`);

      // Insert project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (projectError) {
        console.error(`   ❌ Error creating project ${project.title}:`, projectError.message);
        continue;
      }

      console.log(`   ✅ Project created with ID: ${newProject.id}`);

      // Add sample images for each project
      console.log(`   🖼️  Adding images to project...`);
      
      for (let j = 0; j < sampleImages.length; j++) {
        const image = sampleImages[j];
        
        const { error: imageError } = await supabase
          .from('project_images')
          .insert([{
            project_id: newProject.id,
            image_url: image.url,
            image_public_id: `sample_${newProject.id}_${j + 1}`,
            title: `${image.title} - ${project.title}`,
            alt_text: `${image.alt_text} - ${project.title}`,
            display_order: j + 1,
            is_cover: j === 0 // First image as cover
          }]);

        if (imageError) {
          console.error(`   ⚠️  Warning: Could not add image ${j + 1}:`, imageError.message);
        }
      }

      console.log(`   ✅ Added ${sampleImages.length} sample images\n`);
    }

    // 4. Verify migration
    console.log('4️⃣ Verifying migration...');
    
    const { data: finalProjects, error: finalError } = await supabase
      .from('projects_with_cover')
      .select('*');

    if (finalError) {
      throw new Error(`Error verifying migration: ${finalError.message}`);
    }

    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Total projects in database: ${finalProjects.length}`);
    console.log('\nProject summary:');
    finalProjects.forEach(project => {
      console.log(`   - ${project.title} (${project.label}, ${project.status})`);
      if (project.cover_image_url) {
        console.log(`     📸 Has cover image`);
      }
    });

    // 5. Next steps
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the database schema: Execute EXECUTE_PROJECTS_SQL.sql in Supabase');
    console.log('2. Start the backend server: cd server && npm run dev');
    console.log('3. Start the frontend: cd client && npm start');
    console.log('4. Access dashboard: http://localhost:3000/dashboard/projects');
    console.log('5. View public projects: http://localhost:3000/progetti');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure database schema is applied (run EXECUTE_PROJECTS_SQL.sql)');
    console.log('2. Check environment variables in .env file');
    console.log('3. Verify Supabase connection and permissions');
    process.exit(1);
  }
}

// Help message
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
KORSVAGEN Projects Migration Script

Usage: node migrate-projects.js [options]

Options:
  --force    Force migration even if projects already exist
  --help     Show this help message

Examples:
  node migrate-projects.js           # Normal migration
  node migrate-projects.js --force   # Force migration

This script migrates static project data from the frontend into the new dynamic projects system.
Make sure the database schema is applied before running this script.
`);
  process.exit(0);
}

// Run migration
migrateProjects();