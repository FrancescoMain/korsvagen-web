import React, { useState } from "react";
import styled from "styled-components";
import { Image, Palette, Link, Eye, EyeOff } from "lucide-react";
import type { Section, MediaItem, HeroContent } from "../../../types/editor";
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

const MediaContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #f8f9fa;
`;

const MediaPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const MediaImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
`;

const MediaInfo = styled.div`
  flex: 1;
`;

const MediaTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
`;

const MediaMeta = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
`;

const MediaActions = styled.div`
  display: flex;
  gap: 8px;
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

interface HeroEditorProps {
  section: Section;
  onChange: (section: Section) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const HeroEditor: React.FC<HeroEditorProps> = ({
  section,
  onChange,
  onDuplicate,
  onDelete,
}) => {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const content = section.content as HeroContent;

  const updateField = (field: keyof HeroContent, value: any) => {
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
    const selectedMedia = Array.isArray(media) ? media[0] : media;
    updateField("backgroundImage", selectedMedia);
    setIsMediaPickerOpen(false);
  };

  const removeMedia = () => {
    updateField("backgroundImage", undefined);
  };

  return (
    <EditorContainer>
      <EditorHeader>
        <SectionTitle>🎯 Hero Section</SectionTitle>
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
          <Label>Titolo Principale</Label>
          <RichTextEditor
            value={content.title || ""}
            onChange={(value) => updateField("title", value)}
            placeholder="Inserisci il titolo principale..."
            toolbar="basic"
          />
        </FieldGroup>

        <FieldGroup>
          <Label>Sottotitolo</Label>
          <RichTextEditor
            value={content.subtitle || ""}
            onChange={(value) => updateField("subtitle", value)}
            placeholder="Inserisci il sottotitolo..."
            toolbar="minimal"
          />
        </FieldGroup>

        <FieldGroup>
          <Label>Immagine di Sfondo</Label>
          <MediaContainer>
            {content.backgroundImage ? (
              <MediaPreview>
                <MediaImage
                  src={content.backgroundImage.url}
                  alt={content.backgroundImage.altText || "Background"}
                />
                <MediaInfo>
                  <MediaTitle>
                    {content.backgroundImage.altText || "Untitled"}
                  </MediaTitle>
                  <MediaMeta>
                    {content.backgroundImage.width}x
                    {content.backgroundImage.height} •
                    {(content.backgroundImage.size / 1024).toFixed(1)}KB
                  </MediaMeta>
                </MediaInfo>
                <MediaActions>
                  <ControlButton onClick={() => setIsMediaPickerOpen(true)}>
                    Cambia
                  </ControlButton>
                  <ControlButton variant="danger" onClick={removeMedia}>
                    Rimuovi
                  </ControlButton>
                </MediaActions>
              </MediaPreview>
            ) : (
              <ControlButton onClick={() => setIsMediaPickerOpen(true)}>
                <Image size={16} style={{ marginRight: "8px" }} />
                Seleziona Immagine
              </ControlButton>
            )}
          </MediaContainer>
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

        <FieldGroup>
          <Label>Overlay</Label>
          <Toggle>
            <ToggleInput
              type="checkbox"
              checked={content.overlay || false}
              onChange={(e) => updateField("overlay", e.target.checked)}
            />
            <span>Abilita overlay scuro</span>
          </Toggle>
        </FieldGroup>

        {content.overlay && (
          <FieldGroup>
            <Label>Opacità Overlay</Label>
            <SliderContainer>
              <Slider
                type="range"
                min="0"
                max="100"
                value={content.overlayOpacity || 50}
                onChange={(e) =>
                  updateField("overlayOpacity", parseInt(e.target.value))
                }
              />
              <SliderValue>{content.overlayOpacity || 50}%</SliderValue>
            </SliderContainer>
          </FieldGroup>
        )}

        <FieldGroup>
          <Label>Testo Call to Action</Label>
          <Input
            type="text"
            value={content.ctaText || ""}
            onChange={(e) => updateField("ctaText", e.target.value)}
            placeholder="Es: Scopri di più"
          />
        </FieldGroup>

        <FieldGroup>
          <Label>Link Call to Action</Label>
          <Input
            type="url"
            value={content.ctaLink || ""}
            onChange={(e) => updateField("ctaLink", e.target.value)}
            placeholder="https://esempio.com"
          />
        </FieldGroup>
      </EditorContent>

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        accept="image/*"
      />
    </EditorContainer>
  );
};

export default HeroEditor;
