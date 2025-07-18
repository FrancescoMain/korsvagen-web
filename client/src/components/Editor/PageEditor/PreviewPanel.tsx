import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import type { Section } from "../../../types/editor";

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
`;

const PreviewHeaderTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #333;
`;

const PreviewControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const DeviceToggle = styled.div`
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const DeviceButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;
  background: ${(props) => (props.active ? "#4CAF50" : "white")};
  color: ${(props) => (props.active ? "white" : "#666")};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "#45a049" : "#f5f5f5")};
  }
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const PreviewFrame = styled.div<{ device: "desktop" | "tablet" | "mobile" }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
`;

const PreviewContent = styled.div<{ device: "desktop" | "tablet" | "mobile" }>`
  width: ${(props) => {
    switch (props.device) {
      case "desktop":
        return "100%";
      case "tablet":
        return "768px";
      case "mobile":
        return "375px";
    }
  }};
  max-width: ${(props) => {
    switch (props.device) {
      case "desktop":
        return "1200px";
      case "tablet":
        return "768px";
      case "mobile":
        return "375px";
    }
  }};
  height: ${(props) => {
    switch (props.device) {
      case "desktop":
        return "100%";
      case "tablet":
        return "600px";
      case "mobile":
        return "667px";
    }
  }};
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  transition: all 0.3s ease;
`;

const SectionPreview = styled.div<{ isActive: boolean }>`
  opacity: ${(props) => (props.isActive ? 1 : 0.5)};
  transition: opacity 0.2s;
  position: relative;

  &:hover {
    opacity: 1;
  }
`;

const SectionOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(76, 175, 80, 0.1);
  border: 2px solid #4caf50;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
`;

const SectionLabel = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: #4caf50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s;
`;

const PreviewSection = styled.div`
  position: relative;

  &:hover ${SectionOverlay} {
    opacity: 1;
  }

  &:hover ${SectionLabel} {
    opacity: 1;
  }
`;

const HeroPreview = styled.div<{ content: any }>`
  min-height: 400px;
  background: ${(props) => props.content.backgroundColor || "#f8f9fa"};
  color: ${(props) => props.content.textColor || "#333"};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 80px 20px;
  position: relative;
  overflow: hidden;

  ${(props) =>
    props.content.backgroundImage &&
    `
    background-image: url(${props.content.backgroundImage.url});
    background-size: cover;
    background-position: center;
  `}

  ${(props) =>
    props.content.overlay &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, ${(props.content.overlayOpacity || 50) / 100});
    }
  `}
`;

const PreviewTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  position: relative;
  z-index: 1;
`;

const PreviewSubtitle = styled.h2`
  font-size: 24px;
  font-weight: 400;
  margin: 0 0 32px 0;
  position: relative;
  z-index: 1;
`;

const PreviewCTA = styled.button`
  padding: 16px 32px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: background 0.2s;

  &:hover {
    background: #45a049;
  }
`;

const AboutPreview = styled.div<{ content: any }>`
  padding: 80px 20px;
  background: ${(props) => props.content.backgroundColor || "#ffffff"};
  color: ${(props) => props.content.textColor || "#333"};
`;

const GalleryPreview = styled.div<{ content: any }>`
  padding: 80px 20px;
  text-align: center;
`;

const GalleryGrid = styled.div<{ columns: number; spacing: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns}, 1fr);
  gap: ${(props) => props.spacing}px;
  margin-top: 40px;
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
`;

const ContactPreview = styled.div`
  padding: 80px 20px;
  text-align: center;
`;

const EmptyPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
`;

