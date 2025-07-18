import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Save, Eye, Settings, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Section, PageData, SectionContent } from "../../../types/editor";
import { useAutoSave } from "../../../hooks/useAutoSave";
import SectionsList from "./SectionsList";
import SectionEditor from "./SectionEditor";
import PreviewPanel from "./PreviewPanel";
import toast from "react-hot-toast";

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  z-index: 10;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const PageMeta = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SaveStatus = styled.div<{
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}>`
  font-size: 14px;
  color: ${(props) => {
    if (props.isSaving) return "#ff9800";
    if (props.hasUnsavedChanges) return "#f44336";
    return "#4CAF50";
  }};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant?: "primary" | "secondary" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid
    ${(props) => (props.variant === "primary" ? "#4CAF50" : "#e0e0e0")};
  background: ${(props) => (props.variant === "primary" ? "#4CAF50" : "white")};
  color: ${(props) => (props.variant === "primary" ? "white" : "#666")};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditorBody = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftPanel = styled.div<{ collapsed: boolean }>`
  width: ${(props) => (props.collapsed ? "60px" : "350px")};
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
`;

const PanelHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #333;
`;

const MiddlePanel = styled.div<{ collapsed: boolean }>`
  width: ${(props) => (props.collapsed ? "0px" : "400px")};
  background: white;
  border-right: 1px solid #e0e0e0;
  transition: width 0.3s ease;
  overflow: hidden;
`;

const RightPanel = styled.div`
  flex: 1;
  background: #f5f5f5;
  overflow: hidden;
`;

const ToggleButton = styled.button`
  width: 24px;
  height: 24px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;
  background: ${(props) => (props.active ? "#4CAF50" : "white")};
  color: ${(props) => (props.active ? "white" : "#666")};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "#45a049" : "#f5f5f5")};
  }
`;

interface PageEditorProps {
  pageId?: string;
}

