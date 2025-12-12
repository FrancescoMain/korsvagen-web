/**
 * POLICIES PAGE - Pagina Pubblica Politiche Aziendali
 *
 * Mostra le politiche aziendali pubblicate con possibilita
 * di scaricare i documenti PDF associati
 *
 * @author KORSVAGEN S.R.L.
 */

import React, { useEffect } from "react";
import styled from "styled-components";
import { usePolicies, POLICY_CATEGORIES } from "../hooks/usePolicies";
import { useCertifications } from "../hooks/useCertifications";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { FileText, Download, Calendar, Award, Shield, Leaf, Users, Scale } from "lucide-react";

// Icone per categorie
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  quality: <Award size={24} />,
  environment: <Leaf size={24} />,
  safety: <Shield size={24} />,
  anticorruption: <Scale size={24} />,
  gender_equality: <Users size={24} />,
  general: <FileText size={24} />
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 80px 2rem;
  text-align: center;
  color: white;

  @media (max-width: 768px) {
    padding: 60px 1rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: #cccccc;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ContentSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 2rem;

  @media (max-width: 768px) {
    padding: 40px 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::after {
    content: '';
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, #d4af37 0%, transparent 100%);
    margin-left: 1rem;
  }
`;

const CertificationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
`;

const CertificationCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #eee;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;

const CertBadge = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
`;

const CertName = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const CertDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  min-height: 60px;
`;

const CertDownloadLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #d4af37;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: #b8941f;
    transform: translateY(-2px);
  }
`;

const PoliciesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PolicyCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid #eee;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
  }
`;

const PolicyHeader = styled.div<{ category: string }>`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  ${props => {
    switch(props.category) {
      case 'quality': return 'background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);';
      case 'environment': return 'background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);';
      case 'safety': return 'background: linear-gradient(135deg, #ef6c00 0%, #ff9800 100%);';
      case 'anticorruption': return 'background: linear-gradient(135deg, #c2185b 0%, #e91e63 100%);';
      case 'gender_equality': return 'background: linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%);';
      default: return 'background: linear-gradient(135deg, #546e7a 0%, #78909c 100%);';
    }
  }}
  color: white;
`;

const PolicyIcon = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PolicyHeaderInfo = styled.div`
  flex: 1;
`;

const PolicyCategory = styled.span`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
`;

const PolicyTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0.25rem 0 0 0;
  font-weight: 600;
`;

const PolicyBody = styled.div`
  padding: 1.5rem;
`;

const PolicyDescription = styled.p`
  color: #555;
  line-height: 1.7;
  margin: 0 0 1.25rem 0;
  font-size: 0.95rem;
`;

const PolicyMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
  font-size: 0.85rem;
  color: #888;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #d4af37;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #b8941f;
    transform: translateY(-2px);
  }
`;

const NoDocumentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f5f5f5;
  color: #888;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;

  svg {
    opacity: 0.3;
    margin-bottom: 1rem;
  }
`;

const PoliciesPage: React.FC = () => {
  const { publicPolicies, loading: policiesLoading, fetchPublicPolicies } = usePolicies();
  const { publicCertifications, loading: certificationsLoading, fetchPublicCertifications } = useCertifications();

  useEffect(() => {
    fetchPublicPolicies();
    fetchPublicCertifications();
  }, [fetchPublicPolicies, fetchPublicCertifications]);

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <HeroTitle>Certificazioni e Politiche Aziendali</HeroTitle>
          <HeroSubtitle>
            KORSVAGEN S.R.L. opera secondo i piu elevati standard di qualita,
            sicurezza e responsabilita sociale. Scopri le nostre certificazioni
            e le politiche che guidano il nostro operato quotidiano.
          </HeroSubtitle>
        </HeroSection>

        <ContentSection>
          {/* Sezione Certificazioni */}
          <SectionTitle>
            <Award size={28} color="#d4af37" />
            Le Nostre Certificazioni
          </SectionTitle>

          {certificationsLoading ? (
            <LoadingContainer>Caricamento certificazioni...</LoadingContainer>
          ) : publicCertifications.length > 0 ? (
            <CertificationsGrid>
              {publicCertifications.map(cert => (
                <CertificationCard key={cert.id}>
                  <CertBadge>{cert.code}</CertBadge>
                  <CertName>{cert.name}</CertName>
                  <CertDescription>{cert.description}</CertDescription>
                  {cert.document_url && (
                    <CertDownloadLink
                      href={cert.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={14} />
                      Scarica PDF
                    </CertDownloadLink>
                  )}
                </CertificationCard>
              ))}
            </CertificationsGrid>
          ) : (
            <EmptyState>
              <Award size={48} />
              <p>Nessuna certificazione disponibile al momento.</p>
            </EmptyState>
          )}

          {/* Sezione Politiche */}
          <SectionTitle>
            <FileText size={28} color="#d4af37" />
            Politiche Aziendali
          </SectionTitle>

          {policiesLoading ? (
            <LoadingContainer>Caricamento politiche aziendali...</LoadingContainer>
          ) : publicPolicies.length > 0 ? (
            <PoliciesGrid>
              {publicPolicies.map(policy => (
                <PolicyCard key={policy.id}>
                  <PolicyHeader category={policy.category}>
                    <PolicyIcon>
                      {CATEGORY_ICONS[policy.category] || CATEGORY_ICONS.general}
                    </PolicyIcon>
                    <PolicyHeaderInfo>
                      <PolicyCategory>
                        {POLICY_CATEGORIES[policy.category] || policy.category}
                      </PolicyCategory>
                      <PolicyTitle>{policy.title}</PolicyTitle>
                    </PolicyHeaderInfo>
                  </PolicyHeader>

                  <PolicyBody>
                    {policy.description && (
                      <PolicyDescription>{policy.description}</PolicyDescription>
                    )}

                    <PolicyMeta>
                      {policy.revision_number && (
                        <MetaItem>
                          <FileText size={14} />
                          {policy.revision_number}
                        </MetaItem>
                      )}
                      {policy.effective_date && (
                        <MetaItem>
                          <Calendar size={14} />
                          In vigore dal {new Date(policy.effective_date).toLocaleDateString('it-IT')}
                        </MetaItem>
                      )}
                    </PolicyMeta>

                    {policy.document_url ? (
                      <DownloadButton
                        href={policy.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download size={18} />
                        Scarica Documento PDF
                      </DownloadButton>
                    ) : (
                      <NoDocumentBadge>
                        <FileText size={16} />
                        Documento non disponibile
                      </NoDocumentBadge>
                    )}
                  </PolicyBody>
                </PolicyCard>
              ))}
            </PoliciesGrid>
          ) : (
            <EmptyState>
              <FileText size={48} />
              <p>Nessuna politica aziendale pubblicata al momento.</p>
            </EmptyState>
          )}
        </ContentSection>
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default PoliciesPage;