interface PreviewPanelProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  showInactiveSection?: boolean;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  sections,
  selectedSectionId,
  onSectionSelect,
  showInactiveSection = false,
}) => {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [showInactive, setShowInactive] = useState(showInactiveSection);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Auto-refresh preview every 30 seconds
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const activeSections = sections.filter(
    (section) => showInactive || section.isActive
  );

  const renderSectionPreview = (section: Section) => {
    const isSelected = section.id === selectedSectionId;

    const preview = (() => {
      switch (section.type) {
        case "hero":
          return (
            <HeroPreview content={section.content}>
              <PreviewTitle
                dangerouslySetInnerHTML={{
                  __html: section.content.title || "Titolo Hero",
                }}
              />
              {section.content.subtitle && (
                <PreviewSubtitle
                  dangerouslySetInnerHTML={{ __html: section.content.subtitle }}
                />
              )}
              {section.content.ctaText && (
                <PreviewCTA>{section.content.ctaText}</PreviewCTA>
              )}
            </HeroPreview>
          );
        case "about":
          return (
            <AboutPreview content={section.content}>
              <PreviewTitle
                dangerouslySetInnerHTML={{
                  __html: section.content.title || "Titolo About",
                }}
              />
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    section.content.content ||
                    "Contenuto della sezione about...",
                }}
              />
            </AboutPreview>
          );
        case "gallery":
          return (
            <GalleryPreview content={section.content}>
              <PreviewTitle>{section.content.title || "Gallery"}</PreviewTitle>
              {section.content.images && section.content.images.length > 0 && (
                <GalleryGrid
                  columns={section.content.columns || 3}
                  spacing={section.content.spacing || 16}
                >
                  {section.content.images.slice(0, 6).map((image: any) => (
                    <GalleryImage
                      key={image.id}
                      src={image.url}
                      alt={image.altText}
                    />
                  ))}
                </GalleryGrid>
              )}
            </GalleryPreview>
          );
        case "contact":
          return (
            <ContactPreview>
              <PreviewTitle>{section.content.title || "Contatti"}</PreviewTitle>
              <p>
                Form di contatto con {section.content.formFields?.length || 0}{" "}
                campi
              </p>
            </ContactPreview>
          );
        default:
          return (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <h3>Sezione {section.type}</h3>
              <p>Preview non disponibile per questo tipo di sezione</p>
            </div>
          );
      }
    })();

    return (
      <PreviewSection key={`${section.id}-${refreshKey}`}>
        <SectionPreview
          isActive={section.isActive}
          onClick={() => onSectionSelect(section.id)}
        >
          {preview}
          {isSelected && <SectionOverlay />}
          {isSelected && <SectionLabel>{section.title}</SectionLabel>}
        </SectionPreview>
      </PreviewSection>
    );
  };

  return (
    <PreviewContainer>
      <PreviewHeader>
        <PreviewHeaderTitle>🔍 Preview</PreviewHeaderTitle>
        <PreviewControls>
          <ActionButton onClick={() => setShowInactive(!showInactive)}>
            {showInactive ? <EyeOff size={16} /> : <Eye size={16} />}
            {showInactive ? "Nascondi inattive" : "Mostra inattive"}
          </ActionButton>
          <ActionButton onClick={() => setRefreshKey((prev) => prev + 1)}>
            <RefreshCw size={16} />
            Aggiorna
          </ActionButton>
          <DeviceToggle>
            <DeviceButton
              active={device === "desktop"}
              onClick={() => setDevice("desktop")}
            >
              <Monitor size={16} />
            </DeviceButton>
            <DeviceButton
              active={device === "tablet"}
              onClick={() => setDevice("tablet")}
            >
              <Tablet size={16} />
            </DeviceButton>
            <DeviceButton
              active={device === "mobile"}
              onClick={() => setDevice("mobile")}
            >
              <Smartphone size={16} />
            </DeviceButton>
          </DeviceToggle>
        </PreviewControls>
      </PreviewHeader>

      <PreviewFrame device={device}>
        <PreviewContent device={device}>
          {activeSections.length > 0 ? (
            activeSections.map((section) => renderSectionPreview(section))
          ) : (
            <EmptyPreview>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
              <h3>Nessuna sezione da mostrare</h3>
              <p>Aggiungi alcune sezioni per vedere il preview</p>
            </EmptyPreview>
          )}
        </PreviewContent>
      </PreviewFrame>
    </PreviewContainer>
  );
};

export default PreviewPanel;
