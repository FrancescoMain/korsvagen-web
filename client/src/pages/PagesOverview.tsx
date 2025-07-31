import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components/Dashboard/Breadcrumb";
import { Edit, Eye } from "lucide-react";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const PagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const PageCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const PageTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
`;

const PageMeta = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
`;

const StatusBadge = styled.span<{ status: "published" | "draft" }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.status === "published" ? "#e8f5e8" : "#fff3cd"};
  color: ${(props) => (props.status === "published" ? "#2e7d32" : "#856404")};
`;

const PageActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  color: var(--text-secondary);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &.primary {
    background: #4caf50;
    color: white;
    border-color: #4caf50;
  }

  &.primary:hover {
    background: #45a049;
  }
`;

const ComingSoonCard = styled.div`
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 3rem;
  text-align: center;
  border: 1px solid #e5e7eb;
`;

const Description = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
`;

export const PagesOverview: React.FC = () => {
  const navigate = useNavigate();

  const mockPages = [
    {
      id: "home",
      title: "Home Page",
      slug: "/",
      status: "published" as const,
      sections: 4,
      lastModified: "2024-01-15",
      author: "Admin",
    },
    {
      id: "about",
      title: "Chi Siamo",
      slug: "/chi-siamo",
      status: "published" as const,
      sections: 3,
      lastModified: "2024-01-10",
      author: "Admin",
    },
    {
      id: "services",
      title: "I Nostri Servizi",
      slug: "/servizi",
      status: "draft" as const,
      sections: 2,
      lastModified: "2024-01-08",
      author: "Admin",
    },
  ];

  const handleEditPage = (pageId: string) => {
    navigate(`/dashboard/pages/${pageId}`);
  };

  const handleViewPage = (slug: string) => {
    window.open(slug, "_blank");
  };

  return (
    <Container>
      <Breadcrumb />

      <Header>
        <Title>Gestione Pagine</Title>
      </Header>

      <PagesGrid>
        {mockPages.map((page) => (
          <PageCard key={page.id}>
            <PageTitle>{page.title}</PageTitle>
            <PageMeta>
              <StatusBadge status={page.status}>
                {page.status === "published" ? "Pubblicata" : "Bozza"}
              </StatusBadge>
              <br />
              {page.sections} sezioni • Modificata il {page.lastModified}
              <br />
              di {page.author}
            </PageMeta>
            <PageActions>
              <ActionButton
                className="primary"
                onClick={() => handleEditPage(page.id)}
              >
                <Edit size={16} />
                Modifica
              </ActionButton>
              <ActionButton onClick={() => handleViewPage(page.slug)}>
                <Eye size={16} />
                Visualizza
              </ActionButton>
            </PageActions>
          </PageCard>
        ))}
      </PagesGrid>

      <ComingSoonCard>
        <Title>Funzionalità Avanzate</Title>
        <Description>
          Presto disponibili: ricerca pagine, filtri avanzati, statistiche di
          visualizzazione, gestione versioni e molto altro.
        </Description>
      </ComingSoonCard>
    </Container>
  );
};
