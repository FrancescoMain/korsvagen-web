/**
 * TEAM MEMBER CARD - Card per singolo membro del team
 */

import React from "react";
import styled from "styled-components";
import { TeamMember } from "../../hooks/useTeam";
import {
  Edit,
  Trash2,
  Upload,
  Download,
  FileText,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  User,
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

const MemberAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a1a, #2c2c2c);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const MemberName = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  padding-right: 80px;
`;

const MemberRole = styled.p`
  color: #d4af37;
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MemberDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  .label {
    font-size: 0.8rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
  }
  
  .value {
    font-size: 0.9rem;
    color: #333;
    font-weight: 500;
  }
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SkillTag = styled.span`
  background: #f8f9fa;
  color: #333;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #e0e0e0;
`;

const CVInfo = styled.div<{ hasCV: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  
  ${props => props.hasCV ? `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  ` : `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  justify-content: center;
  min-width: 0;

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
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover { background: #218838; }
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
  margin-left: auto;
`;

interface TeamMemberCardProps {
  member: TeamMember;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUploadCV: () => void;
  onDeleteCV: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleActive: () => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onUploadCV,
  onDeleteCV,
  onMoveUp,
  onMoveDown,
  onToggleActive,
}) => {
  const handleCVDownload = () => {
    if (member.cv_file_url || member.id) {
      // Usa l'URL completo del backend configurato nell'apiClient
      const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
      const downloadUrl = `${API_BASE_URL}/team/${member.id}/cv`;
      
      // Apri direttamente nell'URL per sfruttare la gestione server-side
      window.location.href = downloadUrl;
    }
  };

  return (
    <Card isActive={member.is_active}>
      <CardHeader>
        <StatusBadge isActive={member.is_active}>
          {member.is_active ? 'Attivo' : 'Non Attivo'}
        </StatusBadge>
        
        <MemberAvatar>
          {member.placeholder}
        </MemberAvatar>
        
        <MemberName>{member.name}</MemberName>
        <MemberRole>{member.role}</MemberRole>
        
        {member.short_description && (
          <MemberDescription>{member.short_description}</MemberDescription>
        )}
      </CardHeader>

      <CardBody>
        <InfoGrid>
          <InfoItem>
            <div className="label">Esperienza</div>
            <div className="value">{member.experience || 'Non specificata'}</div>
          </InfoItem>
          <InfoItem>
            <div className="label">Ordine</div>
            <div className="value">#{member.display_order}</div>
          </InfoItem>
        </InfoGrid>

        {member.skills && member.skills.length > 0 && (
          <SkillsList>
            {member.skills.slice(0, 4).map((skill, index) => (
              <SkillTag key={index}>{skill}</SkillTag>
            ))}
            {member.skills.length > 4 && (
              <SkillTag>+{member.skills.length - 4} altre</SkillTag>
            )}
          </SkillsList>
        )}

        <CVInfo hasCV={!!member.cv_file_url}>
          <FileText size={16} />
          {member.cv_file_url ? (
            <span>CV: {member.cv_file_name || 'Disponibile'}</span>
          ) : (
            <span>Nessun CV caricato</span>
          )}
        </CVInfo>

        <ActionButtons>
          <ActionButton onClick={onEdit}>
            <Edit size={14} />
            Modifica
          </ActionButton>
          
          <ActionButton 
            variant={member.is_active ? "secondary" : "success"}
            onClick={onToggleActive}
          >
            {member.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
            {member.is_active ? 'Nascondi' : 'Attiva'}
          </ActionButton>

          {member.cv_file_url ? (
            <>
              <ActionButton onClick={handleCVDownload}>
                <Download size={14} />
                Scarica CV
              </ActionButton>
              <ActionButton variant="danger" onClick={onDeleteCV}>
                <Trash2 size={14} />
                Rimuovi CV
              </ActionButton>
            </>
          ) : (
            <ActionButton variant="primary" onClick={onUploadCV}>
              <Upload size={14} />
              Carica CV
            </ActionButton>
          )}

          <OrderControls>
            <ActionButton 
              onClick={onMoveUp} 
              disabled={!canMoveUp}
              title="Sposta su"
            >
              <ChevronUp size={14} />
            </ActionButton>
            <ActionButton 
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
        </ActionButtons>
      </CardBody>
    </Card>
  );
};

export default TeamMemberCard;