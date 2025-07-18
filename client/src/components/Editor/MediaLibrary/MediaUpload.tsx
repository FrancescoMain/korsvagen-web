import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { MediaItem } from "../../../types/editor";

const DropzoneContainer = styled.div<{ isDragActive: boolean }>`
  border: 2px dashed ${(props) => (props.isDragActive ? "#4CAF50" : "#e0e0e0")};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  background: ${(props) => (props.isDragActive ? "#f8fff8" : "#fafafa")};
  cursor: pointer;

  &:hover {
    border-color: #4caf50;
    background: #f8fff8;
  }
`;

const UploadIcon = styled(Upload)`
  width: 48px;
  height: 48px;
  color: #9e9e9e;
  margin-bottom: 16px;
`;

const UploadText = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 8px 0;
`;

const UploadHint = styled.p`
  font-size: 14px;
  color: #999;
  margin: 0;
`;

const PreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const PreviewItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  aspect-ratio: 1;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
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

const UploadProgress = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 14px;
  color: #1976d2;
`;

interface MediaUploadProps {
  onUpload: (files: File[]) => Promise<MediaItem[]>;
  onRemove?: (mediaId: string) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  existingMedia?: MediaItem[];
  disabled?: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onUpload,
  onRemove,
  accept = "image/*",
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  existingMedia = [],
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      setUploading(true);
      setUploadProgress(`Caricamento ${acceptedFiles.length} file...`);

      try {
        await onUpload(acceptedFiles);
        setUploadProgress("Caricamento completato!");
        setTimeout(() => {
          setUploadProgress("");
        }, 2000);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadProgress("Errore durante il caricamento");
        setTimeout(() => {
          setUploadProgress("");
        }, 3000);
      } finally {
        setUploading(false);
      }
    },
    [onUpload, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [accept]: [],
    },
    maxFiles: multiple ? maxFiles : 1,
    maxSize,
    multiple,
    disabled: disabled || uploading,
  });

  const handleRemove = (mediaId: string) => {
    if (onRemove) {
      onRemove(mediaId);
    }
  };

  return (
    <div>
      <DropzoneContainer {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <UploadIcon />
        <UploadText>
          {isDragActive
            ? "Rilascia i file qui..."
            : "Trascina i file qui o clicca per selezionare"}
        </UploadText>
        <UploadHint>
          Formati supportati: JPG, PNG, GIF, WebP (max{" "}
          {Math.round(maxSize / 1024 / 1024)}MB)
        </UploadHint>
      </DropzoneContainer>

      {uploadProgress && <UploadProgress>{uploadProgress}</UploadProgress>}

      {existingMedia.length > 0 && (
        <PreviewContainer>
          {existingMedia.map((media) => (
            <PreviewItem key={media.id}>
              <PreviewImage
                src={media.url}
                alt={media.altText || "Uploaded media"}
              />
              {onRemove && (
                <RemoveButton
                  onClick={() => handleRemove(media.id)}
                  title="Rimuovi"
                >
                  <X size={16} />
                </RemoveButton>
              )}
            </PreviewItem>
          ))}
        </PreviewContainer>
      )}
    </div>
  );
};

export default MediaUpload;
