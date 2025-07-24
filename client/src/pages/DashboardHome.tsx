/**
 * KORSVAGEN WEB APPLICATION - DASHBOARD HOME
 *
 * Pagina principale della dashboard amministratori con
 * statistiche, overview e quick actions.
 *
 * Features:
 * - Statistiche in tempo reale
 * - Card overview con dati chiave
 * - Grafici e metriche
 * - Quick actions per gestione rapida
 * - Layout responsive e accessibile
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import {
  Users,
  MessageCircle,
  Activity,
  TrendingUp,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";

/**
 * TYPES E INTERFACES
 */

interface DashboardStats {
  users: {
    total: number;
    active: number;
  };
  sessions: {
    active: number;
  };
  messages: {
    total: number;
    unread: number;
    byStatus: {
      new?: number;
      in_progress?: number;
      resolved?: number;
    };
  };
  activity: {
    last24Hours: number;
    today: number;
    recent: Array<{
      id: string;
      action: string;
      success: boolean;
      created_at: string;
      admin_users: {
        username: string;
      };
    }>;
  };
  system: {
    status: string;
    lastUpdate: string;
  };
}

/**
 * STYLED COMPONENTS
 */

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 1rem;
    margin: 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{
  variant?: "default" | "primary" | "success" | "warning" | "error";
}>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-left: 4px solid
    ${(props) => {
      switch (props.variant) {
        case "primary":
          return "var(--primary-500)";
        case "success":
          return "var(--success-500)";
        case "warning":
          return "var(--warning-500)";
        case "error":
          return "var(--error-500)";
        default:
          return "var(--border-color)";
      }
    }};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{
  variant?: "default" | "primary" | "success" | "warning" | "error";
}>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => {
    switch (props.variant) {
      case "primary":
        return "rgba(59, 130, 246, 0.1)";
      case "success":
        return "rgba(34, 197, 94, 0.1)";
      case "warning":
        return "rgba(245, 158, 11, 0.1)";
      case "error":
        return "rgba(239, 68, 68, 0.1)";
      default:
        return "rgba(107, 114, 128, 0.1)";
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case "primary":
        return "var(--primary-500)";
      case "success":
        return "var(--success-500)";
      case "warning":
        return "var(--warning-500)";
      case "error":
        return "var(--error-500)";
      default:
        return "var(--text-secondary)";
    }
  }};

  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatContent = styled.div`
  h3 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.25rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActivityCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
`;

