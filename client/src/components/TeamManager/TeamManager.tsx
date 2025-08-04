/**
 * TEAM MANAGER - Gestione Membri del Team Dashboard
 *
 * Componente per la gestione completa dei membri del team dalla dashboard admin.
 * Include funzionalità CRUD, upload CV, riordinamento e gestione visibilità.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTeam, type TeamMember } from "../../hooks/useTeam";
import TeamMemberForm from "./TeamMemberForm";
import TeamMemberCard from "./TeamMemberCard";
import CVUploadModal from "./CVUploadModal";
import toast from "react-hot-toast";
import {
  Plus,
  Users,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

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
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
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

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #d4af37;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: #666;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    margin-bottom: 2rem;
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #c33;
`;

interface TeamManagerProps {}

const TeamManager: React.FC<TeamManagerProps> = () => {
  const { 
    members, 
    loading, 
    error, 
    uploading,
    fetchMembers, 
    createMember, 
    updateMember, 
    deleteMember,
    uploadCV,
    deleteCV,
    reorderMembers,
    refreshMembers
  } = useTeam();

  // Stati locali
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [cvMemberId, setCvMemberId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Carica membri al mount
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Membri filtrati
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && member.is_active) ||
                         (filterStatus === "inactive" && !member.is_active);

    return matchesSearch && matchesFilter;
  });

  // Statistiche
  const stats = {
    total: members.length,
    active: members.filter(m => m.is_active).length,
    withCV: members.filter(m => m.cv_file_url).length,
    inactive: members.filter(m => !m.is_active).length,
  };

  // Handlers
  const handleCreateMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (window.confirm(`Sei sicuro di voler eliminare ${member.name} dal team? Questa azione non può essere annullata.`)) {
      await deleteMember(member.id);
    }
  };

  const handleUploadCV = (memberId: string) => {
    setCvMemberId(memberId);
    setShowCVModal(true);
  };

  const handleDeleteCV = async (memberId: string, memberName: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare il CV di ${memberName}?`)) {
      await deleteCV(memberId);
    }
  };

  const handleFormSubmit = async (memberData: any) => {
    let success = false;
    
    if (editingMember) {
      success = await updateMember(editingMember.id, memberData);
    } else {
      success = await createMember(memberData);
    }

    if (success) {
      setShowForm(false);
      setEditingMember(null);
    }
  };

  const handleCVUpload = async (file: File) => {
    if (cvMemberId) {
      const success = await uploadCV(cvMemberId, file);
      if (success) {
        setShowCVModal(false);
        setCvMemberId(null);
      }
    }
  };

  const handleMoveUp = async (member: TeamMember) => {
    const currentIndex = members.findIndex(m => m.id === member.id);
    if (currentIndex > 0) {
      const newOrder = [...members];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      const memberIds = newOrder.map(m => m.id);
      await reorderMembers(memberIds);
    }
  };

  const handleMoveDown = async (member: TeamMember) => {
    const currentIndex = members.findIndex(m => m.id === member.id);
    if (currentIndex < members.length - 1) {
      const newOrder = [...members];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      const memberIds = newOrder.map(m => m.id);
      await reorderMembers(memberIds);
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    await updateMember(member.id, { is_active: !member.is_active });
  };

  if (loading && members.length === 0) {
    return (
      <Container>
        <LoadingSpinner>Caricamento membri del team...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>
            <Users size={24} />
            Gestione Team
          </Title>
          <Subtitle>Gestisci i membri del team, i loro CV e l'ordine di visualizzazione</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton variant="secondary" onClick={refreshMembers} disabled={loading}>
            Aggiorna
          </ActionButton>
          <ActionButton variant="primary" onClick={handleCreateMember}>
            <Plus size={16} />
            Nuovo Membro
          </ActionButton>
        </HeaderActions>
      </Header>

      {error && (
        <ErrorMessage>
          <strong>Errore:</strong> {error}
        </ErrorMessage>
      )}

      {/* Statistiche */}
      <Stats>
        <StatCard>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Totale Membri</div>
        </StatCard>
        <StatCard>
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Membri Attivi</div>
        </StatCard>
        <StatCard>
          <div className="stat-number">{stats.withCV}</div>
          <div className="stat-label">Con CV</div>
        </StatCard>
        <StatCard>
          <div className="stat-number">{stats.inactive}</div>
          <div className="stat-label">Non Attivi</div>
        </StatCard>
      </Stats>

      {/* Controlli */}
      <Controls>
        <Search size={20} color="#666" />
        <SearchInput
          type="text"
          placeholder="Cerca membri per nome o ruolo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Filter size={20} color="#666" />
        <FilterSelect
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
        >
          <option value="all">Tutti i membri</option>
          <option value="active">Solo attivi</option>
          <option value="inactive">Solo non attivi</option>
        </FilterSelect>
      </Controls>

      {/* Lista membri */}
      {filteredMembers.length === 0 ? (
        <EmptyState>
          <div className="icon">👥</div>
          <h3>
            {searchTerm || filterStatus !== "all" 
              ? "Nessun membro trovato" 
              : "Nessun membro nel team"
            }
          </h3>
          <p>
            {searchTerm || filterStatus !== "all"
              ? "Prova a modificare i filtri di ricerca."
              : "Inizia aggiungendo il primo membro del team."
            }
          </p>
          {!searchTerm && filterStatus === "all" && (
            <ActionButton variant="primary" onClick={handleCreateMember}>
              <Plus size={16} />
              Aggiungi Primo Membro
            </ActionButton>
          )}
        </EmptyState>
      ) : (
        <MembersGrid>
          {filteredMembers.map((member, index) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              canMoveUp={index > 0}
              canMoveDown={index < filteredMembers.length - 1}
              onEdit={() => handleEditMember(member)}
              onDelete={() => handleDeleteMember(member)}
              onUploadCV={() => handleUploadCV(member.id)}
              onDeleteCV={() => handleDeleteCV(member.id, member.name)}
              onMoveUp={() => handleMoveUp(member)}
              onMoveDown={() => handleMoveDown(member)}
              onToggleActive={() => handleToggleActive(member)}
            />
          ))}
        </MembersGrid>
      )}

      {/* Form Membro */}
      {showForm && (
        <TeamMemberForm
          member={editingMember}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
          loading={loading}
        />
      )}

      {/* Modal CV Upload */}
      {showCVModal && cvMemberId && (
        <CVUploadModal
          memberId={cvMemberId}
          memberName={members.find(m => m.id === cvMemberId)?.name || ""}
          onUpload={handleCVUpload}
          onCancel={() => {
            setShowCVModal(false);
            setCvMemberId(null);
          }}
          uploading={uploading}
        />
      )}
    </Container>
  );
};

export default TeamManager;