/**
 * CV UPLOAD MODAL - Modal per caricamento CV membri del team
 */

import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react";

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
`;

const Header = styled.div`
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0.5rem 0 0 0;
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
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isDragOver ? 'rgba(212, 175, 55, 0.05)' : props.hasFile ? 'rgba(40, 167, 69, 0.05)' : '#fafafa'};
  
  &:hover {
    border-color: #d4af37;
    background: rgba(212, 175, 55, 0.05);
  }
`;

const DropZoneIcon = styled.div<{ hasFile: boolean }>`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${props => props.hasFile ? '#28a745' : '#d4af37'};
`;

const DropZoneText = styled.div`
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

const FileInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .file-icon {
    color: #d4af37;
  }
  
  .file-details {
    flex: 1;
    
    .file-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }
    
    .file-size {
      color: #666;
      font-size: 0.85rem;
    }
  }
`;

const Requirements = styled.div`
  background: #e7f3ff;
  border: 1px solid #b8daff;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;

  .requirements-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #004085;
    margin-bottom: 0.5rem;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #004085;
    font-size: 0.85rem;
    
    li {
      margin-bottom: 0.25rem;
    }
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  ${props => props.variant === 'primary' ? `
    background: #d4af37;
    color: white;
    &:hover {
      background: #b8941f;
      transform: translateY(-1px);
    }
  ` : `
    background: #e0e0e0;
    color: #333;
    &:hover {
      background: #d0d0d0;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

interface CVUploadModalProps {
  memberId: string;
  memberName: string;
  onUpload: (file: File) => Promise<void>;
  onCancel: () => void;
  uploading: boolean;
}

const CVUploadModal: React.FC<CVUploadModalProps> = ({
  memberId,
  memberName,
  onUpload,
  onCancel,
  uploading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Solo file PDF sono permessi";
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return "Il file deve essere inferiore a 10MB";
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setSelectedFile(file);
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Upload size={20} />
            Carica CV
          </Title>
          <Subtitle>Carica il CV per {memberName}</Subtitle>
          <CloseButton onClick={onCancel}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          <DropZone
            isDragOver={isDragOver}
            hasFile={!!selectedFile}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <DropZoneIcon hasFile={!!selectedFile}>
              {selectedFile ? <CheckCircle /> : <Upload />}
            </DropZoneIcon>
            <DropZoneText>
              {selectedFile ? (
                <>
                  <h3>File selezionato!</h3>
                  <p>Clicca "Carica CV" per completare l'upload</p>
                </>
              ) : (
                <>
                  <h3>Trascina il CV qui</h3>
                  <p>Oppure clicca per selezionare un file PDF dal tuo computer</p>
                </>
              )}
            </DropZoneText>
          </DropZone>

          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
          />

          {selectedFile && (
            <FileInfo>
              <FileText size={24} className="file-icon" />
              <div className="file-details">
                <div className="file-name">{selectedFile.name}</div>
                <div className="file-size">{formatFileSize(selectedFile.size)}</div>
              </div>
            </FileInfo>
          )}

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

          <Requirements>
            <div className="requirements-title">
              <AlertCircle size={16} />
              Requisiti file
            </div>
            <ul>
              <li>Formato: Solo file PDF</li>
              <li>Dimensione massima: 10MB</li>
              <li>Il file sostituirà quello attualmente caricato</li>
            </ul>
          </Requirements>
        </Content>

        <ButtonGroup>
          <Button type="button" onClick={onCancel}>
            Annulla
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            disabled={!selectedFile || uploading}
            onClick={handleUpload}
          >
            {uploading ? 'Caricando...' : 'Carica CV'}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default CVUploadModal;