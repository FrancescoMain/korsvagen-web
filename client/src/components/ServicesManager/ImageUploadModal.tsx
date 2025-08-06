/**
 * IMAGE UPLOAD MODAL - Modal per upload immagini servizi
 */

import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

const Overlay = styled.div`
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
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ServiceName = styled.div`
  color: #666;
  font-size: 0.9rem;
  font-weight: normal;
  margin-top: 0.25rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Body = styled.div`
  padding: 2rem;
`;

const DropZone = styled.div<{ isDragOver: boolean; hasFile: boolean }>`
  border: 2px dashed ${props => 
    props.hasFile ? '#28a745' : 
    props.isDragOver ? '#d4af37' : '#ddd'
  };
  border-radius: 8px;
  padding: 3rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => 
    props.hasFile ? '#f8fff9' :
    props.isDragOver ? '#fffbf0' : '#fafafa'
  };

  &:hover {
    border-color: ${props => props.hasFile ? '#28a745' : '#d4af37'};
    background: ${props => props.hasFile ? '#f8fff9' : '#fffbf0'};
  }
`;

const DropZoneIcon = styled.div<{ hasFile: boolean }>`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${props => props.hasFile ? '#28a745' : '#d4af37'};
`;

const DropZoneText = styled.div`
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const DropZoneSubtext = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInfo = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FileName = styled.div`
  flex: 1;
  font-weight: 500;
  color: #333;
`;

const FileSize = styled.div`
  color: #666;
  font-size: 0.8rem;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  margin-top: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const Footer = styled.div`
  padding: 1rem 2rem 2rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  ${props => props.variant === 'primary' ? `
    background: #d4af37;
    color: white;
    &:hover:not(:disabled) {
      background: #b8941f;
      transform: translateY(-1px);
    }
  ` : `
    background: #f8f9fa;
    color: #333;
    border: 1px solid #e0e0e0;
    &:hover:not(:disabled) {
      background: #e9ecef;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

interface ImageUploadModalProps {
  serviceId: string;
  serviceName: string;
  onUpload: (file: File) => void;
  onCancel: () => void;
  uploading?: boolean;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  serviceId,
  serviceName,
  onUpload,
  onCancel,
  uploading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato file non supportato. Usa JPG, PNG o WebP.';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'Il file è troppo grande. Massimo 10MB consentito.';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && !uploading) {
      onUpload(selectedFile);
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
          <div>
            <Title>
              <ImageIcon size={20} />
              Carica Immagine
            </Title>
            <ServiceName>{serviceName}</ServiceName>
          </div>
          <CloseButton onClick={onCancel}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Body>
          <DropZone
            isDragOver={isDragOver}
            hasFile={!!selectedFile}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <DropZoneIcon hasFile={!!selectedFile}>
              {selectedFile ? '✓' : '📁'}
            </DropZoneIcon>
            <DropZoneText>
              {selectedFile 
                ? 'File selezionato con successo!' 
                : isDragOver 
                  ? 'Rilascia il file qui...' 
                  : 'Trascina un\'immagine qui o clicca per selezionare'
              }
            </DropZoneText>
            <DropZoneSubtext>
              {selectedFile 
                ? 'Clicca "Carica" per confermare l\'upload' 
                : 'Formati supportati: JPG, PNG, WebP (max 10MB)'
              }
            </DropZoneSubtext>

            <FileInput
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleInputChange}
            />
          </DropZone>

          {selectedFile && (
            <FileInfo>
              <ImageIcon size={20} color="#28a745" />
              <FileName>{selectedFile.name}</FileName>
              <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
            </FileInfo>
          )}

          {previewUrl && (
            <ImagePreview src={previewUrl} alt="Preview" />
          )}

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}
        </Body>

        <Footer>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annulla
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            <Upload size={16} />
            {uploading ? 'Caricamento...' : 'Carica Immagine'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default ImageUploadModal;