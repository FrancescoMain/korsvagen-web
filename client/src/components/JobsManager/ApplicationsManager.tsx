/**
 * APPLICATIONS MANAGER - Gestione Candidature
 *
 * Componente per la gestione delle candidature ricevute con filtri,
 * aggiornamento status, visualizzazione dettagli e download CV.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Application {
  id: number;
  job_position_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  cv_url?: string;
  cv_public_id?: string;
  cover_letter?: string;
  linkedin_profile?: string;
  portfolio_url?: string;
  status: 'new' | 'reviewed' | 'contacted' | 'interview' | 'hired' | 'rejected';
  admin_notes?: string;
  applied_at: string;
  updated_at: string;
  job_title?: string;
  job_department?: string;
}

interface JobPosition {
  id: number;
  title: string;
  department: string;
}

interface Props {
  applications: Application[];
  jobs: JobPosition[];
  onRefresh: () => void;
}

const Container = styled.div`
  width: 100%;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-width: 200px;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  }
`;

const RefreshButton = styled.button`
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

const ApplicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ApplicationCard = styled.div`
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ApplicantInfo = styled.div`
  flex: 1;
`;

const ApplicantName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const ApplicantMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #666;
  font-size: 0.9rem;

  svg {
    color: #d4af37;
  }
`;

const JobInfo = styled.div`
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const JobTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const JobDepartment = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const CardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const StatusSelect = styled.select<{ status: string }>`
  padding: 0.5rem 0.75rem;
  border: 2px solid;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  background: white;
  min-width: 140px;

  ${props => {
    switch (props.status) {
      case 'new':
        return 'border-color: #007bff; color: #007bff;';
      case 'reviewed':
        return 'border-color: #ffc107; color: #ffc107;';
      case 'contacted':
        return 'border-color: #17a2b8; color: #17a2b8;';
      case 'interview':
        return 'border-color: #6f42c1; color: #6f42c1;';
      case 'hired':
        return 'border-color: #28a745; color: #28a745;';
      case 'rejected':
        return 'border-color: #dc3545; color: #dc3545;';
      default:
        return 'border-color: #6c757d; color: #6c757d;';
    }
  }}

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

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
`;

const AppliedDate = styled.div`
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const CardBody = styled.div<{ isExpanded: boolean }>`
  border-top: 1px solid #eee;
  padding: ${props => props.isExpanded ? '1.5rem' : '0'};
  max-height: ${props => props.isExpanded ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
`;

const DetailContent = styled.div`
  color: #555;
  line-height: 1.6;
`;

const ContactLinks = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const ContactLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #d4af37;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
    text-decoration: none;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #333;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;

  h3 {
    margin-bottom: 1rem;
    color: #333;
  }
`;

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nuova', color: '#007bff' },
  { value: 'reviewed', label: 'Valutata', color: '#ffc107' },
  { value: 'contacted', label: 'Contattata', color: '#17a2b8' },
  { value: 'interview', label: 'Colloquio', color: '#6f42c1' },
  { value: 'hired', label: 'Assunta', color: '#28a745' },
  { value: 'rejected', label: 'Rifiutata', color: '#dc3545' }
];

const ApplicationsManager: React.FC<Props> = ({ applications, jobs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.job_title && app.job_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesJob = jobFilter === 'all' || app.job_position_id.toString() === jobFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesJob && matchesStatus;
  });

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        console.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleDeleteApplication = async (applicationId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa candidatura?')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/applications/${applicationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        onRefresh();
      } else {
        console.error('Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const handleDownloadCV = async (applicationId: number) => {
    try {
      // Usa l'URL completo del backend configurato
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://korsvagen-web-be.vercel.app/api';
      const downloadUrl = `${API_BASE_URL}/jobs/applications/${applicationId}/cv`;
      
      // Fetch il file per controllare il nome e estensione
      const response = await fetch(downloadUrl, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('korsvagen_auth_token') || sessionStorage.getItem('korsvagen_auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Errore nel download del CV');
      }
      
      // Crea blob dal contenuto
      const blob = await response.blob();
      
      // Crea URL temporaneo
      const url = window.URL.createObjectURL(blob);
      
      // Trova l'applicazione per ottenere il nome
      const application = applications.find(app => app.id === applicationId);
      const fileName = application 
        ? `CV_${application.first_name}_${application.last_name}.pdf`
        : `CV_Application_${applicationId}.pdf`;
      
      // Crea link temporaneo con nome file corretto
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Esegui download
      document.body.appendChild(link);
      link.click();
      
      // Pulizia
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Errore download CV:', error);
      // Fallback al metodo diretto se fetch fallisce
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://korsvagen-web-be.vercel.app/api';
      const token = localStorage.getItem('korsvagen_auth_token') || sessionStorage.getItem('korsvagen_auth_token');
      const downloadUrl = `${API_BASE_URL}/jobs/applications/${applicationId}/cv${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      window.open(downloadUrl, '_blank');
    }
  };

  const toggleCardExpansion = (applicationId: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedCards(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(option => option.value === status)?.label || status;
  };

  return (
    <Container>
      <Controls>
        <SearchInput
          type="text"
          placeholder="Cerca candidature..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSelect
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
        >
          <option value="all">Tutte le posizioni</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id.toString()}>
              {job.title}
            </option>
          ))}
        </FilterSelect>
        
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tutti gli stati</option>
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>

        <RefreshButton onClick={onRefresh}>
          <RefreshCw size={16} />
          Aggiorna
        </RefreshButton>
      </Controls>

      {filteredApplications.length > 0 ? (
        <ApplicationsList>
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id}>
              <CardHeader>
                <ApplicantInfo>
                  <ApplicantName>
                    {application.first_name} {application.last_name}
                  </ApplicantName>
                  
                  <ApplicantMeta>
                    <MetaItem>
                      <Mail size={14} />
                      {application.email}
                    </MetaItem>
                    
                    {application.phone && (
                      <MetaItem>
                        <Phone size={14} />
                        {application.phone}
                      </MetaItem>
                    )}
                    
                    <AppliedDate>
                      <Calendar size={14} />
                      {formatDate(application.applied_at)}
                    </AppliedDate>
                  </ApplicantMeta>

                  {(application.job_title || application.job_department) && (
                    <JobInfo>
                      <JobTitle>{application.job_title}</JobTitle>
                      {application.job_department && (
                        <JobDepartment>{application.job_department}</JobDepartment>
                      )}
                    </JobInfo>
                  )}
                </ApplicantInfo>

                <CardActions>
                  <StatusSelect
                    status={application.status}
                    value={application.status}
                    onChange={(e) => handleStatusChange(application.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </StatusSelect>

                  <ActionButtons>
                    <ToggleButton
                      onClick={() => toggleCardExpansion(application.id)}
                      title={expandedCards.has(application.id) ? 'Chiudi dettagli' : 'Mostra dettagli'}
                    >
                      {expandedCards.has(application.id) ? 
                        <ChevronUp size={16} /> : 
                        <ChevronDown size={16} />
                      }
                    </ToggleButton>
                    
                    {application.cv_url && (
                      <ActionButton
                        onClick={() => handleDownloadCV(application.id)}
                        title="Scarica CV"
                      >
                        <Download size={16} />
                      </ActionButton>
                    )}
                    
                    <ActionButton
                      variant="danger"
                      onClick={() => handleDeleteApplication(application.id)}
                      title="Elimina candidatura"
                    >
                      <Trash2 size={16} />
                    </ActionButton>
                  </ActionButtons>
                </CardActions>
              </CardHeader>

              <CardBody isExpanded={expandedCards.has(application.id)}>
                {application.cover_letter && (
                  <DetailSection>
                    <DetailTitle>Lettera di Presentazione</DetailTitle>
                    <DetailContent>{application.cover_letter}</DetailContent>
                  </DetailSection>
                )}

                {(application.linkedin_profile || application.portfolio_url) && (
                  <DetailSection>
                    <DetailTitle>Collegamenti</DetailTitle>
                    <ContactLinks>
                      {application.linkedin_profile && (
                        <ContactLink 
                          href={application.linkedin_profile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={14} />
                          LinkedIn
                        </ContactLink>
                      )}
                      {application.portfolio_url && (
                        <ContactLink 
                          href={application.portfolio_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={14} />
                          Portfolio
                        </ContactLink>
                      )}
                    </ContactLinks>
                  </DetailSection>
                )}

                {application.admin_notes && (
                  <DetailSection>
                    <DetailTitle>Note Amministrative</DetailTitle>
                    <DetailContent>{application.admin_notes}</DetailContent>
                  </DetailSection>
                )}
              </CardBody>
            </ApplicationCard>
          ))}
        </ApplicationsList>
      ) : (
        <EmptyState>
          <h3>Nessuna candidatura trovata</h3>
          <p>
            {searchTerm || jobFilter !== 'all' || statusFilter !== 'all' 
              ? 'Prova a modificare i filtri di ricerca.'
              : 'Non sono ancora arrivate candidature.'
            }
          </p>
        </EmptyState>
      )}
    </Container>
  );
};

export default ApplicationsManager;