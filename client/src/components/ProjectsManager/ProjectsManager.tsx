/**
 * PROJECTS MANAGER - Gestione Progetti Dashboard
 *
 * Componente per la gestione completa dei progetti dalla dashboard admin.
 * Include funzionalità CRUD, upload gallery immagini, riordinamento e gestione visibilità.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useProjects, type Project } from "../../hooks/useProjects";
import ProjectForm from "./ProjectForm";
import ProjectCard from "./ProjectCard";
import ImageGalleryManager from "./ImageGalleryManager";
import toast from "react-hot-toast";
import {
  Plus,
  Settings,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  BarChart3,
  Image,
  Calendar,
  MapPin,
} from "lucide-react";

// Types
type SortOption = 'newest' | 'oldest' | 'title' | 'order';
type FilterOption = 'all' | 'active' | 'inactive' | 'residential' | 'commercial' | 'industrial' | 'renovation';

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
  font-size: 1rem;
`;

const Stats = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;

  .icon {
    color: #d4af37;
  }

  .number {
    font-weight: 600;
    color: #333;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  white-space: nowrap;

  ${props => props.variant === 'primary' ? `
    background: #d4af37;
    color: white;
    &:hover {
      background: #b8941f;
      transform: translateY(-1px);
    }
  ` : `
    background: #f8f9fa;
    color: #333;
    border: 1px solid #e0e0e0;
    &:hover {
      background: #e9ecef;
      border-color: #d0d0d0;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 200px;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }

  @media (max-width: 768px) {
    min-width: 150px;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  grid-column: 1 / -1;

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  h3 {
    color: #333;
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  p {
    color: #666;
    margin: 0 0 2rem 0;
    font-size: 1rem;
    line-height: 1.6;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingCard = styled.div`
  height: 400px;
  background: #f8f9fa;
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const BulkActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  margin-bottom: 1rem;

  .count {
    font-weight: 600;
    color: #856404;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;

    &.activate {
      background: #28a745;
      color: white;
      &:hover { background: #218838; }
    }

    &.deactivate {
      background: #ffc107;
      color: #212529;
      &:hover { background: #e0a800; }
    }

    &.delete {
      background: #dc3545;
      color: white;
      &:hover { background: #c82333; }
    }
  }
`;

const ProjectsManager: React.FC = () => {
  // Hooks
  const {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    toggleProjectStatus,
    reorderProjects,
    refreshProjects,
  } = useProjects();

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [imageGalleryProject, setImageGalleryProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("order");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Computed values
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.is_active).length,
    inactive: projects.filter(p => !p.is_active).length,
    withImages: projects.filter(p => p.cover_image_url).length,
  };

  const filteredProjects = projects
    .filter(project => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.location.toLowerCase().includes(query) ||
          project.label.toLowerCase().includes(query) ||
          project.client?.toLowerCase().includes(query) ||
          ""
        );
      }
      return true;
    })
    .filter(project => {
      // Category filter
      switch (filterBy) {
        case 'active':
          return project.is_active;
        case 'inactive':
          return !project.is_active;
        case 'residential':
          return project.label.toLowerCase().includes('residenziale');
        case 'commercial':
          return project.label.toLowerCase().includes('commerciale');
        case 'industrial':
          return project.label.toLowerCase().includes('industriale');
        case 'renovation':
          return project.label.toLowerCase().includes('ristrutturazione');
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'order':
        default:
          return a.display_order - b.display_order;
      }
    });

  // Handlers
  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`Sei sicuro di voler eliminare il progetto "${project.title}"? Questa azione non può essere annullata.`)) {
      try {
        await deleteProject(project.id);
        toast.success("Progetto eliminato con successo");
      } catch (error) {
        toast.error("Errore nell'eliminazione del progetto");
      }
    }
  };

  const handleToggleStatus = async (project: Project) => {
    try {
      await toggleProjectStatus(project.id, !project.is_active);
      toast.success(`Progetto ${!project.is_active ? 'attivato' : 'disattivato'} con successo`);
    } catch (error) {
      toast.error("Errore nel cambio di stato");
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, data);
        toast.success("Progetto aggiornato con successo");
      } else {
        await createProject(data);
        toast.success("Progetto creato con successo");
      }
      setIsFormOpen(false);
      setSelectedProject(null);
    } catch (error: any) {
      toast.error(error.message || "Errore nel salvataggio del progetto");
    }
  };

  const handleManageImages = (project: Project) => {
    setImageGalleryProject(project);
  };

  const handleProjectSelect = (projectId: number, selected: boolean) => {
    if (selected) {
      setSelectedProjects(prev => [...prev, projectId]);
    } else {
      setSelectedProjects(prev => prev.filter(id => id !== projectId));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedProjects.length === 0) return;

    const confirmMessage = {
      activate: `Attivare ${selectedProjects.length} progetti selezionati?`,
      deactivate: `Disattivare ${selectedProjects.length} progetti selezionati?`,
      delete: `Eliminare definitivamente ${selectedProjects.length} progetti selezionati? Questa azione non può essere annullata.`,
    };

    if (!window.confirm(confirmMessage[action])) return;

    try {
      for (const projectId of selectedProjects) {
        if (action === 'delete') {
          await deleteProject(projectId);
        } else {
          await toggleProjectStatus(projectId, action === 'activate');
        }
      }

      toast.success(`${selectedProjects.length} progetti ${action === 'delete' ? 'eliminati' : action === 'activate' ? 'attivati' : 'disattivati'} con successo`);
      setSelectedProjects([]);
      setShowBulkActions(false);
    } catch (error) {
      toast.error("Errore nell'operazione bulk");
    }
  };

  // Effects
  useEffect(() => {
    setShowBulkActions(selectedProjects.length > 0);
  }, [selectedProjects]);

  useEffect(() => {
    refreshProjects();
  }, []);

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <Title>
            <Settings />
            Gestione Progetti
          </Title>
          <Subtitle>
            Gestisci il portfolio aziendale con informazioni dettagliate e gallery di immagini
          </Subtitle>
          <Stats>
            <StatItem>
              <BarChart3 className="icon" size={16} />
              <span className="number">{projectStats.total}</span> Progetti totali
            </StatItem>
            <StatItem>
              <Eye className="icon" size={16} />
              <span className="number">{projectStats.active}</span> Attivi
            </StatItem>
            <StatItem>
              <Image className="icon" size={16} />
              <span className="number">{projectStats.withImages}</span> Con immagini
            </StatItem>
          </Stats>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton
            variant="secondary"
            onClick={() => refreshProjects()}
            disabled={loading}
          >
            <Settings size={16} />
            Aggiorna
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleCreateProject}
          >
            <Plus size={16} />
            Nuovo Progetto
          </ActionButton>
        </HeaderActions>
      </Header>

      {/* Controls */}
      <Controls>
        <SearchInput
          type="text"
          placeholder="Cerca progetti per titolo, luogo, categoria..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as FilterOption)}
        >
          <option value="all">Tutti i progetti</option>
          <option value="active">Solo attivi</option>
          <option value="inactive">Solo inattivi</option>
          <option value="residential">Residenziale</option>
          <option value="commercial">Commerciale</option>
          <option value="industrial">Industriale</option>
          <option value="renovation">Ristrutturazione</option>
        </Select>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="order">Ordine personalizzato</option>
          <option value="newest">Più recenti</option>
          <option value="oldest">Più vecchi</option>
          <option value="title">Titolo A-Z</option>
        </Select>
      </Controls>

      {/* Bulk Actions */}
      {showBulkActions && (
        <BulkActions>
          <span className="count">{selectedProjects.length} progetti selezionati</span>
          <button 
            className="activate" 
            onClick={() => handleBulkAction('activate')}
          >
            Attiva
          </button>
          <button 
            className="deactivate" 
            onClick={() => handleBulkAction('deactivate')}
          >
            Disattiva
          </button>
          <button 
            className="delete" 
            onClick={() => handleBulkAction('delete')}
          >
            Elimina
          </button>
          <button onClick={() => setSelectedProjects([])}>
            Annulla selezione
          </button>
        </BulkActions>
      )}

      {/* Projects Grid */}
      {loading ? (
        <LoadingGrid>
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </LoadingGrid>
      ) : filteredProjects.length === 0 ? (
        <EmptyState>
          <div className="icon">📁</div>
          <h3>
            {searchQuery || filterBy !== 'all' 
              ? "Nessun progetto trovato" 
              : "Nessun progetto presente"
            }
          </h3>
          <p>
            {searchQuery || filterBy !== 'all' 
              ? "Prova a modificare i filtri di ricerca per trovare quello che stai cercando."
              : "Inizia creando il tuo primo progetto per mostrare il portfolio aziendale."
            }
          </p>
          {!searchQuery && filterBy === 'all' && (
            <ActionButton variant="primary" onClick={handleCreateProject}>
              <Plus size={16} />
              Crea il primo progetto
            </ActionButton>
          )}
        </EmptyState>
      ) : (
        <ProjectsGrid>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              selected={selectedProjects.includes(project.id)}
              onSelect={(selected) => handleProjectSelect(project.id, selected)}
              onEdit={() => handleEditProject(project)}
              onDelete={() => handleDeleteProject(project)}
              onToggleStatus={() => handleToggleStatus(project)}
              onManageImages={() => handleManageImages(project)}
            />
          ))}
        </ProjectsGrid>
      )}

      {/* Project Form Modal */}
      {isFormOpen && (
        <ProjectForm
          project={selectedProject}
          onSave={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedProject(null);
          }}
        />
      )}

      {/* Image Gallery Manager Modal */}
      {imageGalleryProject && (
        <ImageGalleryManager
          project={imageGalleryProject}
          onClose={() => setImageGalleryProject(null)}
          onUpdate={refreshProjects}
        />
      )}
    </Container>
  );
};

export default ProjectsManager;