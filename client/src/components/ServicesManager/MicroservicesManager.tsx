/**
 * MICROSERVICES MANAGER - Componente per gestire i micro-servizi
 */

import React, { useState } from "react";
import styled from "styled-components";
import { Plus, Trash2, GripVertical, Edit, Check, X } from "lucide-react";

const Container = styled.div`
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

const Header = styled.div<{ hasError?: boolean }>`
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-bottom: ${props => props.hasError ? '2px solid #dc3545' : '1px solid #e0e0e0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const AddButton = styled.button`
  background: #d4af37;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: background 0.2s ease;

  &:hover {
    background: #b8941f;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Body = styled.div`
  padding: 1rem;
  min-height: 60px;
`;

const MicroservicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MicroserviceItem = styled.div<{ isDragging?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s ease;
  opacity: ${props => props.isDragging ? 0.5 : 1};

  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const DragHandle = styled.div`
  cursor: grab;
  color: #999;
  display: flex;
  align-items: center;
  
  &:active {
    cursor: grabbing;
  }
`;

const MicroserviceText = styled.div`
  flex: 1;
  font-size: 0.9rem;
  color: #333;
`;

const EditInput = styled.input`
  flex: 1;
  border: 2px solid #d4af37;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  }
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' | 'confirm' | 'cancel' }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  ${props => {
    switch (props.variant) {
      case 'edit':
        return `
          color: #6c757d;
          &:hover { background: #e9ecef; color: #495057; }
        `;
      case 'delete':
        return `
          color: #dc3545;
          &:hover { background: #f8d7da; }
        `;
      case 'confirm':
        return `
          color: #28a745;
          &:hover { background: #d4edda; }
        `;
      case 'cancel':
        return `
          color: #6c757d;
          &:hover { background: #e9ecef; }
        `;
      default:
        return `
          color: #6c757d;
          &:hover { background: #e9ecef; }
        `;
    }
  }}
`;

const NewMicroserviceInput = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  }
`;

const ConfirmButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #218838;
  }
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #5a6268;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  padding: 1rem;
  font-style: italic;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

interface MicroservicesManagerProps {
  microservices: string[];
  onChange: (microservices: string[]) => void;
  error?: string;
  maxItems?: number;
}

const MicroservicesManager: React.FC<MicroservicesManagerProps> = ({
  microservices,
  onChange,
  error,
  maxItems = 20,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    setIsAdding(true);
    setNewItem("");
  };

  const handleConfirmAdd = () => {
    const trimmed = newItem.trim();
    if (trimmed && !microservices.includes(trimmed)) {
      onChange([...microservices, trimmed]);
    }
    setIsAdding(false);
    setNewItem("");
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewItem("");
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(microservices[index]);
  };

  const handleConfirmEdit = () => {
    if (editingIndex !== null) {
      const trimmed = editValue.trim();
      if (trimmed && !microservices.includes(trimmed)) {
        const updated = [...microservices];
        updated[editingIndex] = trimmed;
        onChange(updated);
      }
      setEditingIndex(null);
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleDelete = (index: number) => {
    const updated = microservices.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const updated = [...microservices];
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
      onChange(updated);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < microservices.length - 1) {
      const updated = [...microservices];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      onChange(updated);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
    if (e.key === 'Escape') {
      if (isAdding) {
        handleCancelAdd();
      } else if (editingIndex !== null) {
        handleCancelEdit();
      }
    }
  };

  const canAdd = microservices.length < maxItems;

  return (
    <Container>
      <Header hasError={!!error}>
        <HeaderTitle>
          Micro-Servizi ({microservices.length}/{maxItems})
        </HeaderTitle>
        {!isAdding && canAdd && (
          <AddButton onClick={handleAdd}>
            <Plus size={14} />
            Aggiungi
          </AddButton>
        )}
      </Header>

      <Body>
        {/* Input per nuovo microservizio */}
        {isAdding && (
          <NewMicroserviceInput>
            <Input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Nome micro-servizio..."
              onKeyDown={(e) => handleKeyPress(e, handleConfirmAdd)}
              autoFocus
            />
            <ConfirmButton 
              onClick={handleConfirmAdd}
              disabled={!newItem.trim() || microservices.includes(newItem.trim())}
            >
              <Check size={14} />
            </ConfirmButton>
            <CancelButton onClick={handleCancelAdd}>
              <X size={14} />
            </CancelButton>
          </NewMicroserviceInput>
        )}

        {/* Lista microservizi */}
        {microservices.length === 0 ? (
          <EmptyState>
            Nessun micro-servizio aggiunto.
            <br />
            Clicca "Aggiungi" per iniziare.
          </EmptyState>
        ) : (
          <MicroservicesList>
            {microservices.map((item, index) => (
              <MicroserviceItem key={index}>
                <DragHandle>
                  <GripVertical size={16} />
                </DragHandle>
                
                {editingIndex === index ? (
                  <>
                    <EditInput
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, handleConfirmEdit)}
                      autoFocus
                    />
                    <ActionButton 
                      variant="confirm" 
                      onClick={handleConfirmEdit}
                      disabled={!editValue.trim() || microservices.includes(editValue.trim())}
                    >
                      <Check size={14} />
                    </ActionButton>
                    <ActionButton variant="cancel" onClick={handleCancelEdit}>
                      <X size={14} />
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <MicroserviceText>{item}</MicroserviceText>
                    <ActionButton variant="edit" onClick={() => handleEdit(index)}>
                      <Edit size={14} />
                    </ActionButton>
                    <ActionButton variant="delete" onClick={() => handleDelete(index)}>
                      <Trash2 size={14} />
                    </ActionButton>
                  </>
                )}
              </MicroserviceItem>
            ))}
          </MicroservicesList>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Body>
    </Container>
  );
};

export default MicroservicesManager;