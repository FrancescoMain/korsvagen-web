import React, { useState } from "react";
import styled from "styled-components";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
} from "lucide-react";
import type { Section, ContactContent, FormField } from "../../../types/editor";

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

const Textarea = styled.textarea`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
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

const FormFieldsContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #f8f9fa;
`;

const FormFieldItem = styled.div`
  background: white;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  position: relative;
`;

const FormFieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const FormFieldTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: #333;
`;

const FormFieldActions = styled.div`
  display: flex;
  gap: 8px;
`;

const FormFieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const ContactInfoContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
`;

const ContactInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ContactIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MapContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  color: #666;
`;

interface ContactEditorProps {
  section: Section;
  onChange: (section: Section) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const ContactEditor: React.FC<ContactEditorProps> = ({
  section,
  onChange,
  onDuplicate,
  onDelete,
}) => {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const content = section.content as ContactContent;

  const updateField = (field: keyof ContactContent, value: any) => {
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

  const addFormField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: "text",
      label: "Nuovo Campo",
      name: "nuovo_campo",
      required: false,
      placeholder: "",
    };

    const existingFields = content.formFields || [];
    updateField("formFields", [...existingFields, newField]);
    setEditingFieldId(newField.id);
  };

  const updateFormField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = (content.formFields || []).map((field) =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    updateField("formFields", updatedFields);
  };

  const removeFormField = (fieldId: string) => {
    const updatedFields = (content.formFields || []).filter(
      (field) => field.id !== fieldId
    );
    updateField("formFields", updatedFields);
  };

  const updateContactInfo = (field: string, value: string) => {
    const updatedInfo = { ...content.contactInfo, [field]: value };
    updateField("contactInfo", updatedInfo);
  };

  const updateMapLocation = (field: string, value: number) => {
    const updatedLocation = { ...content.mapLocation, [field]: value };
    updateField("mapLocation", updatedLocation);
  };

  return (
    <EditorContainer>
      <EditorHeader>
        <SectionTitle>📞 Contact Section</SectionTitle>
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
            placeholder="Inserisci il titolo della sezione contatti..."
          />
        </FieldGroup>

        <FieldGroup>
          <Label>Form di Contatto</Label>
          <FormFieldsContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <strong>Campi del Form</strong>
              <ControlButton onClick={addFormField}>
                <Plus size={16} style={{ marginRight: "8px" }} />
                Aggiungi Campo
              </ControlButton>
            </div>

            {content.formFields?.map((field) => (
              <FormFieldItem key={field.id}>
                <FormFieldHeader>
                  <FormFieldTitle>{field.label}</FormFieldTitle>
                  <FormFieldActions>
                    <ControlButton
                      onClick={() =>
                        setEditingFieldId(
                          field.id === editingFieldId ? null : field.id
                        )
                      }
                    >
                      {editingFieldId === field.id ? (
                        <Save size={16} />
                      ) : (
                        <Edit size={16} />
                      )}
                    </ControlButton>
                    <ControlButton
                      variant="danger"
                      onClick={() => removeFormField(field.id)}
                    >
                      <Trash2 size={16} />
                    </ControlButton>
                  </FormFieldActions>
                </FormFieldHeader>

                {editingFieldId === field.id && (
                  <FormFieldGrid>
                    <FieldGroup>
                      <Label>Tipo Campo</Label>
                      <Select
                        value={field.type}
                        onChange={(e) =>
                          updateFormField(field.id, {
                            type: e.target.value as FormField["type"],
                          })
                        }
                      >
                        <option value="text">Testo</option>
                        <option value="email">Email</option>
                        <option value="tel">Telefono</option>
                        <option value="textarea">Area di Testo</option>
                        <option value="select">Menu a Discesa</option>
                        <option value="checkbox">Checkbox</option>
                      </Select>
                    </FieldGroup>

                    <FieldGroup>
                      <Label>Etichetta</Label>
                      <Input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateFormField(field.id, { label: e.target.value })
                        }
                      />
                    </FieldGroup>

                    <FieldGroup>
                      <Label>Nome Campo</Label>
                      <Input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          updateFormField(field.id, { name: e.target.value })
                        }
                      />
                    </FieldGroup>

                    <FieldGroup>
                      <Label>Placeholder</Label>
                      <Input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) =>
                          updateFormField(field.id, {
                            placeholder: e.target.value,
                          })
                        }
                      />
                    </FieldGroup>

                    <FieldGroup style={{ gridColumn: "1 / -1" }}>
                      <Toggle>
                        <ToggleInput
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            updateFormField(field.id, {
                              required: e.target.checked,
                            })
                          }
                        />
                        <span>Campo obbligatorio</span>
                      </Toggle>
                    </FieldGroup>
                  </FormFieldGrid>
                )}
              </FormFieldItem>
            ))}

            {(!content.formFields || content.formFields.length === 0) && (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                <p>Nessun campo configurato</p>
                <p style={{ fontSize: "14px" }}>
                  Clicca su "Aggiungi Campo" per iniziare
                </p>
              </div>
            )}
          </FormFieldsContainer>
        </FieldGroup>

        <FieldGroup>
          <Label>Informazioni di Contatto</Label>
          <ContactInfoContainer>
            <ContactInfoItem>
              <ContactIcon>
                <Phone size={16} />
              </ContactIcon>
              <Input
                type="tel"
                value={content.contactInfo?.phone || ""}
                onChange={(e) => updateContactInfo("phone", e.target.value)}
                placeholder="Numero di telefono"
              />
            </ContactInfoItem>

            <ContactInfoItem>
              <ContactIcon>
                <Mail size={16} />
              </ContactIcon>
              <Input
                type="email"
                value={content.contactInfo?.email || ""}
                onChange={(e) => updateContactInfo("email", e.target.value)}
                placeholder="Indirizzo email"
              />
            </ContactInfoItem>

            <ContactInfoItem>
              <ContactIcon>
                <MapPin size={16} />
              </ContactIcon>
              <Input
                type="text"
                value={content.contactInfo?.address || ""}
                onChange={(e) => updateContactInfo("address", e.target.value)}
                placeholder="Indirizzo"
              />
            </ContactInfoItem>

            <FieldGroup>
              <Label>Orari di Apertura</Label>
              <Textarea
                value={content.contactInfo?.workingHours || ""}
                onChange={(e) =>
                  updateContactInfo("workingHours", e.target.value)
                }
                placeholder="Lun-Ven: 9:00-18:00&#10;Sab: 9:00-13:00&#10;Dom: Chiuso"
              />
            </FieldGroup>
          </ContactInfoContainer>
        </FieldGroup>

        <FieldGroup>
          <Label>Mappa</Label>
          <Toggle>
            <ToggleInput
              type="checkbox"
              checked={content.showMap || false}
              onChange={(e) => updateField("showMap", e.target.checked)}
            />
            <span>Mostra mappa</span>
          </Toggle>

          {content.showMap && (
            <MapContainer>
              <div style={{ marginBottom: "16px" }}>
                <strong>Configurazione Mappa</strong>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <FieldGroup>
                  <Label>Latitudine</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={content.mapLocation?.lat || ""}
                    onChange={(e) =>
                      updateMapLocation("lat", parseFloat(e.target.value))
                    }
                    placeholder="40.7128"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label>Longitudine</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={content.mapLocation?.lng || ""}
                    onChange={(e) =>
                      updateMapLocation("lng", parseFloat(e.target.value))
                    }
                    placeholder="-74.0060"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label>Zoom</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={content.mapLocation?.zoom || 15}
                    onChange={(e) =>
                      updateMapLocation("zoom", parseInt(e.target.value))
                    }
                  />
                </FieldGroup>
              </div>
            </MapContainer>
          )}
        </FieldGroup>
      </EditorContent>
    </EditorContainer>
  );
};

export default ContactEditor;
