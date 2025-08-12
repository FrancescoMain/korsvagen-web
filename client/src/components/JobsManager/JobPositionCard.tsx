/**
 * JOB POSITION CARD - Card per posizione lavorativa
 *
 * Componente per visualizzare i dettagli di una posizione lavorativa
 * nella dashboard admin con azioni di modifica ed eliminazione.
 */

import React from "react";
import styled from "styled-components";
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Building,
  Clock,
  Users,
  Euro,
  Calendar,
  MoreVertical,
  ExternalLink,
} from "lucide-react";

interface JobPosition {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  description: string;
  requirements: string;
  nice_to_have?: string;
  benefits?: string;
  salary_range?: string;
  is_active: boolean;
  applications_count: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  job: JobPosition;
  onEdit: (job: JobPosition) => void;
  onDelete: (id: number) => void;
  onToggleActive?: (id: number) => void;
}

const Card = styled.div<{ isActive: boolean }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.isActive ? '#d4af37' : 'transparent'};
  opacity: ${props => props.isActive ? 1 : 0.7};

  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  position: relative;
`;

const StatusBadge = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => props.isActive ? '#d4af37' : '#6c757d'};
  color: white;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const JobTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.3rem;
  line-height: 1.3;
  padding-right: 4rem;
`;

const JobMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;

  svg {
    color: #d4af37;
  }
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const Description = styled.p`
  color: #555;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Requirements = styled.div`
  margin-bottom: 1rem;

  h4 {
    color: #333;
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  li {
    background: #f8f9fa;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #666;
    border: 1px solid #e9ecef;
  }
`;

const ApplicationsCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  color: #333;
  font-weight: 600;
`;

const CardActions = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #d4af37;
          color: white;
          &:hover {
            background: #b8941f;
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover {
            background: #c82333;
          }
        `;
      default:
        return `
          background: #f8f9fa;
          color: #333;
          border: 1px solid #e0e0e0;
          &:hover {
            background: #e9ecef;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SalaryRange = styled.div`
  background: linear-gradient(45deg, #d4af37, #f4e06d);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const JobPositionCard: React.FC<Props> = ({ 
  job, 
  onEdit, 
  onDelete, 
  onToggleActive 
}) => {
  // Parse requirements for display
  const requirementsList = job.requirements
    .split('\n')
    .filter(req => req.trim())
    .slice(0, 4); // Show only first 4 requirements

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return '#28a745';
      case 'Part-time': return '#17a2b8';
      case 'Contract': return '#ffc107';
      case 'Internship': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getExperienceLevelIcon = (level: string) => {
    switch (level) {
      case 'Junior': return '🌱';
      case 'Mid': return '🌿';
      case 'Senior': return '🌳';
      case 'Lead': return '👑';
      case 'Executive': return '💎';
      default: return '👤';
    }
  };

  return (
    <Card isActive={job.is_active}>
      <CardHeader>
        <StatusBadge isActive={job.is_active}>
          {job.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
          {job.is_active ? 'Attiva' : 'Inattiva'}
        </StatusBadge>
        
        <JobTitle>{job.title}</JobTitle>
        
        <JobMeta>
          <MetaItem>
            <Building size={16} />
            {job.department}
          </MetaItem>
          
          <MetaItem>
            <MapPin size={16} />
            {job.location}
          </MetaItem>
          
          <MetaItem>
            <Clock size={16} />
            {job.employment_type}
          </MetaItem>
          
          <MetaItem>
            <span>{getExperienceLevelIcon(job.experience_level)}</span>
            {job.experience_level}
          </MetaItem>
        </JobMeta>
      </CardHeader>

      <CardBody>
        <Description>{job.description}</Description>
        
        <Requirements>
          <h4>Requisiti principali:</h4>
          <ul>
            {requirementsList.map((req, index) => (
              <li key={index}>{req.trim()}</li>
            ))}
            {job.requirements.split('\n').filter(req => req.trim()).length > 4 && (
              <li>+{job.requirements.split('\n').filter(req => req.trim()).length - 4} altri...</li>
            )}
          </ul>
        </Requirements>

        {job.salary_range && (
          <SalaryRange>
            <Euro size={16} />
            {job.salary_range}
          </SalaryRange>
        )}
      </CardBody>

      <ApplicationsCount>
        <Users size={18} />
        {job.applications_count} candidatur{job.applications_count !== 1 ? 'e' : 'a'}
        <small style={{ color: '#666', marginLeft: '0.5rem' }}>
          • Creata il {formatDate(job.created_at)}
        </small>
      </ApplicationsCount>

      <CardActions>
        <ActionButton
          onClick={() => window.open(`/lavora-con-noi/${job.slug}`, '_blank')}
          title="Visualizza pagina pubblica"
        >
          <ExternalLink size={16} />
          Visualizza
        </ActionButton>

        <ActionGroup>
          <ActionButton
            variant="primary"
            onClick={() => onEdit(job)}
            title="Modifica posizione"
          >
            <Edit size={16} />
            Modifica
          </ActionButton>
          
          <ActionButton
            variant="danger"
            onClick={() => onDelete(job.id)}
            title={job.applications_count > 0 ? 
              `Impossibile eliminare: ci sono ${job.applications_count} candidature` : 
              'Elimina posizione'
            }
            disabled={job.applications_count > 0}
          >
            <Trash2 size={16} />
            Elimina
          </ActionButton>
        </ActionGroup>
      </CardActions>
    </Card>
  );
};

export default JobPositionCard;