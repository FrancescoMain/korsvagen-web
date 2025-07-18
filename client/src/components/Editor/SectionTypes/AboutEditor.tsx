import React, { useState } from "react";
import styled from "styled-components";
import { Image, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import type { Section, MediaItem, AboutContent } from "../../../types/editor";
import RichTextEditor from "../UI/RichTextEditor";
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

const Select = styled.select`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const MediaItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  aspect-ratio: 1;
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

const ColorPickerContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const ColorInput = styled.input`
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  background: none;
`;

interface AboutEditorProps {
  section: Section;
  onChange: (section: Section) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const AboutEditor: React.FC<AboutEditorProps> = ({
  section,
  onChange,
  onDuplicate,
  onDelete,
}) => {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const content = section.content as AboutContent;

  const updateField = (field: keyof AboutContent, value: any) => {
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

  return (
    <EditorContainer>
      <EditorHeader>
        <SectionTitle>📝 About Section</SectionTitle>
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
            placeholder="Inserisci il titolo della sezione..."
          />
        </FieldGroup>

        <FieldGroup>
          <Label>Contenuto</Label>
          <RichTextEditor
            value={content.content || ""}
            onChange={(value) => updateField("content", value)}
            placeholder="Inserisci il contenuto della sezione..."
            toolbar="full"
            height={300}
          />
        </FieldGroup>

        <FieldGroup>
          <Label>Layout</Label>
          <Select
            value={content.layout || "left"}
            onChange={(e) =>
              updateField(
                "layout",
                e.target.value as "left" | "right" | "center"
              )
            }
          >
            <option value="left">Testo a sinistra, immagini a destra</option>
            <option value="right">Immagini a sinistra, testo a destra</option>
            <option value="center">Testo centrato con immagini sotto</option>
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label>Immagini</Label>
          <ControlButton onClick={() => setIsMediaPickerOpen(true)}>
            <Plus size={16} style={{ marginRight: "8px" }} />
            Aggiungi Immagini
          </ControlButton>

          {content.images && content.images.length > 0 && (
            <MediaGrid>
              {content.images.map((image) => (
                <MediaItem key={image.id}>
                  <MediaImage
                    src={image.url}
                    alt={image.altText || "About image"}
                  />
                  <MediaActions>
                    <MediaActionButton
                      onClick={() => removeImage(image.id)}
                      title="Rimuovi immagine"
                    >
                      <Trash2 size={12} />
                    </MediaActionButton>
                  </MediaActions>
                </MediaItem>
              ))}
            </MediaGrid>
          )}
        </FieldGroup>

        <FieldGroup>
          <Label>Colore di Sfondo</Label>
          <ColorPickerContainer>
            <ColorInput
              type="color"
              value={content.backgroundColor || "#ffffff"}
              onChange={(e) => updateField("backgroundColor", e.target.value)}
            />
            <Input
              type="text"
              value={content.backgroundColor || "#ffffff"}
              onChange={(e) => updateField("backgroundColor", e.target.value)}
              placeholder="#ffffff"
            />
          </ColorPickerContainer>
        </FieldGroup>

        <FieldGroup>
          <Label>Colore del Testo</Label>
          <ColorPickerContainer>
            <ColorInput
              type="color"
              value={content.textColor || "#333333"}
              onChange={(e) => updateField("textColor", e.target.value)}
            />
            <Input
              type="text"
              value={content.textColor || "#333333"}
              onChange={(e) => updateField("textColor", e.target.value)}
              placeholder="#333333"
            />
          </ColorPickerContainer>
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

export default AboutEditor;
