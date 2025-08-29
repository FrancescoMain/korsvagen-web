/**
 * KORSVAGEN WEB APPLICATION - MESSAGES MANAGEMENT PAGE
 *
 * Complete admin interface for managing contact messages and emergency requests.
 * Provides filtering, sorting, bulk actions, and detailed message management.
 *
 * Features:
 * - Advanced filtering and search
 * - Bulk operations
 * - Message detail modal
 * - Status management
 * - Priority handling
 * - Export capabilities
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api';
import {
  MessageCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Phone,
  Mail,
  Clock,
  User,
  ChevronDown,
  X,
  CheckSquare,
  Square,
  MoreVertical,
  ArrowLeft,
  Reply
} from 'lucide-react';

interface ContactMessage {
  id: number;
  type: 'contact' | 'emergency';
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  source: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  admin_notes?: string;
  replied_at?: string;
}

interface Filters {
  type: string;
  status: string;
  priority: string;
  assigned_to: string;
  search: string;
}

interface MessageStats {
  total_messages: number;
  emergency_count: number;
  new_count: number;
  today_count: number;
}

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const HeaderAction = styled.button`
  background: #f9fafb;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  &.primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;

    &:hover {
      background: #2563eb;
    }
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
`;

const StatItem = styled.div`
  text-align: center;

  .stat-number {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
  }

  .stat-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 4px;
  }
`;

const FiltersBar = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;

  input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const MessagesTable = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .bulk-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .select-all {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #6b7280;
      cursor: pointer;
    }

    .bulk-buttons {
      display: flex;
      gap: 8px;
    }
  }

  .table-info {
    font-size: 14px;
    color: #6b7280;
  }
`;

const BulkButton = styled.button`
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }

  &.danger {
    border-color: #f87171;
    color: #dc2626;

    &:hover {
      background: #fef2f2;
    }
  }
`;

const MessagesList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const MessageRow = styled.div<{ selected?: boolean; priority?: string }>`
  display: grid;
  grid-template-columns: 40px 1fr auto;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#eff6ff' : 'white'};
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'emergency': return '#dc2626';
      case 'high': return '#ea580c';
      case 'normal': return '#059669';
      case 'low': return '#6b7280';
      default: return 'transparent';
    }
  }};

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MessageCheckbox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const MessageInfo = styled.div`
  flex: 1;

  .sender {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .contact-details {
    display: flex;
    gap: 16px;
    margin-bottom: 6px;
    font-size: 13px;
    color: #6b7280;
  }

  .subject {
    font-weight: 500;
    color: #374151;
    margin-bottom: 4px;
  }

  .message-preview {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

const MessageMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;

  .status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .time {
    font-size: 12px;
    color: #9ca3af;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .type-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    
    &.emergency {
      color: #dc2626;
    }
    
    &.contact {
      color: #059669;
    }
  }
`;

const MessageActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #374151;
    background: #f3f4f6;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;

  svg {
    margin-bottom: 16px;
  }

  h3 {
    color: #374151;
    margin-bottom: 8px;
  }
`;

const MessageDetailModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const MessageDetailContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const DetailHeader = styled.div`
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h2 {
    margin: 0;
    color: #1f2937;
    font-size: 1.25rem;
  }

  .close-btn {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    color: #6b7280;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }
`;

const DetailBody = styled.div`
  padding: 24px;

  .message-info {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    background: #f9fafb;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-label {
    font-weight: 600;
    color: #374151;
    min-width: 120px;
  }

  .info-value {
    color: #6b7280;
    flex: 1;
  }

  .message-content {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .admin-notes {
    background: #fef3c7;
    border: 1px solid #fbbf24;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    
    h4 {
      margin: 0 0 12px 0;
      color: #92400e;
    }
    
    textarea {
      width: 100%;
      min-height: 100px;
      padding: 12px;
      border: 1px solid #d97706;
      border-radius: 6px;
      resize: vertical;
      font-family: inherit;
    }
  }
`;

const DetailActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 0 24px 24px;

  .action-btn {
    padding: 10px 20px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    color: #374151;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      background: #f9fafb;
    }

    &.primary {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;

      &:hover {
        background: #2563eb;
      }
    }

    &.danger {
      border-color: #ef4444;
      color: #dc2626;

      &:hover {
        background: #fef2f2;
      }
    }
  }
`;

const MessagesManagement: React.FC = () => {
  const { messageId } = useParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
  const [adminNotes, setAdminNotes] = useState('');
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    status: 'all',
    priority: 'all',
    assigned_to: 'all',
    search: ''
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.set('type', filters.type);
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.priority !== 'all') params.set('priority', filters.priority);
      if (filters.assigned_to !== 'all') params.set('assigned_to', filters.assigned_to);
      if (filters.search) params.set('search', filters.search);
      
      const [messagesResponse, statsResponse] = await Promise.all([
        apiClient.get(`/admin/messages?${params.toString()}`),
        apiClient.get('/admin/messages/stats')
      ]);

      // Axios responses contain data directly
      const messagesData = messagesResponse.data;
      const statsData = statsResponse.data;
        
      setMessages(messagesData.data);
      setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch individual message
  const fetchMessage = useCallback(async (id: string) => {
    try {
      const response = await apiClient.get(`/admin/messages/${id}`);
      const messageData = response.data.data;
      setSelectedMessage(messageData);
      setAdminNotes(messageData.admin_notes || '');
    } catch (error) {
      console.error('Error fetching message:', error);
      navigate('/dashboard/messages');
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (messageId) {
      fetchMessage(messageId);
    } else {
      setSelectedMessage(null);
    }
  }, [messageId, fetchMessage]);

  // Handle message selection
  const handleSelectMessage = (messageId: number) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(m => m.id)));
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: string, assignedTo?: string) => {
    if (selectedMessages.size === 0) return;

    try {
      const response = await apiClient.post('/admin/messages/bulk-update', {
        message_ids: Array.from(selectedMessages),
        action,
        assigned_to: assignedTo
      });

      if (response.status === 200) {
        await fetchData();
        setSelectedMessages(new Set());
      }
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  // Message detail actions
  const handleViewMessage = (messageId: number) => {
    navigate(`/dashboard/messages/${messageId}`);
  };

  const handleCloseModal = () => {
    navigate('/dashboard/messages');
  };

  const handleUpdateMessage = async (action: string, messageId: number) => {
    try {
      const response = await apiClient.patch(`/admin/messages/${messageId}`, {
        action,
        admin_notes: adminNotes
      });

      if (response.status === 200) {
        await fetchData();
        if (selectedMessage) {
          await fetchMessage(messageId.toString());
        }
      }
    } catch (error) {
      console.error('Message update error:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    
    try {
      const response = await apiClient.patch(`/admin/messages/${selectedMessage.id}`, {
        admin_notes: adminNotes
      });

      if (response.status === 200) {
        setSelectedMessage({ ...selectedMessage, admin_notes: adminNotes });
      }
    } catch (error) {
      console.error('Notes save error:', error);
    }
  };

  // Utility functions
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ora';
    if (diffInMinutes < 60) return `${diffInMinutes}m fa`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h fa`;
    return date.toLocaleDateString('it-IT');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: { bg: '#dbeafe', text: '#1d4ed8' },
      read: { bg: '#fef3c7', text: '#d97706' },
      replied: { bg: '#d1fae5', text: '#047857' },
      closed: { bg: '#f3f4f6', text: '#6b7280' },
    };
    return colors[status as keyof typeof colors] || colors.closed;
  };

  return (
    <Container>
      <Header>
        <h1>
          <MessageCircle size={24} />
          Gestione Messaggi e Contatti
        </h1>
        <div className="header-actions">
          <HeaderAction onClick={fetchData}>
            <RefreshCw size={16} />
            Aggiorna
          </HeaderAction>
          <HeaderAction onClick={() => {}}>
            <Download size={16} />
            Esporta CSV
          </HeaderAction>
        </div>
      </Header>

      {/* Statistics */}
      {stats && (
        <StatsBar>
          <StatItem>
            <span className="stat-number">{stats.total_messages}</span>
            <div className="stat-label">Totali</div>
          </StatItem>
          <StatItem>
            <span className="stat-number">{stats.emergency_count}</span>
            <div className="stat-label">Emergenze</div>
          </StatItem>
          <StatItem>
            <span className="stat-number">{stats.new_count}</span>
            <div className="stat-label">Nuovi</div>
          </StatItem>
          <StatItem>
            <span className="stat-number">{stats.today_count}</span>
            <div className="stat-label">Oggi</div>
          </StatItem>
        </StatsBar>
      )}

      {/* Filters */}
      <FiltersBar>
        <SearchBox>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cerca per nome, email, messaggio..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </SearchBox>

        <FilterSelect
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">Tutti i tipi</option>
          <option value="emergency">🚨 Emergenze</option>
          <option value="contact">📧 Contatti</option>
        </FilterSelect>

        <FilterSelect
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">Tutti gli stati</option>
          <option value="new">Nuovi</option>
          <option value="read">Letti</option>
          <option value="replied">Risposti</option>
          <option value="closed">Chiusi</option>
        </FilterSelect>

        <FilterSelect
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="all">Tutte le priorità</option>
          <option value="emergency">🚨 Emergenza</option>
          <option value="high">Alta</option>
          <option value="normal">Normale</option>
          <option value="low">Bassa</option>
        </FilterSelect>
      </FiltersBar>

      {/* Messages Table */}
      <MessagesTable>
        <TableHeader>
          <div className="bulk-actions">
            <div className="select-all" onClick={handleSelectAll}>
              {selectedMessages.size === messages.length && messages.length > 0 ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              <span>
                {selectedMessages.size > 0 
                  ? `${selectedMessages.size} selezionati` 
                  : 'Seleziona tutti'}
              </span>
            </div>

            {selectedMessages.size > 0 && (
              <div className="bulk-buttons">
                <BulkButton onClick={() => handleBulkAction('mark_read')}>
                  Segna come letti
                </BulkButton>
                <BulkButton onClick={() => handleBulkAction('mark_closed')}>
                  Chiudi
                </BulkButton>
                <BulkButton 
                  className="danger" 
                  onClick={() => handleBulkAction('delete')}
                >
                  Elimina
                </BulkButton>
              </div>
            )}
          </div>

          <div className="table-info">
            {messages.length} messaggi
          </div>
        </TableHeader>

        <MessagesList>
          {loading ? (
            <LoadingState>Caricamento messaggi...</LoadingState>
          ) : messages.length === 0 ? (
            <EmptyState>
              <MessageCircle size={48} color="#d1d5db" />
              <h3>Nessun messaggio trovato</h3>
              <p>Prova a modificare i filtri di ricerca</p>
            </EmptyState>
          ) : (
            messages.map((message) => {
              const statusColors = getStatusColor(message.status);
              
              return (
                <MessageRow
                  key={message.id}
                  selected={selectedMessages.has(message.id)}
                  priority={message.priority}
                >
                  <MessageCheckbox>
                    {selectedMessages.has(message.id) ? (
                      <CheckSquare 
                        size={16} 
                        color="#3b82f6" 
                        onClick={() => handleSelectMessage(message.id)}
                      />
                    ) : (
                      <Square 
                        size={16} 
                        color="#9ca3af" 
                        onClick={() => handleSelectMessage(message.id)}
                      />
                    )}
                  </MessageCheckbox>

                  <MessageContent>
                    <MessageHeader>
                      <MessageInfo>
                        <div className="sender">
                          {message.first_name} {message.last_name}
                          {message.assigned_to && (
                            <span style={{
                              fontSize: '11px',
                              background: '#f3f4f6',
                              color: '#6b7280',
                              padding: '2px 6px',
                              borderRadius: '8px'
                            }}>
                              👤 {message.assigned_to}
                            </span>
                          )}
                        </div>
                        
                        <div className="contact-details">
                          <span><Mail size={12} /> {message.email}</span>
                          {message.phone && (
                            <span><Phone size={12} /> {message.phone}</span>
                          )}
                          {message.company && (
                            <span>🏢 {message.company}</span>
                          )}
                        </div>

                        {message.subject && (
                          <div className="subject">{message.subject}</div>
                        )}

                        <div className="message-preview">
                          {message.message}
                        </div>
                      </MessageInfo>

                      <MessageMeta>
                        <div className={`type-badge ${message.type}`}>
                          {message.type === 'emergency' ? (
                            <>
                              <AlertTriangle size={10} />
                              Emergenza
                            </>
                          ) : (
                            <>
                              <MessageCircle size={10} />
                              Contatto
                            </>
                          )}
                        </div>

                        <div 
                          className="status-badge" 
                          style={{
                            background: statusColors.bg,
                            color: statusColors.text
                          }}
                        >
                          {message.status}
                        </div>

                        <div className="time">
                          <Clock size={10} />
                          {formatTime(message.created_at)}
                        </div>
                      </MessageMeta>
                    </MessageHeader>
                  </MessageContent>

                  <MessageActions>
                    <ActionButton 
                      title="Visualizza dettagli"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMessage(message.id);
                      }}
                    >
                      <Eye size={16} />
                    </ActionButton>
                    <ActionButton title="Altre azioni">
                      <MoreVertical size={16} />
                    </ActionButton>
                  </MessageActions>
                </MessageRow>
              );
            })
          )}
        </MessagesList>
      </MessagesTable>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal onClick={handleCloseModal}>
          <MessageDetailContent onClick={(e) => e.stopPropagation()}>
            <DetailHeader>
              <div className="header-info">
                <div className={`type-badge ${selectedMessage.type}`}>
                  {selectedMessage.type === 'emergency' ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <MessageCircle size={16} />
                  )}
                </div>
                <h2>Dettagli Messaggio</h2>
              </div>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </DetailHeader>

            <DetailBody>
              <div className="message-info">
                <div className="info-row">
                  <span className="info-label">Da:</span>
                  <span className="info-value">
                    {selectedMessage.first_name} {selectedMessage.last_name}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedMessage.email}</span>
                </div>
                {selectedMessage.phone && (
                  <div className="info-row">
                    <span className="info-label">Telefono:</span>
                    <span className="info-value">{selectedMessage.phone}</span>
                  </div>
                )}
                {selectedMessage.company && (
                  <div className="info-row">
                    <span className="info-label">Azienda:</span>
                    <span className="info-value">{selectedMessage.company}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Stato:</span>
                  <span className="info-value">
                    <span 
                      style={{
                        ...getStatusColor(selectedMessage.status),
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 500,
                        textTransform: 'uppercase'
                      }}
                    >
                      {selectedMessage.status}
                    </span>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Priorità:</span>
                  <span className="info-value">{selectedMessage.priority}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Ricevuto:</span>
                  <span className="info-value">
                    {new Date(selectedMessage.created_at).toLocaleString('it-IT')}
                  </span>
                </div>
              </div>

              {selectedMessage.subject && (
                <>
                  <h4>Oggetto:</h4>
                  <div className="message-content">
                    {selectedMessage.subject}
                  </div>
                </>
              )}

              <h4>Messaggio:</h4>
              <div className="message-content">
                {selectedMessage.message}
              </div>

              <div className="admin-notes">
                <h4>Note Amministratore</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Aggiungi note interne..."
                />
              </div>
            </DetailBody>

            <DetailActions>
              <button className="action-btn" onClick={handleSaveNotes}>
                Salva Note
              </button>
              <button 
                className="action-btn primary" 
                onClick={() => handleUpdateMessage('mark_read', selectedMessage.id)}
              >
                <Eye size={16} />
                Segna come Letto
              </button>
              <button 
                className="action-btn" 
                onClick={() => handleUpdateMessage('reply', selectedMessage.id)}
              >
                <Reply size={16} />
                Rispondi
              </button>
              <button 
                className="action-btn danger" 
                onClick={() => handleUpdateMessage('delete', selectedMessage.id)}
              >
                Elimina
              </button>
            </DetailActions>
          </MessageDetailContent>
        </MessageDetailModal>
      )}
    </Container>
  );
};

export default MessagesManagement;