export interface SectionContent {
  [key: string]: any;
}

export interface Section {
  id: string;
  type: "hero" | "about" | "gallery" | "contact" | "custom";
  title: string;
  content: SectionContent;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
  altText?: string;
  caption?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HeroContent {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: MediaItem;
  backgroundColor?: string;
  textColor?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export interface AboutContent {
  title: string;
  content: string;
  images?: MediaItem[];
  layout: "left" | "right" | "center";
  backgroundColor?: string;
  textColor?: string;
}

export interface GalleryContent {
  title: string;
  images: MediaItem[];
  columns: number;
  spacing: number;
  showCaptions: boolean;
  lightbox: boolean;
}

export interface ContactContent {
  title: string;
  formFields: FormField[];
  contactInfo: ContactInfo;
  showMap: boolean;
  mapLocation?: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

export interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox";
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    pattern?: string;
    message?: string;
  };
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  workingHours?: string;
  socialLinks?: {
    name: string;
    url: string;
    icon: string;
  }[];
}

export interface SectionType {
  name: string;
  icon: string;
  fields: string[];
  component: React.ComponentType<any>;
  defaultContent: SectionContent;
}

import type { DragEndEvent } from "@dnd-kit/core";

export type { DragEndEvent };

export interface EditorState {
  sections: Section[];
  selectedSectionId: string | null;
  previewMode: boolean;
  isDirty: boolean;
}

export interface PageData {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
