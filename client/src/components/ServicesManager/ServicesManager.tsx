/**
 * SERVICES MANAGER - Gestione Servizi Dashboard
 *
 * Componente per la gestione completa dei servizi aziendali dalla dashboard admin.
 * Include funzionalità CRUD, upload immagini, riordinamento e gestione visibilità.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useServices, type Service } from "../../hooks/useServices";
import ServiceForm from "./ServiceForm";
import ServiceCard from "./ServiceCard";
import ImageUploadModal from "./ImageUploadModal";
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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
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

interface ServicesManagerProps {}

const ServicesManager: React.FC<ServicesManagerProps> = () => {
  const { 
    services, 
    loading, 
    error, 
    uploading,
    stats,
    fetchServices, 
    createService, 
    updateService, 
    deleteService,
    uploadImage,
    deleteImage,
    reorderServices,
    refreshServices
  } = useServices();

  // Stati locali
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageServiceId, setImageServiceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Carica servizi al mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Verifica stato database se non ci sono servizi
  useEffect(() => {
    if (!loading && services.length === 0 && !error) {
      console.warn("⚠️ Nessun servizio trovato nel database. Verifica che lo schema SQL sia stato eseguito.");
    }
  }, [loading, services.length, error]);

  // Servizi filtrati
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "active" && service.is_active) ||
                         (filterStatus === "inactive" && !service.is_active);

    return matchesSearch && matchesFilter;
  });

  // Handlers
  const handleCreateService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDeleteService = async (service: Service) => {
    if (window.confirm(`Sei sicuro di voler eliminare il servizio "${service.title}"? Questa azione non può essere annullata.`)) {
      await deleteService(service.id);
    }
  };

  const handleUploadImage = (serviceId: string) => {
    setImageServiceId(serviceId);
    setShowImageModal(true);
  };

  const handleDeleteImage = async (serviceId: string, serviceTitle: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare l'immagine del servizio "${serviceTitle}"?`)) {
      await deleteImage(serviceId);
    }
  };

  const handleFormSubmit = async (serviceData: any) => {
    let success = false;
    
    if (editingService) {
      success = await updateService(editingService.id, serviceData);
    } else {
      success = await createService(serviceData);
    }

    if (success) {
      setShowForm(false);
      setEditingService(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (imageServiceId) {
      const success = await uploadImage(imageServiceId, file);
      if (success) {
        setShowImageModal(false);
        setImageServiceId(null);
      }
    }
  };

  const handleMoveUp = async (service: Service) => {
    const currentIndex = services.findIndex(s => s.id === service.id);
    if (currentIndex > 0) {
      const newOrder = [...services];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      const serviceIds = newOrder.map(s => s.id);
      await reorderServices(serviceIds);
    }
  };

  const handleMoveDown = async (service: Service) => {
    const currentIndex = services.findIndex(s => s.id === service.id);
    if (currentIndex < services.length - 1) {
      const newOrder = [...services];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      const serviceIds = newOrder.map(s => s.id);
      await reorderServices(serviceIds);
    }
  };

  const handleToggleActive = async (service: Service) => {
    await updateService(service.id, { is_active: !service.is_active });
  };

  if (loading && services.length === 0) {
    return (
      <Container>
        <LoadingSpinner>Caricamento servizi...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>
            <Settings size={24} />
            Gestione Servizi
          </Title>
          <Subtitle>Gestisci i servizi aziendali, le loro immagini e l'ordine di visualizzazione</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton variant="secondary" onClick={refreshServices} disabled={loading}>
            Aggiorna
          </ActionButton>
          <ActionButton variant="primary" onClick={handleCreateService}>
            <Plus size={16} />
            Nuovo Servizio
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
          <div className="stat-number">{stats?.total_services || 0}</div>
          <div className="stat-label">Totale Servizi</div>
        </StatCard>
        <StatCard>
          <div className="stat-number">{stats?.active_services || 0}</div>
          <div className="stat-label">Servizi Attivi</div>
        </StatCard>
        <StatCard>
          <div className="stat-number">{stats?.services_with_images || 0}</div>
          <div className="stat-label">Con Immagine</div>
        </StatCard>
        <StatCard>
          <div className="stat-number">{stats?.average_microservices || 0}</div>
          <div className="stat-label">Media Micro-Servizi</div>
        </StatCard>
      </Stats>

      {/* Controlli */}
      <Controls>
        <Search size={20} color="#666" />
        <SearchInput
          type="text"
          placeholder="Cerca servizi per titolo o descrizione..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Filter size={20} color="#666" />
        <FilterSelect
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
        >
          <option value="all">Tutti i servizi</option>
          <option value="active">Solo attivi</option>
          <option value="inactive">Solo non attivi</option>
        </FilterSelect>
      </Controls>

      {/* Lista servizi */}
      {filteredServices.length === 0 ? (
        <EmptyState>
          <div className="icon">⚙️</div>
          <h3>
            {searchTerm || filterStatus !== "all" 
              ? "Nessun servizio trovato" 
              : "Nessun servizio disponibile"
            }
          </h3>
          <p>
            {searchTerm || filterStatus !== "all"
              ? "Prova a modificare i filtri di ricerca."
              : "Inizia aggiungendo il primo servizio aziendale."
            }
          </p>
          {!searchTerm && filterStatus === "all" && (
            <>
              <ActionButton variant="primary" onClick={handleCreateService}>
                <Plus size={16} />
                Aggiungi Primo Servizio
              </ActionButton>
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: '#fff3cd', 
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#856404'
              }}>
                <strong>💡 Nota:</strong> Se vedi questo messaggio, potresti dover eseguire lo schema SQL del database. 
                <br />Verifica su <code>/api/services/admin/stats</code> lo stato delle tabelle.
              </div>
            </>
          )}
        </EmptyState>
      ) : (
        <ServicesGrid>
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              canMoveUp={index > 0}
              canMoveDown={index < filteredServices.length - 1}
              onEdit={() => handleEditService(service)}
              onDelete={() => handleDeleteService(service)}
              onUploadImage={() => handleUploadImage(service.id)}
              onDeleteImage={() => handleDeleteImage(service.id, service.title)}
              onMoveUp={() => handleMoveUp(service)}
              onMoveDown={() => handleMoveDown(service)}
              onToggleActive={() => handleToggleActive(service)}
            />
          ))}
        </ServicesGrid>
      )}

      {/* Form Servizio */}
      {showForm && (
        <ServiceForm
          service={editingService}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingService(null);
          }}
          loading={loading}
        />
      )}

      {/* Modal Image Upload */}
      {showImageModal && imageServiceId && (
        <ImageUploadModal
          serviceId={imageServiceId}
          serviceName={services.find(s => s.id === imageServiceId)?.title || ""}
          onUpload={handleImageUpload}
          onCancel={() => {
            setShowImageModal(false);
            setImageServiceId(null);
          }}
          uploading={uploading}
        />
      )}
    </Container>
  );
};

export default ServicesManager;