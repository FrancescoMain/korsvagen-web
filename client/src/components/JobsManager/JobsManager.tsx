/**
 * JOBS MANAGER - Gestione Posizioni Lavorative Dashboard
 *
 * Componente per la gestione completa delle posizioni lavorative dalla dashboard admin.
 * Include funzionalità CRUD, gestione candidature, filtri e statistiche.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import {
  Plus,
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  BarChart3,
  Briefcase,
  Mail,
  Download,
  Calendar,
  MapPin,
  Building,
  Clock,
  User,
} from "lucide-react";
import JobPositionCard from "./JobPositionCard";
import JobPositionForm from "./JobPositionForm";
import ApplicationsManager from "./ApplicationsManager";
import { useJobs } from "../../hooks/useJobs";

// Types
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

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'success' }>`
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

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #d4af37;
          color: white;
          &:hover {
            background: #b8941f;
            transform: translateY(-1px);
          }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover {
            background: #218838;
            transform: translateY(-1px);
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
    transform: none;
  }
`;

const StatsCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
`;

const Controls = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
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

const TabContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 2rem;
  border: none;
  background: ${props => props.active ? '#d4af37' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? '#d4af37' : '#f8f9fa'};
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;

  h3 {
    margin-bottom: 1rem;
    color: #333;
  }

  p {
    margin-bottom: 2rem;
  }
`;

type ViewMode = 'positions' | 'applications';

const JobsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewMode>('positions');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosition | null>(null);
  
  const { 
    jobs, 
    applications,
    stats,
    departments,
    loading, 
    createJob, 
    updateJob, 
    deleteJob, 
    reorderJobs,
    fetchJobs,
    fetchApplications
  } = useJobs();

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && job.is_active) ||
                         (statusFilter === 'inactive' && !job.is_active);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleCreateJob = async (jobData: Partial<JobPosition>) => {
    try {
      await createJob(jobData);
      setShowForm(false);
      toast.success('Posizione lavorativa creata con successo!');
    } catch (error) {
      toast.error('Errore durante la creazione della posizione');
    }
  };

  const handleUpdateJob = async (jobData: Partial<JobPosition>) => {
    if (!editingJob) return;
    
    try {
      await updateJob(editingJob.id, jobData);
      setEditingJob(null);
      setShowForm(false);
      toast.success('Posizione lavorativa aggiornata con successo!');
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento della posizione');
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa posizione lavorativa?')) {
      return;
    }
    
    try {
      await deleteJob(id);
      toast.success('Posizione lavorativa eliminata con successo!');
    } catch (error) {
      toast.error('Errore durante l\'eliminazione della posizione');
    }
  };

  const handleEditJob = (job: JobPosition) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>
            <Briefcase />
            Gestione Lavora con Noi
          </Title>
          <Subtitle>
            Gestisci le posizioni lavorative e le candidature ricevute
          </Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton
            variant="primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Nuova Posizione
          </ActionButton>
        </HeaderActions>
      </Header>

      {/* Statistics Cards */}
      <StatsCards>
        <StatCard>
          <StatIcon color="#d4af37">
            <Briefcase />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.totalJobs || 0}</StatValue>
            <StatLabel>Posizioni Totali</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon color="#28a745">
            <Eye />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.activeJobs || 0}</StatValue>
            <StatLabel>Posizioni Attive</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon color="#17a2b8">
            <Users />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.totalApplications || 0}</StatValue>
            <StatLabel>Candidature Totali</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon color="#ffc107">
            <Mail />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.newApplications || 0}</StatValue>
            <StatLabel>Nuove Candidature</StatLabel>
          </StatContent>
        </StatCard>
      </StatsCards>

      {/* Tab Navigation */}
      <TabContainer>
        <TabHeader>
          <Tab 
            active={activeTab === 'positions'} 
            onClick={() => setActiveTab('positions')}
          >
            <Briefcase size={18} />
            Posizioni Lavorative ({jobs.length})
          </Tab>
          <Tab 
            active={activeTab === 'applications'} 
            onClick={() => setActiveTab('applications')}
          >
            <Users size={18} />
            Candidature ({applications.length})
          </Tab>
        </TabHeader>

        <TabContent>
          {activeTab === 'positions' && (
            <>
              {/* Controls */}
              <Controls>
                <SearchInput
                  type="text"
                  placeholder="Cerca posizioni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <FilterSelect
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">Tutti i dipartimenti</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </FilterSelect>
                
                <FilterSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="active">Attive</option>
                  <option value="inactive">Inattive</option>
                </FilterSelect>
              </Controls>

              {/* Jobs Grid */}
              {loading ? (
                <LoadingContainer>
                  Caricamento posizioni...
                </LoadingContainer>
              ) : filteredJobs.length > 0 ? (
                <JobsGrid>
                  {filteredJobs.map((job) => (
                    <JobPositionCard
                      key={job.id}
                      job={job}
                      onEdit={handleEditJob}
                      onDelete={handleDeleteJob}
                    />
                  ))}
                </JobsGrid>
              ) : (
                <EmptyState>
                  <h3>Nessuna posizione trovata</h3>
                  <p>
                    {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all' 
                      ? 'Prova a modificare i filtri di ricerca.'
                      : 'Inizia creando la tua prima posizione lavorativa.'
                    }
                  </p>
                  {!searchTerm && departmentFilter === 'all' && statusFilter === 'all' && (
                    <ActionButton
                      variant="primary"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus size={18} />
                      Crea Prima Posizione
                    </ActionButton>
                  )}
                </EmptyState>
              )}
            </>
          )}

          {activeTab === 'applications' && (
            <ApplicationsManager 
              applications={applications}
              jobs={jobs}
              onRefresh={fetchApplications}
            />
          )}
        </TabContent>
      </TabContainer>

      {/* Job Form Modal */}
      {showForm && (
        <JobPositionForm
          job={editingJob}
          departments={departments}
          onSave={editingJob ? handleUpdateJob : handleCreateJob}
          onCancel={handleCloseForm}
        />
      )}
    </Container>
  );
};

export default JobsManager;