const ActivityIcon = styled.div<{ success?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.success ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"};
  color: ${(props) =>
    props.success ? "var(--success-500)" : "var(--error-500)"};
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActivityContent = styled.div`
  flex: 1;

  p {
    margin: 0 0 0.25rem;
    font-size: 0.875rem;
    color: var(--text-primary);
  }

  span {
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }
`;

const QuickActionsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const QuickAction = styled.button`
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    background: var(--primary-50);
    border-color: var(--primary-200);
    transform: translateY(-1px);
  }

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    width: 18px;
    height: 18px;
    color: var(--primary-500);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary);

  svg {
    width: 24px;
    height: 24px;
    margin-right: 0.5rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--error-500);

  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: var(--error-500);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      background: var(--error-600);
    }
  }
`;

/**
 * COMPONENTE PRINCIPALE
 */

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const {
    data: stats,
    loading,
    error,
    get: getStats,
  } = useApi<DashboardStats>();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadStats = useCallback(async () => {
    try {
      await getStats("/dashboard/stats", undefined, {
        cache: true,
        cacheTTL: 30000, // 30 secondi
      });
    } catch (error) {
      console.error("Errore caricamento statistiche:", error);
    }
  }, [getStats]);

  // Carica le statistiche al mount e setup refresh periodico
  useEffect(() => {
    loadStats();

    // Setup refresh automatico ogni 30 secondi
    const interval = setInterval(() => {
      loadStats();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [loadStats]);

  const refreshStats = () => {
    loadStats();
    setLastRefresh(new Date());
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "ora";
    if (diffInMinutes < 60) return `${diffInMinutes}m fa`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h fa`;
    return `${Math.floor(diffInMinutes / 1440)}g fa`;
  };

  if (loading && !stats) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <RefreshCw />
          Caricamento statistiche...
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  if (error && !stats) {
    return (
      <DashboardContainer>
        <ErrorContainer>
          <AlertCircle size={48} />
          <h2>Errore nel caricamento</h2>
          <p>Non è possibile caricare le statistiche della dashboard.</p>
          <button onClick={refreshStats}>Riprova</button>
        </ErrorContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <h1>Benvenuto, {user?.profile_data?.firstName || user?.username}!</h1>
        <p>
          Ultimo aggiornamento: {formatTime(lastRefresh)} | Sistema:{" "}
          <strong>{stats?.system?.status || "Operativo"}</strong>
        </p>
      </Header>

      <StatsGrid>
        <StatCard variant="primary">
          <StatHeader>
            <StatIcon variant="primary">
              <Users />
            </StatIcon>
          </StatHeader>
          <StatContent>
            <h3>{stats?.users?.active || 0}</h3>
            <p>Utenti Attivi</p>
          </StatContent>
        </StatCard>

        <StatCard variant="warning">
          <StatHeader>
            <StatIcon variant="warning">
              <MessageCircle />
            </StatIcon>
          </StatHeader>
          <StatContent>
            <h3>{stats?.messages?.unread || 0}</h3>
            <p>Messaggi Non Letti</p>
          </StatContent>
        </StatCard>

        <StatCard variant="success">
          <StatHeader>
            <StatIcon variant="success">
              <Activity />
            </StatIcon>
          </StatHeader>
          <StatContent>
            <h3>{stats?.sessions?.active || 0}</h3>
            <p>Sessioni Attive</p>
          </StatContent>
        </StatCard>

        <StatCard variant="default">
          <StatHeader>
            <StatIcon variant="default">
              <TrendingUp />
            </StatIcon>
          </StatHeader>
          <StatContent>
            <h3>{stats?.activity?.today || 0}</h3>
            <p>Attività Oggi</p>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <ActivityCard>
          <CardHeader>
            <h2>Attività Recenti</h2>
            <button
              onClick={refreshStats}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <RefreshCw size={18} color="var(--text-secondary)" />
            </button>
          </CardHeader>
          <ActivityList>
            {stats?.activity?.recent?.slice(0, 5).map((activity: any) => (
              <ActivityItem key={activity.id}>
                <ActivityIcon success={activity.success}>
                  {activity.success ? <CheckCircle /> : <AlertCircle />}
                </ActivityIcon>
                <ActivityContent>
                  <p>
                    <strong>{activity.admin_users?.username}</strong> -{" "}
                    {activity.action}
                  </p>
                  <span>{formatRelativeTime(activity.created_at)}</span>
                </ActivityContent>
              </ActivityItem>
            )) || (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  padding: "2rem",
                }}
              >
                Nessuna attività recente
              </p>
            )}
          </ActivityList>
        </ActivityCard>

        <QuickActionsCard>
          <CardHeader>
            <h2>Azioni Rapide</h2>
          </CardHeader>
          <QuickAction
            onClick={() => (window.location.href = "/dashboard/messages")}
          >
            <MessageCircle />
            Gestisci Messaggi
          </QuickAction>
          <QuickAction
            onClick={() => (window.location.href = "/dashboard/content")}
          >
            <Eye />
            Modifica Contenuti
          </QuickAction>
          <QuickAction
            onClick={() => (window.location.href = "/dashboard/media")}
          >
            <Activity />
            Media Library
          </QuickAction>
          <QuickAction
            onClick={() => (window.location.href = "/dashboard/settings")}
          >
            <Clock />
            Impostazioni
          </QuickAction>
        </QuickActionsCard>
      </ContentGrid>
    </DashboardContainer>
  );
};
