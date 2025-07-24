import React, { useState } from "react";
import styled from "styled-components";
import { Plus, Trash2, Eye, EyeOff, Grid, Move } from "lucide-react";
import type { Section, MediaItem, GalleryContent } from "../../../types/editor";
import MediaPicker from "../MediaLibrary/MediaPicker";

const EditorContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const SectionControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ControlButton = styled.button<{
  variant?: "primary" | "secondary" | "danger";
}>`
  padding: 8px 16px;
  border: 1px solid
    ${(props) => {
      switch (props.variant) {
        case "primary":
          return "#4CAF50";
        case "danger":
          return "#f44336";
        default:
          return "#e0e0e0";
      }
    }};
  background: ${(props) => {
    switch (props.variant) {
      case "primary":
        return "#4CAF50";
      case "danger":
        return "#f44336";
      default:
        return "white";
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case "primary":
      case "danger":
        return "white";
      default:
        return "#666";
    }
  }};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  appearance: none;
  width: 40px;
  height: 20px;
  background: ${(props) => (props.checked ? "#4CAF50" : "#ccc")};
  border-radius: 10px;
  position: relative;
  outline: none;
  cursor: pointer;
  transition: background 0.2s;

  &:before {
    content: "";
    position: absolute;
    top: 2px;
    left: ${(props) => (props.checked ? "22px" : "2px")};
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

const EditorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Slider = styled.input`
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #4caf50;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const SliderValue = styled.span`
  font-size: 14px;
  color: #666;
  min-width: 40px;
`;

const MediaGrid = styled.div<{ columns: number; spacing: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns}, 1fr);
  gap: ${(props) => props.spacing}px;
  margin-top: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #f8f9fa;
`;

const MediaItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  aspect-ratio: 1;
  cursor: move;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

const MediaImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MediaActions = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
`;

const MediaActionButton = styled.button`
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const DragHandle = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 16px;
`;

const EmptyIcon = styled(Grid)`
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #ccc;
`;

interface GalleryEditorProps {
  section: Section;
  onChange: (section: Section) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const GalleryEditor: React.FC<GalleryEditorProps> = ({
  section,
  onChange,
  onDuplicate,
  onDelete,
}) => {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const content = section.content as GalleryContent;

  const updateField = (field: keyof GalleryContent, value: any) => {
    const updatedContent = { ...content, [field]: value };
    onChange({
      ...section,
      content: updatedContent,
    });
  };

  const toggleActive = () => {
    onChange({
      ...section,
      isActive: !section.isActive,
    });
  };

  const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
    const selectedMedia = Array.isArray(media) ? media : [media];
    const existingImages = content.images || [];
    updateField("images", [...existingImages, ...selectedMedia]);
    setIsMediaPickerOpen(false);
  };

  const removeImage = (imageId: string) => {
    const updatedImages = (content.images || []).filter(
      (img) => img.id !== imageId
    );
    updateField("images", updatedImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const images = [...(content.images || [])];
    const [movedImage] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, movedImage);
    updateField("images", images);
  };

  return (
    <EditorContainer>
      <EditorHeader>
        <SectionTitle>🖼️ Gallery Section</SectionTitle>
        <SectionControls>
          <ControlButton onClick={onDuplicate}>Duplica</ControlButton>
          <ControlButton variant="danger" onClick={onDelete}>
            Elimina
          </ControlButton>
          <Toggle>
            <ToggleInput
              type="checkbox"
              checked={section.isActive}
              onChange={toggleActive}
            />
            {section.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
          </Toggle>
        </SectionControls>
      </EditorHeader>

      <EditorContent>
        <FieldGroup>
          <Label>Titolo Sezione</Label>
          <Input
            type="text"
            value={content.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Inserisci il titolo della gallery..."
          />
        </FieldGroup>

        <FieldGroup>
          <Label>Numero di Colonne</Label>
          <SliderContainer>
            <Slider
              type="range"
              min="1"
              max="6"
              value={content.columns || 3}
              onChange={(e) => updateField("columns", parseInt(e.target.value))}
            />
            <SliderValue>{content.columns || 3}</SliderValue>
          </SliderContainer>
        </FieldGroup>

        <FieldGroup>
          <Label>Spaziatura (px)</Label>
          <SliderContainer>
            <Slider
              type="range"
              min="0"
              max="50"
              value={content.spacing || 16}
              onChange={(e) => updateField("spacing", parseInt(e.target.value))}
            />
            <SliderValue>{content.spacing || 16}px</SliderValue>
          </SliderContainer>
        </FieldGroup>

        <FieldGroup>
          <Label>Mostra Didascalie</Label>
          <Toggle>
            <ToggleInput
              type="checkbox"
              checked={content.showCaptions || false}
              onChange={(e) => updateField("showCaptions", e.target.checked)}
            />
            <span>Mostra didascalie sotto le immagini</span>
          </Toggle>
        </FieldGroup>

        <FieldGroup>
          <Label>Lightbox</Label>
          <Toggle>
            <ToggleInput
              type="checkbox"
              checked={content.lightbox || false}
              onChange={(e) => updateField("lightbox", e.target.checked)}
            />
            <span>Abilita lightbox per ingrandire le immagini</span>
          </Toggle>
        </FieldGroup>

        <FieldGroup>
          <Label>Immagini</Label>
          <ControlButton onClick={() => setIsMediaPickerOpen(true)}>
            <Plus size={16} style={{ marginRight: "8px" }} />
            Aggiungi Immagini
          </ControlButton>

          {content.images && content.images.length > 0 ? (
            <MediaGrid
              columns={content.columns || 3}
              spacing={content.spacing || 16}
            >
              {content.images.map((image, index) => (
                <MediaItem key={image.id}>
                  <MediaImage
                    src={image.url}
                    alt={image.altText || "Gallery image"}
                  />
                  <MediaActions>
                    <MediaActionButton
                      onClick={() => removeImage(image.id)}
                      title="Rimuovi immagine"
                    >
                      <Trash2 size={12} />
                    </MediaActionButton>
                  </MediaActions>
                  <DragHandle title="Trascina per riordinare">
                    <Move size={12} />
                  </DragHandle>
                </MediaItem>
              ))}
            </MediaGrid>
          ) : (
            <EmptyState>
              <EmptyIcon />
              <p>Nessuna immagine nella gallery</p>
              <p style={{ fontSize: "14px", color: "#999" }}>
                Clicca su "Aggiungi Immagini" per iniziare
              </p>
            </EmptyState>
          )}
        </FieldGroup>
      </EditorContent>

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        accept="image/*"
        multiple={true}
      />
    </EditorContainer>
  );
};

export default GalleryEditor;
