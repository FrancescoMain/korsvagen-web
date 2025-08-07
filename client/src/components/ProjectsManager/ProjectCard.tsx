/**
 * PROJECT CARD - Card singola per la gestione progetti
 *
 * Card componente che mostra le informazioni di un progetto nella dashboard admin
 * con azioni di modifica, eliminazione, attivazione/disattivazione e gestione immagini.
 */

import React from "react";
import styled from "styled-components";
import { Project } from "../../hooks/useProjects";
import {
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Image,
  Calendar,
  MapPin,
  User,
  Target,
  DollarSign,
  Clock,
  MoreVertical,
  Check,
} from "lucide-react";

interface ProjectCardProps {
  project: Project;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  onManageImages?: () => void;
}

const Card = styled.div<{ isActive: boolean; selected: boolean }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  border: 2px solid ${props => props.selected ? '#d4af37' : 'transparent'};
  opacity: ${props => props.isActive ? 1 : 0.7};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  ${props => !props.isActive && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(0, 0, 0, 0.03) 10px,
        rgba(0, 0, 0, 0.03) 20px
      );
      pointer-events: none;
      z-index: 1;
    }
  `}
`;

const CardHeader = styled.div`
  position: relative;
  padding: 1.5rem;
  padding-bottom: 0;
`;

const SelectCheckbox = styled.label`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  cursor: pointer;
  z-index: 2;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 24px;
    width: 24px;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid #ddd;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  input:checked ~ .checkmark {
    background: #d4af37;
    border-color: #d4af37;
  }

  .checkmark:after {
    content: "";
    display: none;
  }

  input:checked ~ .checkmark:after {
    display: block;
  }

  input:checked ~ .checkmark svg {
    color: white;
  }
`;

const StatusBadge = styled.div<{ status: string }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${props => {
    switch (props.status.toLowerCase()) {
      case 'completato':
        return `
          background: #e8f5e8;
          color: #2d5a2d;
          border: 1px solid #4caf50;
        `;
      case 'in corso':
        return `
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffc107;
        `;
      case 'progettazione':
        return `
          background: #e3f2fd;
          color: #1565c0;
          border: 1px solid #2196f3;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
          border: 1px solid #ddd;
        `;
    }
  }}
`;

const ImagePreview = styled.div<{ hasImage: boolean }>`
  width: 100%;
  height: 200px;
  background: ${props => 
    props.hasImage 
      ? 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' 
      : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
  };
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
    opacity: ${props => props.hasImage ? 1 : 0};
  }

  .placeholder {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    z-index: 1;
    color: ${props => props.hasImage ? 'white' : '#999'};
    text-shadow: ${props => props.hasImage ? '0 1px 3px rgba(0,0,0,0.5)' : 'none'};
  }
`;

const CardContent = styled.div`
  padding: 0 1.5rem 1.5rem;
`;

const Title = styled.h3`
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CategoryBadge = styled.div`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: #f0f8ff;
  color: #0066cc;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 1rem;
  text-transform: capitalize;
`;

const MetaInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;

  .icon {
    color: #d4af37;
    flex-shrink: 0;
  }

  .label {
    font-weight: 500;
    color: #333;
  }
`;

const Description = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const FeaturesPreview = styled.div`
  margin-bottom: 1.5rem;

  .label {
    font-size: 0.8rem;
    color: #666;
    font-weight: 500;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .features {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .feature {
    background: #f8f9fa;
    color: #555;
    padding: 0.3rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    border: 1px solid #e9ecef;
  }

  .more {
    background: #e9ecef;
    color: #777;
    font-style: italic;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
  padding: 0.6rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex: 1;
  min-width: 36px;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #d4af37;
          color: white;
          &:hover { background: #b8941f; }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
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
    transform: none !important;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
`;

const InactiveOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 2rem;
  border-radius: 8px;
  border: 2px solid #ffc107;
  color: #856404;
  font-weight: 600;
  text-align: center;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  onManageImages,
}) => {
  const maxFeatures = 3;
  const displayFeatures = project.features.slice(0, maxFeatures);
  const remainingFeatures = project.features.length - maxFeatures;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card isActive={project.is_active} selected={selected}>
      <CardHeader>
        <SelectCheckbox>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect?.(e.target.checked)}
          />
          <span className="checkmark">
            <Check size={14} />
          </span>
        </SelectCheckbox>

        <StatusBadge status={project.status}>
          {project.status}
        </StatusBadge>

        <ImagePreview 
          hasImage={!!project.cover_image_url}
          style={project.cover_image_url ? {
            backgroundImage: `url(${project.cover_image_url})`
          } : {}}
        >
          <div className="placeholder">
            <Image size={20} />
            {project.cover_image_url ? project.cover_image_title || 'Immagine copertina' : 'Nessuna immagine'}
          </div>
        </ImagePreview>
      </CardHeader>

      <CardContent>
        <CategoryBadge>{project.label}</CategoryBadge>
        
        <Title>{project.title}</Title>
        
        {project.subtitle && (
          <Subtitle>{project.subtitle}</Subtitle>
        )}

        <MetaInfo>
          <MetaItem>
            <Calendar className="icon" size={14} />
            <span className="label">{project.year}</span>
          </MetaItem>
          <MetaItem>
            <MapPin className="icon" size={14} />
            <span className="label">{project.location}</span>
          </MetaItem>
          {project.client && (
            <MetaItem>
              <User className="icon" size={14} />
              <span className="label">{project.client}</span>
            </MetaItem>
          )}
          {project.surface && (
            <MetaItem>
              <Target className="icon" size={14} />
              <span className="label">{project.surface}</span>
            </MetaItem>
          )}
        </MetaInfo>

        <Description>{project.description}</Description>

        {project.features.length > 0 && (
          <FeaturesPreview>
            <div className="label">Caratteristiche</div>
            <div className="features">
              {displayFeatures.map((feature, index) => (
                <span key={index} className="feature">
                  {feature}
                </span>
              ))}
              {remainingFeatures > 0 && (
                <span className="feature more">
                  +{remainingFeatures} altre
                </span>
              )}
            </div>
          </FeaturesPreview>
        )}

        <CardActions>
          <ActionButton variant="primary" onClick={onEdit} title="Modifica progetto">
            <Edit3 size={16} />
          </ActionButton>
          
          <ActionButton onClick={onManageImages} title="Gestisci immagini">
            <Image size={16} />
          </ActionButton>
          
          <ActionButton 
            variant={project.is_active ? "secondary" : "success"}
            onClick={onToggleStatus}
            title={project.is_active ? "Disattiva progetto" : "Attiva progetto"}
          >
            {project.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
          </ActionButton>
          
          <ActionButton variant="danger" onClick={onDelete} title="Elimina progetto">
            <Trash2 size={16} />
          </ActionButton>
        </CardActions>
      </CardContent>

      {!project.is_active && (
        <InactiveOverlay>
          <div>PROGETTO DISATTIVATO</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '0.25rem' }}>
            Non visibile pubblicamente
          </div>
        </InactiveOverlay>
      )}
    </Card>
  );
};

export default ProjectCard;