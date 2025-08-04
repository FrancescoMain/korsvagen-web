/**
 * TEAM MEMBER FORM - Form per creazione/modifica membri del team
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { TeamMember, CreateTeamMemberData, UpdateTeamMemberData } from "../../hooks/useTeam";
import { X, Plus, Trash2, User } from "lucide-react";

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
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const Header = styled.div`
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
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

const Form = styled.form`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  ${props => props.fullWidth && 'grid-column: 1 / -1;'}
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  }

  &:invalid {
    border-color: #dc3545;
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #333;
  cursor: pointer;
`;

const SkillsContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  background: #fafafa;
`;

const SkillItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SkillInput = styled(Input)`
  flex: 1;
  margin: 0;
`;

const SkillButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &.add {
    background: #d4af37;
    color: white;
    &:hover { background: #b8941f; }
  }
  
  &.remove {
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
  position: sticky;
  bottom: 0;
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

const HelpText = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin: 0.25rem 0 0 0;
  line-height: 1.4;
`;

interface TeamMemberFormProps {
  member: TeamMember | null;
  onSubmit: (data: CreateTeamMemberData | UpdateTeamMemberData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  member,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [formData, setFormData] = useState<CreateTeamMemberData>({
    name: "",
    role: "",
    short_description: "",
    full_description: "",
    placeholder: "",
    experience: "",
    education: "",
    skills: [],
    display_order: 1,
    is_active: true,
  });

  const [skills, setSkills] = useState<string[]>([""]);

  // Inizializza il form con i dati del membro se in modifica
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        role: member.role,
        short_description: member.short_description || "",
        full_description: member.full_description || "",
        placeholder: member.placeholder,
        experience: member.experience || "",
        education: member.education || "",
        skills: member.skills || [],
        display_order: member.display_order,
        is_active: member.is_active,
      });
      setSkills(member.skills?.length ? [...member.skills, ""] : [""]);
    }
  }, [member]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const addSkill = () => {
    setSkills([...skills, ""]);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      const newSkills = skills.filter((_, i) => i !== index);
      setSkills(newSkills);
    }
  };

  const generatePlaceholder = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 4);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    handleInputChange(e);
    
    // Auto-genera placeholder se non è stato modificato manualmente
    if (!member) {
      setFormData(prev => ({
        ...prev,
        placeholder: generatePlaceholder(name)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtra skills vuote
    const filteredSkills = skills.filter(skill => skill.trim() !== "");
    
    const submitData = {
      ...formData,
      skills: filteredSkills,
    };

    await onSubmit(submitData);
  };

  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <User size={20} />
            {member ? 'Modifica Membro Team' : 'Nuovo Membro Team'}
          </Title>
          <CloseButton onClick={onCancel}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {/* Informazioni Base */}
          <Section>
            <SectionTitle>Informazioni Base</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="Mario Rossi"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="role">Ruolo *</Label>
                <Input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  placeholder="Project Manager"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="placeholder">Iniziali Avatar *</Label>
                <Input
                  type="text"
                  id="placeholder"
                  name="placeholder"
                  value={formData.placeholder}
                  onChange={handleInputChange}
                  required
                  maxLength={4}
                  pattern="[A-Z]{1,4}"
                  placeholder="MR"
                  style={{ textTransform: 'uppercase' }}
                />
                <HelpText>1-4 lettere maiuscole per l'avatar (es. MR per Mario Rossi)</HelpText>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="experience">Esperienza</Label>
                <Input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="10+ anni nel settore"
                />
              </FormGroup>
            </FormGrid>
          </Section>

          {/* Descrizioni */}
          <Section>
            <SectionTitle>Descrizioni</SectionTitle>
            <FormGroup fullWidth>
              <Label htmlFor="short_description">Descrizione Breve</Label>
              <Textarea
                id="short_description"
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                placeholder="Breve descrizione che appare nella card del team..."
                rows={2}
              />
              <HelpText>Descrizione visibile nelle card del team (max 500 caratteri)</HelpText>
            </FormGroup>
            <FormGroup fullWidth>
              <Label htmlFor="full_description">Descrizione Completa</Label>
              <Textarea
                id="full_description"
                name="full_description"
                value={formData.full_description}
                onChange={handleInputChange}
                placeholder="Descrizione dettagliata che appare nel modal..."
                rows={5}
              />
              <HelpText>Descrizione completa visibile nel modal di dettaglio</HelpText>
            </FormGroup>
          </Section>

          {/* Formazione */}
          <Section>
            <SectionTitle>Formazione</SectionTitle>
            <FormGroup fullWidth>
              <Label htmlFor="education">Percorso Formativo</Label>
              <Textarea
                id="education"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                placeholder="Laurea in Ingegneria, Master in Project Management..."
                rows={3}
              />
            </FormGroup>
          </Section>

          {/* Competenze */}
          <Section>
            <SectionTitle>Competenze</SectionTitle>
            <SkillsContainer>
              {skills.map((skill, index) => (
                <SkillItem key={index}>
                  <SkillInput
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="Inserisci competenza..."
                  />
                  {index === skills.length - 1 ? (
                    <SkillButton type="button" className="add" onClick={addSkill}>
                      <Plus size={16} />
                    </SkillButton>
                  ) : (
                    <SkillButton type="button" className="remove" onClick={() => removeSkill(index)}>
                      <Trash2 size={16} />
                    </SkillButton>
                  )}
                </SkillItem>
              ))}
            </SkillsContainer>
            <HelpText>Aggiungi le competenze principali del membro del team</HelpText>
          </Section>

          {/* Impostazioni */}
          <Section>
            <SectionTitle>Impostazioni</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label htmlFor="display_order">Ordine di Visualizzazione</Label>
                <Input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleInputChange}
                  min="1"
                />
                <HelpText>Numero che determina l'ordine nel sito (1 = primo)</HelpText>
              </FormGroup>
              <FormGroup>
                <CheckboxLabel>
                  <Checkbox
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Membro attivo e visibile nel sito
                </CheckboxLabel>
              </FormGroup>
            </FormGrid>
          </Section>
        </Form>

        <ButtonGroup>
          <Button type="button" onClick={onCancel}>
            Annulla
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Salvando...' : (member ? 'Aggiorna Membro' : 'Crea Membro')}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default TeamMemberForm;