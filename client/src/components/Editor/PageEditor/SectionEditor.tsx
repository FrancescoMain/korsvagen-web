import React from "react";
import styled from "styled-components";
import type { Section } from "../../../types/editor";
import HeroEditor from "../SectionTypes/HeroEditor";
import AboutEditor from "../SectionTypes/AboutEditor";
import GalleryEditor from "../SectionTypes/GalleryEditor";
import ContactEditor from "../SectionTypes/ContactEditor";

const EditorContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #666;
  padding: 40px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: #999;
  margin: 0;
`;

interface SectionEditorProps {
  section: Section | null;
  onSectionChange: (section: Section) => void;
  onSectionDuplicate: (section: Section) => void;
  onSectionDelete: (sectionId: string) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onSectionChange,
  onSectionDuplicate,
  onSectionDelete,
}) => {
  if (!section) {
    return (
      <EditorContainer>
        <EmptyState>
          <EmptyIcon>✏️</EmptyIcon>
          <EmptyTitle>Seleziona una sezione</EmptyTitle>
          <EmptyDescription>
            Scegli una sezione dalla lista per iniziare a modificarla
          </EmptyDescription>
        </EmptyState>
      </EditorContainer>
    );
  }

  const handleDuplicate = () => {
    onSectionDuplicate(section);
  };

  const handleDelete = () => {
    onSectionDelete(section.id);
  };

  const renderEditor = () => {
    switch (section.type) {
      case "hero":
        return (
          <HeroEditor
            section={section}
            onChange={onSectionChange}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        );
      case "about":
        return (
          <AboutEditor
            section={section}
            onChange={onSectionChange}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        );
      case "gallery":
        return (
          <GalleryEditor
            section={section}
            onChange={onSectionChange}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        );
      case "contact":
        return (
          <ContactEditor
            section={section}
            onChange={onSectionChange}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        );
      default:
        return (
          <EmptyState>
            <EmptyIcon>❓</EmptyIcon>
            <EmptyTitle>Tipo di sezione non supportato</EmptyTitle>
            <EmptyDescription>
              Il tipo di sezione "{section.type}" non è ancora supportato
            </EmptyDescription>
          </EmptyState>
        );
    }
  };

  return <EditorContainer>{renderEditor()}</EditorContainer>;
};

export default SectionEditor;
