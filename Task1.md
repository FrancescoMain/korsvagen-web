# Task 7: Editor Contenuti per Sezioni Dinamiche

## Obiettivo

Implementare l'editor visuale per la modifica dei contenuti delle sezioni con drag&drop, upload media e preview in tempo reale.

## Azioni specifiche

0. **Analizzare documentazione precedente**

   - Analizzare la documentazione nella cartella /docs
   - Analizzare log nella cartella /logs

1. **Editor Modulare per Sezioni**

   - Editor per Hero Section (titolo, sottotitolo, CTA, immagine)
   - Editor per About Section (testo, immagini multiple, layout)
   - Editor per Gallery Section (upload multiplo, organizzazione)
   - Editor per Contact Section (form fields, mappa, info)

2. **Drag & Drop Interface**

   - Riordinamento sezioni con drag&drop
   - Preview live delle modifiche
   - Pulsanti Add/Remove sezioni
   - Duplicazione sezioni esistenti

3. **Media Management**
   - Upload drag&drop con Cloudinary
   - Gallery picker per media esistenti
   - Crop e resize tool integrato
   - Alt text e SEO metadata per immagini

## Struttura Editor Components

```
src/components/Editor/
├── PageEditor/
│   ├── PageEditor.jsx           // Container principale
│   ├── SectionsList.jsx         // Lista sezioni drag&drop
│   ├── SectionEditor.jsx        // Editor per singola sezione
│   └── PreviewPanel.jsx         // Preview in tempo reale
├── SectionTypes/
│   ├── HeroEditor.jsx           // Editor sezione hero
│   ├── AboutEditor.jsx          // Editor sezione about
│   ├── GalleryEditor.jsx        // Editor gallery
│   ├── ContactEditor.jsx        // Editor contatti
│   └── CustomEditor.jsx         // Editor generico
├── MediaLibrary/
│   ├── MediaPicker.jsx          // Picker media esistenti
│   ├── MediaUpload.jsx          // Upload con drag&drop
│   ├── ImageCropper.jsx         // Tool di crop
│   └── MediaGrid.jsx            // Grid visualizzazione
└── UI/
    ├── RichTextEditor.jsx       // Editor testo ricco
    ├── ColorPicker.jsx          // Picker colori
    ├── IconPicker.jsx           // Picker icone
    └── FormBuilder.jsx          // Builder form dinamici
```

## Rich Text Editor Features

```javascript
// Toolbar configurabile
const editorConfig = {
  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "underline",
    "|",
    "link",
    "bulletedList",
    "numberedList",
    "|",
    "alignment",
    "blockQuote",
    "|",
    "imageUpload",
    "mediaEmbed",
    "|",
    "undo",
    "redo",
  ],
  image: {
    toolbar: [
      "imageStyle:full",
      "imageStyle:side",
      "|",
      "imageTextAlternative",
    ],
  },
};
```

## Section Editor Interface

```javascript
const HeroEditor = ({ section, onChange }) => {
  return (
    <div className="section-editor">
      <div className="editor-header">
        <h3>Hero Section</h3>
        <div className="section-controls">
          <button onClick={duplicateSection}>Duplica</button>
          <button onClick={deleteSection}>Elimina</button>
          <toggle checked={section.isActive} onChange={toggleActive} />
        </div>
      </div>

      <div className="editor-content">
        <div className="field-group">
          <label>Titolo Principale</label>
          <RichTextEditor
            value={section.content.title}
            onChange={(value) => updateField("title", value)}
          />
        </div>

        <div className="field-group">
          <label>Immagine di Sfondo</label>
          <MediaPicker
            value={section.content.backgroundImage}
            onChange={(media) => updateField("backgroundImage", media)}
            accept="image/*"
          />
        </div>

        <div className="field-group">
          <label>Call to Action</label>
          <Input
            value={section.content.ctaText}
            onChange={(e) => updateField("ctaText", e.target.value)}
            placeholder="Es: Scopri di più"
          />
        </div>
      </div>
    </div>
  );
};
```

## Deliverables

- [ ] Editor modulare per tutti i tipi di sezione
- [ ] Drag&drop per riordinamento sezioni
- [ ] Rich text editor integrato
- [ ] Media picker con Cloudinary
- [ ] Upload drag&drop funzionante
- [ ] Preview live delle modifiche
- [ ] Auto-save delle modifiche
- [ ] Validazione form real-time

## Dependencies da aggiungere

```json
{
  "@dnd-kit/core": "^6.0.8",
  "@dnd-kit/sortable": "^7.0.2",
  "@dnd-kit/utilities": "^3.2.1",
  "react-quill": "^2.0.0",
  "react-dropzone": "^14.2.3",
  "react-image-crop": "^10.1.8",
  "react-color": "^2.19.3",
  "debounce": "^1.2.1"
}
```

## Auto-save Implementation

```javascript
const useAutoSave = (data, saveFunction, delay = 2000) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const debouncedSave = useMemo(
    () =>
      debounce(async (dataToSave) => {
        setIsSaving(true);
        try {
          await saveFunction(dataToSave);
          setLastSaved(new Date());
        } catch (error) {
          toast.error("Errore nel salvataggio");
        } finally {
          setIsSaving(false);
        }
      }, delay),
    [saveFunction, delay]
  );

  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);

  return { isSaving, lastSaved };
};
```

## Section Types Configuration

```javascript
const sectionTypes = {
  hero: {
    name: "Hero Section",
    icon: "🎯",
    fields: ["title", "subtitle", "backgroundImage", "ctaText", "ctaLink"],
    component: HeroEditor,
  },
  about: {
    name: "About Section",
    icon: "📝",
    fields: ["title", "content", "images", "layout"],
    component: AboutEditor,
  },
  gallery: {
    name: "Gallery",
    icon: "🖼️",
    fields: ["title", "images", "columns", "spacing"],
    component: GalleryEditor,
  },
  contact: {
    name: "Contact Section",
    icon: "📞",
    fields: ["title", "formFields", "contactInfo", "map"],
    component: ContactEditor,
  },
};
```

## Responsive Editor Layout

- Desktop: Editor + Preview side by side
- Tablet: Tabs tra Editor e Preview
- Mobile: Full screen editor con preview drawer

## Criteri di completamento

- Tutti i tipi di sezione editabili
- Drag&drop funzionante per riordinamento
- Upload media integrato con Cloudinary
- Auto-save operativo
- Preview real-time accurato
- Validazione form completa
- Performance ottimizzate per editing

## Log Requirements

Creare file `logs/task-07-content-editor.md` con:

- Timestamp di inizio/fine
- Editor components implementati
- Test drag&drop e upload effettuati
- Performance editing misurate
- Feedback UX raccolti
- Problemi editor risolti
