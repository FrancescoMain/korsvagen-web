import React, { useState } from "react";
import styled from "styled-components";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, ChevronUp, ChevronDown } from "lucide-react";
import type { Section, DragEndEvent } from "../../../types/editor";

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

const SectionItem = styled.div<{ isDragging: boolean }>`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  opacity: ${(props) => (props.isDragging ? 0.5 : 1)};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #666;
  cursor: grab;

  &:hover {
    color: #4caf50;
  }

  &:active {
    cursor: grabbing;
  }
`;

const SectionInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionIcon = styled.span`
  font-size: 18px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #333;
`;

const SectionMeta = styled.div`
  font-size: 12px;
  color: #666;
  margin-left: auto;
`;

const SectionActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 4px 8px;
  border: 1px solid
    ${(props) => (props.variant === "primary" ? "#4CAF50" : "#e0e0e0")};
  background: ${(props) => (props.variant === "primary" ? "#4CAF50" : "white")};
  color: ${(props) => (props.variant === "primary" ? "white" : "#666")};
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const StatusIndicator = styled.div<{ isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.isActive ? "#4CAF50" : "#ccc")};
`;

const SectionContent = styled.div<{ isCollapsed: boolean }>`
  max-height: ${(props) => (props.isCollapsed ? "0" : "200px")};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding-top: ${(props) => (props.isCollapsed ? "0" : "12px")};
`;

const SectionPreview = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const AddSectionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border: 2px dashed #e0e0e0;
  background: white;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    border-color: #4caf50;
    color: #4caf50;
    background: #f8fff8;
  }
`;

const AddSectionMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 8px;
  margin-top: 4px;
`;

const SectionTypeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: none;
  background: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

interface SortableItemProps {
  section: Section;
  onEdit: (section: Section) => void;
  onToggleCollapse: (sectionId: string) => void;
  onDuplicate: (section: Section) => void;
  onDelete: (sectionId: string) => void;
  isCollapsed: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  section,
  onEdit,
  onToggleCollapse,
  onDuplicate,
  onDelete,
  isCollapsed,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "hero":
        return "🎯";
      case "about":
        return "📝";
      case "gallery":
        return "🖼️";
      case "contact":
        return "📞";
      default:
        return "📄";
    }
  };

  const getSectionPreview = (section: Section) => {
    switch (section.type) {
      case "hero":
        return section.content?.title || "Hero section senza titolo";
      case "about":
        return section.content?.title || "About section senza titolo";
      case "gallery":
        const imageCount = section.content?.images?.length || 0;
        return `${
          section.content?.title || "Gallery"
        } (${imageCount} immagini)`;
      case "contact":
        const fieldCount = section.content?.formFields?.length || 0;
        return `${section.content?.title || "Contatti"} (${fieldCount} campi)`;
      default:
        return "Sezione personalizzata";
    }
  };

  return (
    <SectionItem ref={setNodeRef} style={style} isDragging={isDragging}>
      <SectionHeader>
        <DragHandle {...attributes} {...listeners}>
          <GripVertical size={16} />
        </DragHandle>

        <SectionInfo>
          <SectionIcon>{getSectionIcon(section.type)}</SectionIcon>
          <SectionTitle>{section.title}</SectionTitle>
          <StatusIndicator isActive={section.isActive} />
        </SectionInfo>

        <SectionMeta>
          Ultimo aggiornamento:{" "}
          {new Date(section.updatedAt).toLocaleDateString()}
        </SectionMeta>

        <SectionActions>
          <ActionButton onClick={() => onEdit(section)}>Modifica</ActionButton>
          <ActionButton onClick={() => onDuplicate(section)}>
            Duplica
          </ActionButton>
          <ActionButton onClick={() => onDelete(section.id)}>
            Elimina
          </ActionButton>
          <ActionButton onClick={() => onToggleCollapse(section.id)}>
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </ActionButton>
        </SectionActions>
      </SectionHeader>

      <SectionContent isCollapsed={isCollapsed}>
        <SectionPreview>{getSectionPreview(section)}</SectionPreview>
      </SectionContent>
    </SectionItem>
  );
};

interface SectionsListProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onSectionEdit: (section: Section) => void;
  onSectionAdd: (type: Section["type"]) => void;
}

const SectionsList: React.FC<SectionsListProps> = ({
  sections,
  onSectionsChange,
  onSectionEdit,
  onSectionAdd,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && String(active.id) !== String(over.id)) {
      const oldIndex = sections.findIndex(
        (section) => section.id === String(active.id)
      );
      const newIndex = sections.findIndex(
        (section) => section.id === String(over.id)
      );

      const newSections = arrayMove(sections, oldIndex, newIndex);
      // Update order property
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        order: index,
      }));

      onSectionsChange(updatedSections);
    }
  };

  const handleToggleCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleDuplicate = (section: Section) => {
    const newSection: Section = {
      ...section,
      id: `${section.id}-copy-${Date.now()}`,
      title: `${section.title} (Copia)`,
      order: sections.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onSectionsChange([...sections, newSection]);
  };

  const handleDelete = (sectionId: string) => {
    const updatedSections = sections.filter(
      (section) => section.id !== sectionId
    );
    onSectionsChange(updatedSections);
  };

  const sectionTypes = [
    { type: "hero" as const, name: "Hero Section", icon: "🎯" },
    { type: "about" as const, name: "About Section", icon: "📝" },
    { type: "gallery" as const, name: "Gallery", icon: "🖼️" },
    { type: "contact" as const, name: "Contact Section", icon: "📞" },
  ];

  return (
    <ListContainer>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SortableItem
              key={section.id}
              section={section}
              onEdit={onSectionEdit}
              onToggleCollapse={handleToggleCollapse}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              isCollapsed={collapsedSections.has(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div style={{ position: "relative" }}>
        <AddSectionButton onClick={() => setShowAddMenu(!showAddMenu)}>
          <Plus size={16} />
          Aggiungi Sezione
        </AddSectionButton>

        {showAddMenu && (
          <AddSectionMenu>
            {sectionTypes.map((type) => (
              <SectionTypeButton
                key={type.type}
                onClick={() => {
                  onSectionAdd(type.type);
                  setShowAddMenu(false);
                }}
              >
                <span>{type.icon}</span>
                <span>{type.name}</span>
              </SectionTypeButton>
            ))}
          </AddSectionMenu>
        )}
      </div>
    </ListContainer>
  );
};

export default SectionsList;
