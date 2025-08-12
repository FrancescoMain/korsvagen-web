/**
 * NEWS FORM - Form per creazione e modifica articoli news
 *
 * Form completo per gestione articoli con upload immagini,
 * validazione, anteprima e gestione categorie
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import { api } from "../../utils/api";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  Calendar,
  Tag,
  Type,
  AlignLeft,
  Image as ImageIcon,
  Star,
  Globe,
} from "lucide-react";
import type { NewsArticle } from "./NewsManager";

interface NewsFormProps {
  article?: NewsArticle | null;
  onClose: () => void;
  onSuccess: () => void;
  categories: string[];
}

interface FormData {
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  content: string;
  published_date: string;
  is_published: boolean;
  is_featured: boolean;
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    color: #333;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }
`;

const Button = styled.button<{
  $variant?: 'primary' | 'secondary';
}>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  ${({ $variant = 'primary' }) => $variant === 'primary' ? `
    background: #4caf50;
    color: white;
    &:hover {
      background: #45a049;
      transform: translateY(-1px);
    }
  ` : `
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e9ecef;
    &:hover {
      background: #e9ecef;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const FormLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainForm = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  padding: 2rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-row: 1;
  }
`;

const SidebarCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  padding: 1.5rem;

  h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const FormSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }

  &[readonly] {
    background: #f8f9fa;
    color: #666;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  line-height: 1.6;
  background: white;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
`;

const HelpText = styled.small`
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.8rem;
`;

const PreviewText = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  font-size: 0.8rem;
  color: #666;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;

  input[type="checkbox"] {
    margin: 0;
  }
`;

const ImageUploadArea = styled.div`
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: #fafafa;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
  }

  .icon {
    margin-bottom: 1rem;
    color: #ccc;
  }

  p {
    margin: 0 0 1rem 0;
    color: #666;
    font-size: 0.9rem;
  }

  input[type="file"] {
    display: none;
  }
`;

const CurrentImage = styled.div`
  margin-bottom: 1rem;
  
  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }
`;

const RemoveImageButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  justify-content: center;

  &:hover {
    background: #da190b;
  }
`;

const ErrorText = styled.div`
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const NewsForm: React.FC<NewsFormProps> = ({
  article,
  onClose,
  onSuccess,
  categories
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subtitle: '',
    slug: '',
    category: '',
    content: '',
    published_date: new Date().toISOString().split('T')[0],
    is_published: true,
    is_featured: false,
  });

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        subtitle: article.subtitle || '',
        slug: article.slug,
        category: article.category,
        content: article.content,
        published_date: article.published_date.split('T')[0], // Format for date input
        is_published: article.is_published,
        is_featured: article.is_featured,
      });
      setCurrentImage(article.image_url || '');
    }
  }, [article]);

  // Auto-generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[àáäâè|éëêì|íïîò|óöôù|úüûñç|ç]/g, (match) => {
        const map: Record<string, string> = {
          à: 'a', á: 'a', ä: 'a', â: 'a',
          è: 'e', é: 'e', ë: 'e', ê: 'e',
          ì: 'i', í: 'i', ï: 'i', î: 'i',
          ò: 'o', ó: 'o', ö: 'o', ô: 'o',
          ù: 'u', ú: 'u', ü: 'u', û: 'u',
          ñ: 'n', ç: 'c'
        };
        return map[match] || match;
      })
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, '');
  };

  // Handle form changes
  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug when title changes
    if (field === 'title' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titolo obbligatorio';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug obbligatorio';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug deve contenere solo lettere minuscole, numeri e trattini';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Categoria obbligatoria';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Contenuto obbligatorio';
    }

    if (!formData.published_date) {
      newErrors.published_date = 'Data pubblicazione obbligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Correggi gli errori nel form');
      return;
    }

    setLoading(true);

    try {
      if (article) {
        await api.news.update(article.id, formData);
      } else {
        await api.news.create(formData);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Errore salvataggio articolo:', error);
      toast.error(error.message || 'Errore nel salvataggio dell\'articolo');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!article?.id) {
      toast.error('Salva prima l\'articolo per caricare un\'immagine');
      return;
    }

    setImageUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.news.uploadImage(article.id, formData);
      
      setCurrentImage(response.data.data.image_url);
      toast.success('Immagine caricata con successo');
    } catch (error: any) {
      console.error('Errore upload immagine:', error);
      toast.error(error.message || 'Errore nel caricamento dell\'immagine');
    } finally {
      setImageUploading(false);
    }
  };

  // Handle image removal
  const handleImageRemove = async () => {
    if (!article?.id || !currentImage) return;

    try {
      await api.news.deleteImage(article.id);
      setCurrentImage('');
      toast.success('Immagine rimossa con successo');
    } catch (error: any) {
      console.error('Errore rimozione immagine:', error);
      toast.error(error.message || 'Errore nella rimozione dell\'immagine');
    }
  };

  const getPreviewUrl = () => {
    if (formData.slug) {
      return `/news/${formData.slug}`;
    }
    return null;
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={onClose}>
            <ArrowLeft size={18} />
          </BackButton>
          <Title>
            {article ? 'Modifica Articolo' : 'Nuovo Articolo'}
          </Title>
        </HeaderLeft>

        <HeaderActions>
          {getPreviewUrl() && (
            <Button 
              $variant="secondary" 
              onClick={() => window.open(getPreviewUrl()!, '_blank')}
            >
              <Eye size={18} />
              Anteprima
            </Button>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Salvataggio...' : 'Salva Articolo'}
          </Button>
        </HeaderActions>
      </Header>

      <FormLayout>
        <MainForm>
          <form onSubmit={handleSubmit}>
            <FormSection>
              <SectionTitle>
                <Type size={20} />
                Informazioni Base
              </SectionTitle>

              <FormGroup>
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Inserisci il titolo dell'articolo"
                />
                {errors.title && <ErrorText>{errors.title}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="slug">Slug URL *</Label>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="url-articolo-esempio"
                />
                <HelpText>URL SEO-friendly per l'articolo</HelpText>
                {formData.slug && (
                  <PreviewText>URL: /news/{formData.slug}</PreviewText>
                )}
                {errors.slug && <ErrorText>{errors.slug}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="subtitle">Sottotitolo</Label>
                <Input
                  id="subtitle"
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  placeholder="Breve descrizione dell'articolo"
                />
                <HelpText>Utilizzato come anteprima nelle liste articoli</HelpText>
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>
                <AlignLeft size={20} />
                Contenuto
              </SectionTitle>

              <FormGroup>
                <Label htmlFor="content">Contenuto Articolo *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="Scrivi qui il contenuto completo dell'articolo..."
                />
                <HelpText>Supporta HTML per la formattazione</HelpText>
                {errors.content && <ErrorText>{errors.content}</ErrorText>}
              </FormGroup>
            </FormSection>
          </form>
        </MainForm>

        <Sidebar>
          <SidebarCard>
            <h3>
              <Tag size={16} />
              Classificazione
            </h3>

            <FormGroup>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">Seleziona categoria</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Progetti">Progetti</option>
                <option value="Azienda">Azienda</option>
                <option value="Partnership">Partnership</option>
                <option value="Certificazioni">Certificazioni</option>
                <option value="Premi">Premi</option>
                <option value="Eventi">Eventi</option>
                <option value="Novità">Novità</option>
              </Select>
              {errors.category && <ErrorText>{errors.category}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="published_date">Data Pubblicazione *</Label>
              <Input
                id="published_date"
                type="date"
                value={formData.published_date}
                onChange={(e) => handleChange('published_date', e.target.value)}
              />
              {errors.published_date && <ErrorText>{errors.published_date}</ErrorText>}
            </FormGroup>
          </SidebarCard>

          <SidebarCard>
            <h3>
              <Globe size={16} />
              Pubblicazione
            </h3>

            <CheckboxGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => handleChange('is_published', e.target.checked)}
                />
                Pubblica articolo
              </CheckboxLabel>

              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                />
                <Star size={14} fill={formData.is_featured ? '#ffc107' : 'transparent'} />
                Articolo in evidenza
              </CheckboxLabel>
            </CheckboxGroup>
          </SidebarCard>

          <SidebarCard>
            <h3>
              <ImageIcon size={16} />
              Immagine
            </h3>

            {currentImage && (
              <CurrentImage>
                <img src={currentImage} alt="Immagine articolo" />
                <RemoveImageButton onClick={handleImageRemove}>
                  <X size={14} />
                  Rimuovi Immagine
                </RemoveImageButton>
              </CurrentImage>
            )}

            <ImageUploadArea>
              <Upload className="icon" size={32} />
              <p>
                {imageUploading 
                  ? 'Caricamento in corso...' 
                  : 'Trascina un\'immagine qui o clicca per selezionare'
                }
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                disabled={imageUploading || !article?.id}
              />
              {!article?.id && (
                <HelpText>Salva prima l'articolo per caricare un'immagine</HelpText>
              )}
            </ImageUploadArea>
          </SidebarCard>
        </Sidebar>
      </FormLayout>
    </Container>
  );
};

export default NewsForm;