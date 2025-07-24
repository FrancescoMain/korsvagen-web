import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Search, Grid, List, X, Check } from "lucide-react";
import type { MediaItem } from "../../../types/editor";
import MediaUpload from "./MediaUpload";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 90vw;
  max-width: 1000px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const ModalContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Toolbar = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 16px;
  align-items: center;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #666;
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;
  background: ${(props) => (props.active ? "#4CAF50" : "white")};
  color: ${(props) => (props.active ? "white" : "#666")};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:first-child {
    border-radius: 4px 0 0 4px;
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }

  &:hover {
    background: ${(props) => (props.active ? "#45a049" : "#f5f5f5")};
  }
`;

const MediaGrid = styled.div<{ view: "grid" | "list" }>`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: ${(props) => (props.view === "grid" ? "grid" : "flex")};
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  flex-direction: ${(props) => (props.view === "list" ? "column" : "row")};
`;

const MediaItem = styled.div<{ selected: boolean; view: "grid" | "list" }>`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid ${(props) => (props.selected ? "#4CAF50" : "transparent")};
  background: #f8f9fa;
  display: ${(props) => (props.view === "list" ? "flex" : "block")};
  align-items: ${(props) => (props.view === "list" ? "center" : "stretch")};
  padding: ${(props) => (props.view === "list" ? "12px" : "0")};
  gap: ${(props) => (props.view === "list" ? "16px" : "0")};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const MediaImage = styled.img<{ view: "grid" | "list" }>`
  width: ${(props) => (props.view === "list" ? "80px" : "100%")};
  height: ${(props) => (props.view === "list" ? "80px" : "150px")};
  object-fit: cover;
  border-radius: ${(props) => (props.view === "list" ? "4px" : "0")};
`;

const MediaInfo = styled.div<{ view: "grid" | "list" }>`
  padding: ${(props) => (props.view === "list" ? "0" : "12px")};
  flex: ${(props) => (props.view === "list" ? "1" : "initial")};
`;

const MediaTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: #333;
`;

const MediaMeta = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
`;

const SelectionIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Actions = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 8px 16px;
  border: ${(props) =>
    props.variant === "primary" ? "none" : "1px solid #e0e0e0"};
  background: ${(props) => (props.variant === "primary" ? "#4CAF50" : "white")};
  color: ${(props) => (props.variant === "primary" ? "white" : "#666")};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.variant === "primary" ? "#45a049" : "#f5f5f5"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.active ? "#4CAF50" : "transparent")};
  color: ${(props) => (props.active ? "#4CAF50" : "#666")};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    color: #4caf50;
  }
`;

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  accept?: string;
  existingMedia?: MediaItem[];
}

const MediaPicker: React.FC<MediaPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  accept = "image/*",
  existingMedia = [],
}) => {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Load media library
      loadMediaLibrary();
    }
  }, [isOpen]);

  const loadMediaLibrary = async () => {
    try {
      // TODO: Implement API call to fetch media library
      // For now, use existing media as placeholder
      setMediaLibrary(existingMedia);
    } catch (error) {
      console.error("Error loading media library:", error);
    }
  };

  const handleMediaSelect = (media: MediaItem) => {
    if (multiple) {
      setSelectedMedia((prev) => {
        const isSelected = prev.some((m) => m.id === media.id);
        if (isSelected) {
          return prev.filter((m) => m.id !== media.id);
        } else {
          return [...prev, media];
        }
      });
    } else {
      setSelectedMedia([media]);
    }
  };

  const handleUpload = async (files: File[]): Promise<MediaItem[]> => {
    // TODO: Implement upload to Cloudinary
    // For now, create mock media items
    const mockMedia: MediaItem[] = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      publicId: `uploads/${file.name}`,
      width: 800,
      height: 600,
      format: file.type.split("/")[1],
      size: file.size,
      altText: file.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    setMediaLibrary((prev) => [...mockMedia, ...prev]);
    return mockMedia;
  };

  const handleConfirm = () => {
    if (selectedMedia.length > 0) {
      onSelect(multiple ? selectedMedia : selectedMedia[0]);
      onClose();
      setSelectedMedia([]);
    }
  };

  const filteredMedia = mediaLibrary.filter(
    (media) =>
      media.altText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.caption?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Seleziona Media</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <TabContainer>
          <Tab
            active={activeTab === "library"}
            onClick={() => setActiveTab("library")}
          >
            Libreria Media
          </Tab>
          <Tab
            active={activeTab === "upload"}
            onClick={() => setActiveTab("upload")}
          >
            Carica Nuovo
          </Tab>
        </TabContainer>

        <ModalContent>
          {activeTab === "library" && (
            <>
              <Toolbar>
                <SearchContainer>
                  <SearchIcon />
                  <SearchInput
                    type="text"
                    placeholder="Cerca media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                <ViewToggle>
                  <ViewButton
                    active={view === "grid"}
                    onClick={() => setView("grid")}
                  >
                    <Grid size={16} />
                  </ViewButton>
                  <ViewButton
                    active={view === "list"}
                    onClick={() => setView("list")}
                  >
                    <List size={16} />
                  </ViewButton>
                </ViewToggle>
              </Toolbar>

              <MediaGrid view={view}>
                {filteredMedia.map((media) => (
                  <MediaItem
                    key={media.id}
                    selected={selectedMedia.some((m) => m.id === media.id)}
                    view={view}
                    onClick={() => handleMediaSelect(media)}
                  >
                    <MediaImage
                      src={media.url}
                      alt={media.altText || "Media"}
                      view={view}
                    />
                    <MediaInfo view={view}>
                      <MediaTitle>{media.altText || "Untitled"}</MediaTitle>
                      <MediaMeta>
                        {media.width}x{media.height} •{" "}
                        {(media.size / 1024).toFixed(1)}KB
                      </MediaMeta>
                    </MediaInfo>
                    {selectedMedia.some((m) => m.id === media.id) && (
                      <SelectionIndicator>
                        <Check size={16} />
                      </SelectionIndicator>
                    )}
                  </MediaItem>
                ))}
              </MediaGrid>
            </>
          )}

          {activeTab === "upload" && (
            <div style={{ padding: "24px" }}>
              <MediaUpload
                onUpload={handleUpload}
                accept={accept}
                multiple={multiple}
              />
            </div>
          )}
        </ModalContent>

        <Actions>
          <div>
            {selectedMedia.length > 0 && (
              <span style={{ fontSize: "14px", color: "#666" }}>
                {selectedMedia.length} elemento
                {selectedMedia.length > 1 ? "i" : ""} selezionato
                {selectedMedia.length > 1 ? "i" : ""}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={onClose}>Annulla</Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={selectedMedia.length === 0}
            >
              Conferma
            </Button>
          </div>
        </Actions>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default MediaPicker;