const PageEditor: React.FC<PageEditorProps> = ({ pageId }) => {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [middlePanelCollapsed, setMiddlePanelCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-save functionality
  const { isSaving, hasUnsavedChanges, lastSaved } = useAutoSave(
    { pageData, sections },
    async (data) => {
      await savePageData(data);
    },
    3000
  );

  useEffect(() => {
    if (pageId) {
      loadPageData(pageId);
    } else {
      // Create new page
      const newPageData: PageData = {
        id: `page-${Date.now()}`,
        title: "Nuova Pagina",
        slug: "nuova-pagina",
        sections: [],
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setPageData(newPageData);
      setIsLoading(false);
    }
  }, [pageId]);

  const loadPageData = async (id: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to load page data
      // For now, create mock data
      const mockData: PageData = {
        id,
        title: "Pagina di Test",
        slug: "pagina-test",
        sections: [
          {
            id: "section-1",
            type: "hero",
            title: "Hero Section",
            content: {
              title: "Benvenuto in KORSVAGEN",
              subtitle: "La tua azienda di fiducia",
              ctaText: "Scopri di più",
              ctaLink: "#about",
            },
            isActive: true,
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setPageData(mockData);
      setSections(mockData.sections);
    } catch (error) {
      toast.error("Errore nel caricamento della pagina");
      console.error("Error loading page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePageData = async (data: any) => {
    try {
      // TODO: Implement API call to save page data
      console.log("Saving page data:", data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (pageData) {
        setPageData({
          ...pageData,
          sections: data.sections,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error saving page:", error);
      throw error;
    }
  };

  const handleSectionAdd = (type: Section["type"]) => {
    const defaultContent: Record<string, SectionContent> = {
      hero: {
        title: "Nuovo Titolo Hero",
        subtitle: "Sottotitolo",
        ctaText: "Clicca qui",
        backgroundColor: "#ffffff",
        textColor: "#333333",
      },
      about: {
        title: "Chi Siamo",
        content: "Contenuto della sezione about...",
        layout: "left",
        backgroundColor: "#ffffff",
        textColor: "#333333",
      },
      gallery: {
        title: "Gallery",
        images: [],
        columns: 3,
        spacing: 16,
        showCaptions: false,
        lightbox: true,
      },
      contact: {
        title: "Contatti",
        formFields: [],
        contactInfo: {},
        showMap: false,
      },
    };

    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      title: `Sezione ${type}`,
      content: defaultContent[type] || {},
      isActive: true,
      order: sections.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
  };

  const handleSectionEdit = (section: Section) => {
    setSelectedSectionId(section.id);
    setView("edit");
  };

  const handleSectionChange = (updatedSection: Section) => {
    setSections(
      sections.map((s) =>
        s.id === updatedSection.id
          ? { ...updatedSection, updatedAt: new Date() }
          : s
      )
    );
  };

  const handleSectionDuplicate = (section: Section) => {
    const newSection: Section = {
      ...section,
      id: `${section.id}-copy-${Date.now()}`,
      title: `${section.title} (Copia)`,
      order: sections.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSections([...sections, newSection]);
  };

  const handleSectionDelete = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };

  const handleSectionsChange = (newSections: Section[]) => {
    setSections(newSections);
  };

  const handlePublish = async () => {
    try {
      // TODO: Implement publish logic
      toast.success("Pagina pubblicata con successo");
    } catch (error) {
      toast.error("Errore nella pubblicazione");
    }
  };

  const selectedSection =
    sections.find((s) => s.id === selectedSectionId) || null;

  if (isLoading) {
    return (
      <EditorContainer>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            fontSize: "18px",
            color: "#666",
          }}
        >
          Caricamento...
        </div>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <EditorHeader>
        <HeaderLeft>
          <BackButton onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            Torna alla Dashboard
          </BackButton>
          <div>
            <PageTitle>{pageData?.title || "Editor Pagina"}</PageTitle>
            <PageMeta>
              {sections.length} sezioni • Ultima modifica:{" "}
              {lastSaved ? lastSaved.toLocaleString() : "Mai salvata"}
            </PageMeta>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <SaveStatus isSaving={isSaving} hasUnsavedChanges={hasUnsavedChanges}>
            {isSaving
              ? "Salvando..."
              : hasUnsavedChanges
              ? "Modifiche non salvate"
              : "Salvato"}
          </SaveStatus>

          <ViewToggle>
            <ViewButton
              active={view === "edit"}
              onClick={() => setView("edit")}
            >
              <Settings size={16} />
              Modifica
            </ViewButton>
            <ViewButton
              active={view === "preview"}
              onClick={() => setView("preview")}
            >
              <Eye size={16} />
              Preview
            </ViewButton>
          </ViewToggle>

          <ActionButton onClick={handlePublish}>
            <Save size={16} />
            Pubblica
          </ActionButton>
        </HeaderRight>
      </EditorHeader>

      <EditorBody>
        <LeftPanel collapsed={leftPanelCollapsed}>
          <PanelHeader>
            <PanelTitle>Sezioni</PanelTitle>
            <ToggleButton
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            >
              {leftPanelCollapsed ? "→" : "←"}
            </ToggleButton>
          </PanelHeader>
          {!leftPanelCollapsed && (
            <SectionsList
              sections={sections}
              onSectionsChange={handleSectionsChange}
              onSectionEdit={handleSectionEdit}
              onSectionAdd={handleSectionAdd}
            />
          )}
        </LeftPanel>

        {view === "edit" && (
          <MiddlePanel collapsed={middlePanelCollapsed}>
            <PanelHeader>
              <PanelTitle>Editor</PanelTitle>
              <ToggleButton
                onClick={() => setMiddlePanelCollapsed(!middlePanelCollapsed)}
              >
                {middlePanelCollapsed ? "→" : "←"}
              </ToggleButton>
            </PanelHeader>
            {!middlePanelCollapsed && (
              <SectionEditor
                section={selectedSection}
                onSectionChange={handleSectionChange}
                onSectionDuplicate={handleSectionDuplicate}
                onSectionDelete={handleSectionDelete}
              />
            )}
          </MiddlePanel>
        )}

        <RightPanel>
          <PreviewPanel
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSectionSelect={setSelectedSectionId}
            showInactiveSection={false}
          />
        </RightPanel>
      </EditorBody>
    </EditorContainer>
  );
};

export default PageEditor;
