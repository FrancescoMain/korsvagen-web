import dotenv from 'dotenv';
import { getSupabase } from './api/utils/database.js';

dotenv.config();

console.log('🔧 Test CRUD operations...\n');

async function testCRUD() {
  try {
    const supabase = getSupabase();

    // 1. Test creazione pagina
    console.log('📝 Test creazione pagina...');
    const newPage = {
      page_id: 'test-page-' + Date.now(),
      title: 'Test Page',
      slug: 'test-page-' + Date.now(),
      description: 'Pagina di test per API',
      is_published: true,
      metadata: {
        seo_title: 'Test Page SEO',
        test: true
      }
    };

    const { data: createdPage, error: createError } = await supabase
      .from('pages')
      .insert(newPage)
      .select()
      .single();

    if (createError) {
      console.log('❌ Errore creazione:', createError.message);
      return;
    }

    console.log('✅ Pagina creata:', createdPage.title);

    // 2. Test lettura pagina
    console.log('\n📖 Test lettura pagina...');
    const { data: readPage, error: readError } = await supabase
      .from('pages')
      .select('*')
      .eq('id', createdPage.id)
      .single();

    if (readError) {
      console.log('❌ Errore lettura:', readError.message);
    } else {
      console.log('✅ Pagina letta:', readPage.title);
    }

    // 3. Test creazione sezione
    console.log('\n📄 Test creazione sezione...');
    const newSection = {
      section_id: 'test-section-' + Date.now(),
      page_id: createdPage.id,
      type: 'text',
      title: 'Test Section',
      content: {
        text: 'Contenuto di test',
        style: 'default'
      },
      order_index: 1,
      is_active: true
    };

    const { data: createdSection, error: sectionError } = await supabase
      .from('sections')
      .insert(newSection)
      .select()
      .single();

    if (sectionError) {
      console.log('❌ Errore creazione sezione:', sectionError.message);
    } else {
      console.log('✅ Sezione creata:', createdSection.title);
    }

    // 4. Test query con join
    console.log('\n🔗 Test query con join...');
    const { data: pageWithSections, error: joinError } = await supabase
      .from('pages')
      .select(`
        *,
        sections (
          id,
          section_id,
          type,
          title,
          content,
          order_index,
          is_active
        )
      `)
      .eq('id', createdPage.id)
      .single();

    if (joinError) {
      console.log('❌ Errore join:', joinError.message);
    } else {
      console.log('✅ Page con sections:', {
        page: pageWithSections.title,
        sections: pageWithSections.sections?.length || 0
      });
    }

    // 5. Test aggiornamento
    console.log('\n✏️ Test aggiornamento...');
    const { data: updatedPage, error: updateError } = await supabase
      .from('pages')
      .update({ 
        title: 'Test Page UPDATED',
        metadata: { ...createdPage.metadata, updated: true }
      })
      .eq('id', createdPage.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Errore aggiornamento:', updateError.message);
    } else {
      console.log('✅ Pagina aggiornata:', updatedPage.title);
    }

    // 6. Cleanup - elimina dati di test
    console.log('\n🧹 Pulizia dati di test...');
    
    // Prima elimina sezioni (foreign key)
    if (createdSection) {
      await supabase
        .from('sections')
        .delete()
        .eq('id', createdSection.id);
      console.log('✅ Sezione eliminata');
    }

    // Poi elimina pagina
    const { error: deleteError } = await supabase
      .from('pages')
      .delete()
      .eq('id', createdPage.id);

    if (deleteError) {
      console.log('❌ Errore eliminazione:', deleteError.message);
    } else {
      console.log('✅ Pagina eliminata');
    }

    console.log('\n🎉 Test CRUD completato con successo!');

  } catch (error) {
    console.error('\n💥 Errore durante test CRUD:', error.message);
  }
}

testCRUD();
