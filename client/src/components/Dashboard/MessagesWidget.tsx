/**
 * KORSVAGEN WEB APPLICATION - MESSAGES DASHBOARD WIDGET
 *
 * Widget for displaying message statistics and recent messages in the dashboard.
 * Shows both contact messages and emergency requests with proper prioritization.
 *
 * Features:
 * - Message statistics overview
 * - Recent messages list
 * - Emergency highlights
 * - Quick actions
 * - Real-time updates
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  MessageCircle, 
  AlertTriangle, 
  Eye, 
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MessageStats {
  total_messages: number;
  emergency_count: number;
  contact_count: number;
  new_count: number;
  new_emergency_count: number;
  new_contact_count: number;
  today_count: number;
  week_count: number;
}

interface ContactMessage {
  id: number;
  type: 'contact' | 'emergency';
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  created_at: string;
  assigned_to?: string;
}

// Styled Components
const WidgetContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .view-all-btn {
    background: transparent;
    border: 1px solid #d1d5db;
    color: #6b7280;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;

    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div<{ variant?: 'emergency' | 'new' | 'today' | 'total' }>`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid ${props => {
    switch (props.variant) {
      case 'emergency': return '#dc2626';
      case 'new': return '#3b82f6';
      case 'today': return '#10b981';
      case 'total': return '#6b7280';
      default: return '#e5e7eb';
    }
  }};

  .stat-number {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .stat-label {
    display: block;
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const RecentMessages = styled.div`
  h4 {
    margin: 0 0 16px 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const MessageCard = styled.div<{ priority: string; type: string }>`
  background: ${props => props.type === 'emergency' ? '#fef2f2' : '#ffffff'};
  border: 1px solid ${props => props.type === 'emergency' ? '#fecaca' : '#e5e7eb'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'emergency': return '#dc2626';
      case 'high': return '#ea580c';
      case 'normal': return '#059669';
      case 'low': return '#6b7280';
      default: return '#e5e7eb';
    }
  }};

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const MessageType = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.emergency {
    color: #dc2626;
  }
  
  &.contact {
    color: #059669;
  }
`;

const MessageStatus = styled.span<{ status: string }>`
  background: ${props => {
    switch (props.status) {
      case 'new': return '#dbeafe';
      case 'read': return '#fef3c7';
      case 'replied': return '#d1fae5';
      case 'closed': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'new': return '#1d4ed8';
      case 'read': return '#d97706';
      case 'replied': return '#047857';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  }};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
`;

const MessageContent = styled.div`
  .sender {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .contact-info {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 6px;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .message-preview {
    color: #4b5563;
    font-size: 13px;
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

const MessageFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;

  .time {
    font-size: 11px;
    color: #9ca3af;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 2px;
    border-radius: 4px;
    transition: color 0.2s ease;

    &:hover {
      color: #374151;
    }
  }
`;

const NoMessages = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  font-size: 14px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 20px;
  color: #6b7280;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 20px;
  color: #dc2626;
  font-size: 14px;
`;

const MessagesWidget: React.FC = () => {
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch data
  const fetchData = async () => {
    try {
      setError(null);
      
      const [statsResponse, messagesResponse] = await Promise.all([
        fetch('/api/admin/messages/stats', {
          credentials: 'include'
        }),
        fetch('/api/admin/messages?limit=5', {
          credentials: 'include'
        })
      ]);

      if (!statsResponse.ok || !messagesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [statsData, messagesData] = await Promise.all([
        statsResponse.json(),
        messagesResponse.json()
      ]);

      setStats(statsData.data);
      setRecentMessages(messagesData.data);
    } catch (err) {
      console.error('Error fetching messages data:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ora';
    if (diffInMinutes < 60) return `${diffInMinutes}m fa`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h fa`;
    return date.toLocaleDateString('it-IT');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <MessageCircle size={12} />;
      case 'read': return <Eye size={12} />;
      case 'replied': return <CheckCircle2 size={12} />;
      case 'closed': return <XCircle size={12} />;
      default: return <MessageCircle size={12} />;
    }
  };

  if (loading) {
    return (
      <WidgetContainer>
        <WidgetHeader>
          <h3>
            <MessageCircle size={20} />
            Gestione Messaggi
          </h3>
        </WidgetHeader>
        <LoadingState>Caricamento...</LoadingState>
      </WidgetContainer>
    );
  }

  if (error) {
    return (
      <WidgetContainer>
        <WidgetHeader>
          <h3>
            <MessageCircle size={20} />
            Gestione Messaggi
          </h3>
        </WidgetHeader>
        <ErrorState>{error}</ErrorState>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer>
      <WidgetHeader>
        <h3>
          <MessageCircle size={20} />
          Gestione Messaggi
        </h3>
        <a href="/dashboard/messages" className="view-all-btn">
          Vedi Tutti <ExternalLink size={14} />
        </a>
      </WidgetHeader>

      {/* Statistics Cards */}
      {stats && (
        <StatsGrid>
          <StatCard variant="emergency">
            <span className="stat-number">{stats.new_emergency_count}</span>
            <span className="stat-label">Emergenze Nuove</span>
          </StatCard>
          <StatCard variant="new">
            <span className="stat-number">{stats.new_count}</span>
            <span className="stat-label">Messaggi Nuovi</span>
          </StatCard>
          <StatCard variant="today">
            <span className="stat-number">{stats.today_count}</span>
            <span className="stat-label">Oggi</span>
          </StatCard>
          <StatCard variant="total">
            <span className="stat-number">{stats.total_messages}</span>
            <span className="stat-label">Totali</span>
          </StatCard>
        </StatsGrid>
      )}

      {/* Recent Messages */}
      <RecentMessages>
        <h4>Messaggi Recenti</h4>
        
        {recentMessages.length > 0 ? (
          <MessagesList>
            {recentMessages.map((message) => (
              <MessageCard 
                key={message.id} 
                priority={message.priority}
                type={message.type}
                onClick={() => window.location.href = `/dashboard/messages/${message.id}`}
              >
                <MessageHeader>
                  <MessageType className={message.type}>
                    {message.type === 'emergency' ? (
                      <AlertTriangle size={12} />
                    ) : (
                      <MessageCircle size={12} />
                    )}
                    {message.type === 'emergency' ? 'Emergenza' : 'Contatto'}
                  </MessageType>
                  <MessageStatus status={message.status}>
                    {message.status}
                  </MessageStatus>
                </MessageHeader>

                <MessageContent>
                  <div className="sender">
                    {message.first_name} {message.last_name}
                  </div>
                  <div className="contact-info">
                    {message.email && (
                      <span><Mail size={10} /> {message.email}</span>
                    )}
                    {message.phone && (
                      <span><Phone size={10} /> {message.phone}</span>
                    )}
                  </div>
                  <div className="message-preview">
                    {message.subject && <strong>{message.subject}:</strong>} {message.message}
                  </div>
                </MessageContent>

                <MessageFooter>
                  <div className="time">
                    <Clock size={10} />
                    {formatTime(message.created_at)}
                  </div>
                  <div className="actions">
                    {getStatusIcon(message.status)}
                  </div>
                </MessageFooter>
              </MessageCard>
            ))}
          </MessagesList>
        ) : (
          <NoMessages>
            Nessun messaggio recente
          </NoMessages>
        )}
      </RecentMessages>
    </WidgetContainer>
  );
};

export default MessagesWidget;