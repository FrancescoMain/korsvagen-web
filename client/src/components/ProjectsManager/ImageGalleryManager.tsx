/**
 * IMAGE GALLERY MANAGER - Gestione immagini progetto
 *
 * Componente avanzato per la gestione delle immagini del progetto
 * con upload multiplo, drag & drop, riordinamento e gestione copertina.
 */

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Project, ProjectImage, useProjects } from "../../hooks/useProjects";
import {
  X,
  Image,
  Upload,
  Star,
  Edit3,
  Trash2,
  Move,
  Plus,
  Camera,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

interface ImageGalleryManagerProps {
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
}

// Types for drag and drop
interface DragItem {
  id: number;
  index: number;
}

const Overlay = styled.div`
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.8) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999 !important;
  padding: 1rem !important;
  visibility: visible !important;
  opacity: 1 !important;
`;

const Modal = styled.div`
  background: white !important;
  border-radius: 16px;
  width: 100% !important;
  max-width: 1200px !important;
  max-height: 95vh !important;
  overflow: hidden;
  display: flex !important;
  flex-direction: column !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
  z-index: 10000 !important;
  position: relative !important;
`;

const Header = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;

  h2 {
    margin: 0;
    color: #333;
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    color: #666;
    transition: all 0.2s ease;

    &:hover {
      background: #e9ecef;
      color: #333;
    }
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
  color: #666;

  .stat {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .number {
    font-weight: 600;
    color: #333;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
`;

const UploadArea = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#d4af37' : '#ddd'};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${props => props.isDragging ? '#fffbf0' : '#f8f9fa'};
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #d4af37;
    background: #fffbf0;
  }

  .upload-icon {
    font-size: 3rem;
    color: #d4af37;
    margin-bottom: 1rem;
  }

  .upload-text {
    color: #333;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .upload-hint {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .file-input {
    display: none;
  }
`;

const UploadButton = styled.button`
  background: #d4af37;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #b8941f;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageItem = styled.div<{ isDragging?: boolean }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => props.isDragging ? 0.5 : 1};
  transform: ${props => props.isDragging ? 'rotate(5deg)' : 'none'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;

  .loading-indicator {
    color: #666;
    font-size: 2rem;
  }

  .cover-badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    background: rgba(212, 175, 55, 0.95);
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .drag-handle {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: grab;
    opacity: 0;
    transition: all 0.2s ease;
  }

  &:hover .drag-handle {
    opacity: 1;
  }

  &:active .drag-handle {
    cursor: grabbing;
  }
`;

const ImageInfo = styled.div`
  padding: 1rem;
`;

const ImageTitle = styled.input`
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
  }
`;

const ImageActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  align-items: center;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #d4af37;
          color: white;
          &:hover { background: #b8941f; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      default:
        return `
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
          &:hover { 
            background: #e9ecef;
            border-color: #adb5bd;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;

  .icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.3;
  }

  h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.3rem;
  }

  p {
    margin: 0;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  margin: 0.5rem 0;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background: #d4af37;
    transition: width 0.3s ease;
  }
`;

const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({
  project,
  onClose,
  onUpdate,
}) => {
  console.log("ImageGalleryManager rendering for project:", project.title);
  const {
    fetchProject,
    uploadProjectImages,
    updateProjectImage,
    deleteProjectImage,
    setCoverImage,
    reorderProjectImages,
  } = useProjects();

  // States
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load project images from API
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        
        // Fetch full project details with images
        const projectDetail = await fetchProject(project.id);
        if (projectDetail && projectDetail.images) {
          const sortedImages = [...projectDetail.images].sort((a, b) => a.display_order - b.display_order);
          setImages(sortedImages);
        } else {
          setImages([]);
        }
      } catch (error) {
        console.error("Error loading project images:", error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [project.id, fetchProject]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );

    if (validFiles.length !== files.length) {
      toast.error("Alcuni file sono stati saltati (solo immagini fino a 10MB)");
    }

    if (validFiles.length === 0) return;

    try {
      setLoading(true);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadProjectImages(project.id, validFiles as any);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.uploaded.length > 0) {
        toast.success(`${result.uploaded.length} immagini caricate con successo`);
        
        // Update local state
        setImages(prev => [...prev, ...result.uploaded].sort((a, b) => a.display_order - b.display_order));
        
        // Notify parent component
        onUpdate();
      }

      if (result.errors.length > 0) {
        toast.error(`Errori: ${result.errors.join(', ')}`);
      }

    } catch (error: any) {
      toast.error(error.message || "Errore nell'upload delle immagini");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [project.id, uploadProjectImages, onUpdate]);

  // Handle drag and drop file upload
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Update image title
  const handleUpdateImageTitle = async (imageId: number, title: string) => {
    try {
      await updateProjectImage(project.id, imageId, { title });
      
      setImages(prev => 
        prev.map(img => 
          img.id === imageId ? { ...img, title } : img
        )
      );

      toast.success("Titolo aggiornato");
      onUpdate();
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento del titolo");
    }
  };

  // Set as cover image
  const handleSetCover = async (imageId: number) => {
    try {
      await setCoverImage(project.id, imageId);
      
      setImages(prev => 
        prev.map(img => ({
          ...img,
          is_cover: img.id === imageId
        }))
      );

      toast.success("Immagine copertina impostata");
      onUpdate();
    } catch (error: any) {
      toast.error("Errore nell'impostazione della copertina");
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId: number) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    if (!window.confirm(`Eliminare l'immagine "${image.title}"?`)) return;

    try {
      await deleteProjectImage(project.id, imageId);
      
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      toast.success("Immagine eliminata");
      onUpdate();
    } catch (error: any) {
      toast.error("Errore nell'eliminazione dell'immagine");
    }
  };

  // Handle reordering (simplified version - full drag & drop would require additional libraries)
  const handleMoveUp = async (imageId: number) => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex <= 0) return;

    const newImages = [...images];
    const temp = newImages[currentIndex - 1];
    newImages[currentIndex - 1] = newImages[currentIndex];
    newImages[currentIndex] = temp;

    // Update display_order
    const reorderData = newImages.map((img, index) => ({
      id: img.id,
      display_order: index + 1
    }));

    try {
      await reorderProjectImages(project.id, reorderData);
      setImages(newImages);
      toast.success("Ordine aggiornato");
      onUpdate();
    } catch (error: any) {
      toast.error("Errore nel riordinamento");
    }
  };

  const handleMoveDown = async (imageId: number) => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex >= images.length - 1) return;

    const newImages = [...images];
    const temp = newImages[currentIndex + 1];
    newImages[currentIndex + 1] = newImages[currentIndex];
    newImages[currentIndex] = temp;

    // Update display_order
    const reorderData = newImages.map((img, index) => ({
      id: img.id,
      display_order: index + 1
    }));

    try {
      await reorderProjectImages(project.id, reorderData);
      setImages(newImages);
      toast.success("Ordine aggiornato");
      onUpdate();
    } catch (error: any) {
      toast.error("Errore nel riordinamento");
    }
  };

  const currentCoverImage = images.find(img => img.is_cover);

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal>
        <Header>
          <h2>
            <Camera size={22} />
            Gallery - {project.title}
          </h2>
          <div className="header-actions">
            <Stats>
              <div className="stat">
                <Image size={14} />
                <span className="number">{images.length}</span> immagini
              </div>
              {currentCoverImage && (
                <div className="stat">
                  <Star size={14} />
                  Copertina: {currentCoverImage.title}
                </div>
              )}
            </Stats>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </Header>

        <Content>
          {/* Upload Area */}
          <UploadArea
            isDragging={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <div className="upload-icon">
              <Upload size={48} />
            </div>
            <div className="upload-text">
              Carica nuove immagini
            </div>
            <div className="upload-hint">
              Trascina i file qui o clicca per selezionarli<br/>
              Formati supportati: JPG, PNG, WEBP (max 10MB ciascuno)
            </div>
            <UploadButton disabled={loading}>
              <Plus size={16} />
              Seleziona File
            </UploadButton>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              className="file-input"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
          </UploadArea>

          {/* Upload Progress */}
          {loading && (
            <div>
              <ProgressBar progress={uploadProgress} />
              <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                Caricamento in corso... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Images Grid */}
          {images.length === 0 ? (
            <EmptyState>
              <div className="icon">
                <Image size={64} />
              </div>
              <h3>Nessuna immagine presente</h3>
              <p>
                Carica le prime immagini per creare la gallery del progetto.
                La prima immagine caricata diventerà automaticamente l'immagine di copertina.
              </p>
            </EmptyState>
          ) : (
            <ImageGrid>
              {images.map((image, index) => (
                <ImageItem key={image.id}>
                  <ImagePreview
                    style={{ backgroundImage: `url(${image.image_url})` }}
                  >
                    {image.is_cover && (
                      <div className="cover-badge">
                        <Star size={12} />
                        Copertina
                      </div>
                    )}
                    <div className="drag-handle">
                      <Move size={14} />
                    </div>
                  </ImagePreview>

                  <ImageInfo>
                    <ImageTitle
                      value={image.title}
                      onChange={(e) => handleUpdateImageTitle(image.id, e.target.value)}
                      placeholder="Titolo immagine"
                    />

                    <ImageActions>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <ActionButton
                          title="Sposta su"
                          onClick={() => handleMoveUp(image.id)}
                          disabled={index === 0}
                        >
                          ↑
                        </ActionButton>
                        <ActionButton
                          title="Sposta giù"
                          onClick={() => handleMoveDown(image.id)}
                          disabled={index === images.length - 1}
                        >
                          ↓
                        </ActionButton>
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {!image.is_cover && (
                          <ActionButton
                            variant="primary"
                            title="Imposta come copertina"
                            onClick={() => handleSetCover(image.id)}
                          >
                            <Star size={12} />
                          </ActionButton>
                        )}
                        <ActionButton
                          variant="danger"
                          title="Elimina immagine"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <Trash2 size={12} />
                        </ActionButton>
                      </div>
                    </ImageActions>
                  </ImageInfo>
                </ImageItem>
              ))}
            </ImageGrid>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
};

export default ImageGalleryManager;