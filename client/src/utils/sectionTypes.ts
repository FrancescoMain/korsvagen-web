import type { SectionType } from "../types/editor";
import HeroEditor from "../components/Editor/SectionTypes/HeroEditor";
import AboutEditor from "../components/Editor/SectionTypes/AboutEditor";
import GalleryEditor from "../components/Editor/SectionTypes/GalleryEditor";
import ContactEditor from "../components/Editor/SectionTypes/ContactEditor";

export const sectionTypes: Record<string, SectionType> = {
  hero: {
    name: "Hero Section",
    icon: "🎯",
    fields: ["title", "subtitle", "backgroundImage", "ctaText", "ctaLink"],
    component: HeroEditor,
    defaultContent: {
      title: "Benvenuto nel nostro sito",
      subtitle: "Scopri i nostri servizi",
      ctaText: "Inizia ora",
      ctaLink: "#",
      backgroundColor: "#ffffff",
      textColor: "#333333",
      overlay: false,
      overlayOpacity: 50,
    },
  },
  about: {
    name: "About Section",
    icon: "📝",
    fields: ["title", "content", "images", "layout"],
    component: AboutEditor,
    defaultContent: {
      title: "Chi siamo",
      content: "<p>Racconta la storia della tua azienda...</p>",
      images: [],
      layout: "left",
      backgroundColor: "#ffffff",
      textColor: "#333333",
    },
  },
  gallery: {
    name: "Gallery",
    icon: "🖼️",
    fields: ["title", "images", "columns", "spacing"],
    component: GalleryEditor,
    defaultContent: {
      title: "I nostri lavori",
      images: [],
      columns: 3,
      spacing: 16,
      showCaptions: false,
      lightbox: true,
    },
  },
  contact: {
    name: "Contact Section",
    icon: "📞",
    fields: ["title", "formFields", "contactInfo", "map"],
    component: ContactEditor,
    defaultContent: {
      title: "Contattaci",
      formFields: [
        {
          id: "name",
          type: "text",
          label: "Nome",
          name: "name",
          required: true,
          placeholder: "Il tuo nome",
        },
        {
          id: "email",
          type: "email",
          label: "Email",
          name: "email",
          required: true,
          placeholder: "la-tua-email@esempio.com",
        },
        {
          id: "message",
          type: "textarea",
          label: "Messaggio",
          name: "message",
          required: true,
          placeholder: "Scrivi il tuo messaggio...",
        },
      ],
      contactInfo: {
        phone: "+39 000 000 0000",
        email: "info@esempio.com",
        address: "Via Roma 123, 00100 Roma",
        workingHours: "Lun-Ven: 9:00-18:00",
      },
      showMap: false,
      mapLocation: {
        lat: 41.9028,
        lng: 12.4964,
        zoom: 15,
      },
    },
  },
};

export const getSectionTypeConfig = (type: string): SectionType | null => {
  return sectionTypes[type] || null;
};

export const getAllSectionTypes = (): SectionType[] => {
  return Object.values(sectionTypes);
};

export const createDefaultSection = (type: string): any => {
  const config = getSectionTypeConfig(type);
  if (!config) {
    throw new Error(`Unknown section type: ${type}`);
  }

  return {
    id: `section-${Date.now()}`,
    type,
    title: config.name,
    content: { ...config.defaultContent },
    isActive: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
