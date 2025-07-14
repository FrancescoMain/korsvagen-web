import dotenv from 'dotenv';
import { Page } from './api/models/Page.js';
import { Section } from './api/models/Section.js';
import { Media } from './api/models/Media.js';
import { User } from './api/models/User.js';

dotenv.config();

console.log('🎯 Test modelli API...\n');

async function testModels() {
  try {
    // 1. Test modello Page
    console.log('📄 Test modello Page...');
    
    const pageData = {
      page_id: 'test-model-' + Date.now(),
      title: 'Test Page Model',
      slug: 'test-page-model-' + Date.now(),
      description: 'Test con modello Page',
      is_published: true
    };

    const createdPage = await Page.create(pageData);
    if (createdPage.success) {
      console.log('✅ Page creata con modello:', createdPage.data.title);

      // Test findWithSections
      const pageWithSections = await Page.findWithSections(createdPage.data.id);
      if (pageWithSections.success) {
        console.log('✅ findWithSections funziona');
      }

      // Test search
      const searchResults = await Page.search('Test');
      if (searchResults.success) {
        console.log('✅ Search funziona, trovate', searchResults.data.length, 'pagine');
      }

    } else {
      console.log('❌ Errore creazione Page:', createdPage.error);
      return;
    }

    // 2. Test modello Section
    console.log('\n📑 Test modello Section...');
    
    const sectionData = {
      section_id: 'test-section-model-' + Date.now(),
      page_id: createdPage.data.id,
      type: 'hero',
      title: 'Test Section Model',
      content: {
        title: 'Hero Title',
        subtitle: 'Hero Subtitle'
      },
      order_index: 1
    };

    const createdSection = await Section.create(sectionData);
    if (createdSection.success) {
      console.log('✅ Section creata con modello:', createdSection.data.title);

      // Test findByPageId
      const pageSections = await Section.findByPageId(createdPage.data.id);
      if (pageSections.success) {
        console.log('✅ findByPageId funziona, trovate', pageSections.data.length, 'sezioni');
      }

    } else {
      console.log('❌ Errore creazione Section:', createdSection.error);
    }

    // 3. Test modello User
    console.log('\n👤 Test modello User...');
    
    const userData = {
      email: 'test-' + Date.now() + '@example.com',
      name: 'Test User',
      role: 'admin'
    };

    const createdUser = await User.create(userData);
    if (createdUser.success) {
      console.log('✅ User creato con modello:', createdUser.data.name);

      // Test findByEmail
      const foundUser = await User.findByEmail(userData.email);
      if (foundUser.success) {
        console.log('✅ findByEmail funziona');
      }

    } else {
      console.log('❌ Errore creazione User:', createdUser.error);
    }

    // 4. Test modello Media
    console.log('\n🖼️ Test modello Media...');
    
    const mediaData = {
      cloudinary_id: 'test-media-' + Date.now(),
      public_id: 'test/image-' + Date.now(),
      url: 'https://example.com/test.jpg',
      secure_url: 'https://example.com/test.jpg',
      format: 'jpg',
      resource_type: 'image',
      width: 800,
      height: 600,
      bytes: 150000,
      alt_text: 'Test image'
    };

    const createdMedia = await Media.create(mediaData);
    if (createdMedia.success) {
      console.log('✅ Media creato con modello:', createdMedia.data.alt_text);

      // Test findUnused
      const unusedMedia = await Media.findUnused();
      if (unusedMedia.success) {
        console.log('✅ findUnused funziona, trovati', unusedMedia.data.length, 'media non usati');
      }

    } else {
      console.log('❌ Errore creazione Media:', createdMedia.error);
    }

    // 5. Cleanup
    console.log('\n🧹 Pulizia...');
    
    if (createdSection?.success) {
      await Section.delete(createdSection.data.id);
      console.log('✅ Section eliminata');
    }
    
    if (createdPage?.success) {
      await Page.delete(createdPage.data.id);
      console.log('✅ Page eliminata');
    }
    
    if (createdUser?.success) {
      await User.delete(createdUser.data.id);
      console.log('✅ User eliminato');
    }
    
    if (createdMedia?.success) {
      await Media.delete(createdMedia.data.id);
      console.log('✅ Media eliminato');
    }

    console.log('\n🎉 Test modelli completato con successo!');

  } catch (error) {
    console.error('\n💥 Errore durante test modelli:', error.message);
  }
}

testModels();
