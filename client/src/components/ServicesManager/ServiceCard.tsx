/**
 * SERVICE CARD - Card per singolo servizio
 */

import React from "react";
import styled from "styled-components";
import { Service } from "../../hooks/useServices";
import {
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Settings,
  Tag,
} from "lucide-react";

const Card = styled.div<{ isActive: boolean }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.isActive ? 'transparent' : '#ffa500'};
  opacity: ${props => props.isActive ? 1 : 0.7};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
`;

const StatusBadge = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => props.isActive ? `
    background: #d4edda;
    color: #155724;
  ` : `
    background: #f8d7da;
    color: #721c24;
  `}
`;

const ImageContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ServiceImage = styled.div<{ hasImage: boolean }>`
  width: 120px;
  height: 80px;
  border-radius: 8px;
  background: ${props => props.hasImage ? 'transparent' : 'linear-gradient(135deg, #1a1a1a, #2c2c2c)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  overflow: hidden;
  position: relative;
  margin-bottom: ${props => props.hasImage ? '0.5rem' : '0'};
`;

const ServiceImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const ImageActions = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const ImageActionBtn = styled.button`
  padding: 0.25rem 0.5rem;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
  }
`;

const ServiceTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #333;
  padding-right: 3rem; // Spazio per status badge
  line-height: 1.3;
`;

const ServiceSubtitle = styled.p`
  margin: 0 0 0.75rem 0;
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
`;

const ServiceDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const MicroservicesList = styled.div`
  margin-bottom: 1.5rem;
`;

const MicroservicesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const MicroservicesTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const MicroserviceTag = styled.span`
  padding: 0.25rem 0.5rem;
  background: #e8f4f8;
  color: #2c5aa0;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const CardMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const MetaItem = styled.div`
  .label {
    font-size: 0.8rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
  }
  .value {
    font-weight: 600;
    color: #333;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'warning' }>`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;

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
      case 'warning':
        return `
          background: #ffc107;
          color: #212529;
          &:hover { background: #e0a800; }
        `;
      default:
        return `
          background: #f8f9fa;
          color: #333;
          border: 1px solid #e0e0e0;
          &:hover { background: #e9ecef; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OrderControls = styled.div`
  display: flex;
  gap: 0.25rem;
`;

interface ServiceCardProps {
  service: Service;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUploadImage: () => void;
  onDeleteImage: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleActive: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onUploadImage,
  onDeleteImage,
  onMoveUp,
  onMoveDown,
  onToggleActive,
}) => {
  return (
    <Card isActive={service.is_active}>
      <CardHeader>
        <StatusBadge isActive={service.is_active}>
          {service.is_active ? 'Attivo' : 'Non Attivo'}
        </StatusBadge>

        <ImageContainer>
          <ServiceImage hasImage={!!service.image_url}>
            {service.image_url ? (
              <ServiceImg src={service.image_url} alt={service.title} />
            ) : (
              <Settings size={24} />
            )}
          </ServiceImage>
          <ImageActions>
            <ImageActionBtn onClick={onUploadImage} title="Carica immagine">
              <Upload size={12} />
            </ImageActionBtn>
            {service.image_url && (
              <ImageActionBtn onClick={onDeleteImage} title="Elimina immagine">
                <Trash2 size={12} />
              </ImageActionBtn>
            )}
          </ImageActions>
        </ImageContainer>

        <ServiceTitle>{service.title}</ServiceTitle>
        {service.subtitle && (
          <ServiceSubtitle>{service.subtitle}</ServiceSubtitle>
        )}
        <ServiceDescription>{service.description}</ServiceDescription>
      </CardHeader>

      <CardBody>
        {service.microservices && service.microservices.length > 0 && (
          <MicroservicesList>
            <MicroservicesTitle>
              <Tag size={14} />
              Micro-Servizi ({service.microservices.length})
            </MicroservicesTitle>
            <MicroservicesTags>
              {service.microservices.map((microservice, index) => (
                <MicroserviceTag key={index}>
                  {microservice}
                </MicroserviceTag>
              ))}
            </MicroservicesTags>
          </MicroservicesList>
        )}

        <CardMeta>
          <MetaItem>
            <div className="label">Ordine</div>
            <div className="value">#{service.display_order}</div>
          </MetaItem>
          <MetaItem>
            <div className="label">Stato</div>
            <div className="value">{service.is_active ? 'Pubblico' : 'Bozza'}</div>
          </MetaItem>
        </CardMeta>

        <CardActions>
          <ActionButton variant="primary" onClick={onEdit}>
            <Edit size={14} />
            Modifica
          </ActionButton>
          
          <ActionButton
            variant={service.is_active ? 'warning' : 'secondary'}
            onClick={onToggleActive}
          >
            {service.is_active ? (
              <>
                <EyeOff size={14} />
                Nascondi
              </>
            ) : (
              <>
                <Eye size={14} />
                Pubblica
              </>
            )}
          </ActionButton>

          <OrderControls>
            <ActionButton
              variant="secondary"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              title="Sposta su"
            >
              <ChevronUp size={14} />
            </ActionButton>
            <ActionButton
              variant="secondary"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              title="Sposta giù"
            >
              <ChevronDown size={14} />
            </ActionButton>
          </OrderControls>

          <ActionButton variant="danger" onClick={onDelete}>
            <Trash2 size={14} />
            Elimina
          </ActionButton>
        </CardActions>
      </CardBody>
    </Card>
  );
};

export default ServiceCard;