/**
 * IMAGE UPLOAD MODAL - Modal per upload immagini profilo membri team
 */

import React, { useState, useRef } from "react";
import styled from "styled-components";
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const Content = styled.div`
  padding: 2rem;
`;

const DropZone = styled.div<{ isDragOver: boolean; hasFile: boolean }>`
  border: 2px dashed ${props => props.isDragOver ? '#d4af37' : props.hasFile ? '#28a745' : '#ddd'};
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.isDragOver ? '#faf9f5' : props.hasFile ? '#f8fff9' : '#fafafa'};
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 1.5rem;

  &:hover {
    border-color: #d4af37;
    background: #faf9f5;
  }
`;

const DropZoneIcon = styled.div<{ hasFile: boolean }>`
  font-size: 3rem;
  color: ${props => props.hasFile ? '#28a745' : '#999'};
  margin-bottom: 1rem;
`;

const DropZoneText = styled.div`
  .primary {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .secondary {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
  }

  .formats {
    font-size: 0.8rem;
    color: #999;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const PreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const PreviewImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #d4af37;
`;

const FileInfo = styled.div`
  flex: 1;

  .filename {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .filesize {
    font-size: 0.9rem;
    color: #666;
  }
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #c82333;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.9rem;
  min-width: 100px;

  ${props => props.variant === 'primary' ? `
    background: #d4af37;
    color: white;
    &:hover:not(:disabled) {
      background: #b8941f;
    }
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  ` : `
    background: #f8f9fa;
    color: #333;
    border: 1px solid #ddd;
    &:hover {
      background: #e9ecef;
    }
  `}
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

interface ImageUploadModalProps {
  memberId: string;
  memberName: string;
  onUpload: (file: File) => Promise<void>;
  onCancel: () => void;
  uploading: boolean;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  memberId,
  memberName,
  onUpload,
  onCancel,
  uploading
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Tipo file
    if (!file.type.startsWith('image/')) {
      return "Solo immagini sono permesse (JPG, PNG, WebP)";
    }

    // Dimensione file (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Il file è troppo grande. Dimensione massima: 5MB";
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Crea preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <ImageIcon size={24} />
            Carica Immagine Profilo
          </Title>
          <Subtitle>
            Carica una foto profilo per {memberName}
          </Subtitle>
          <CloseButton onClick={onCancel}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

          {!selectedFile ? (
            <DropZone
              isDragOver={isDragOver}
              hasFile={!!selectedFile}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <DropZoneIcon hasFile={!!selectedFile}>
                <Upload />
              </DropZoneIcon>
              <DropZoneText>
                <div className="primary">
                  Trascina un'immagine qui o clicca per selezionare
                </div>
                <div className="secondary">
                  L'immagine sarà automaticamente ridimensionata a 400x400px
                </div>
                <div className="formats">
                  Formati supportati: JPG, PNG, WebP • Max 5MB
                </div>
              </DropZoneText>
            </DropZone>
          ) : (
            <PreviewContainer>
              <PreviewImage src={previewUrl!} alt="Preview" />
              <FileInfo>
                <div className="filename">{selectedFile.name}</div>
                <div className="filesize">{formatFileSize(selectedFile.size)}</div>
              </FileInfo>
              <RemoveButton onClick={handleRemoveFile}>
                <X size={16} />
              </RemoveButton>
            </PreviewContainer>
          )}

          <FileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
          />

          <Actions>
            <Button variant="secondary" onClick={onCancel} disabled={uploading}>
              Annulla
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
            >
              {uploading && <LoadingSpinner />}
              {uploading ? 'Caricamento...' : 'Carica Immagine'}
            </Button>
          </Actions>
        </Content>
      </Modal>
    </Overlay>
  );
};

export default ImageUploadModal;