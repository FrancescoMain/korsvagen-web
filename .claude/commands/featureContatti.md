# Claude Code - Sistema Contatti e Gestione Messaggi

## Obiettivo del Progetto

Implementare un sistema completo di contatti con:

1. **Centralino Emergenze**: Sticky button animato sulla home con modal emergenze
2. **Sezione Contatti**: Integrazione backend per form contatti esistente
3. **Dashboard Messaggi**: Gestione centralizzata di tutti i messaggi ricevuti
4. **Database**: Schema completo per messaggi normali ed emergenze

## Analisi Funzionale

### 1. Centralino Emergenze (Homepage)

**Comportamento animato:**

- Sticky button bottom-right con animazione fluida
- Fase 1: "Centralino Emergenze" (2 secondi)
- Fase 2: Transizione a button rotondo con "!"
- Click → Modal emergenze con form dedicato
- Colore rosso prominent e ben visibile

### 2. Sezione Contatti Esistente

**Integrazione backend:**

- Analizza form contatti statico esistente
- Integra API per invio messaggi
- Gestione stati loading/success/error
- Validazioni frontend e backend

### 3. Dashboard Gestione Messaggi

**Posizione:** Home dashboard (sotto/sopra analytics)
**Funzionalità:**

- Lista messaggi (normali + emergenze)
- Filtri per tipo, stato, data
- Dettaglio messaggio con azioni
- Gestione stati (nuovo, letto, risposto, chiuso)
- Priorità emergenze evidenziate

## Task di Implementazione

### 1. Database Schema (SQL per Supabase)

#### Tabella `contact_messages`

```sql
-- Messaggi di contatto (normali + emergenze)
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL DEFAULT 'contact', -- 'contact' | 'emergency'

  -- Dati mittente
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),

  -- Contenuto messaggio
  subject VARCHAR(255), -- Solo per contatti normali
  message TEXT NOT NULL,

  -- Gestione stato
  status VARCHAR(20) DEFAULT 'new', -- new, read, replied, closed
  priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, emergency

  -- Metadati
  source VARCHAR(50) DEFAULT 'website', -- website, emergency_button
  user_agent TEXT,
  ip_address INET,

  -- Gestione admin
  assigned_to VARCHAR(255), -- Email admin assegnato
  admin_notes TEXT,
  replied_at TIMESTAMP,

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_messages_type_status ON contact_messages(type, status, created_at DESC);
CREATE INDEX idx_messages_priority ON contact_messages(priority, created_at DESC);
CREATE INDEX idx_messages_email ON contact_messages(email);
CREATE INDEX idx_messages_phone ON contact_messages(phone);
CREATE INDEX idx_messages_assigned ON contact_messages(assigned_to, status);

-- Trigger updated_at
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Tabella `message_attachments` (opzionale)

```sql
-- Allegati ai messaggi (per future estensioni)
CREATE TABLE message_attachments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES contact_messages(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_public_id VARCHAR(255), -- Cloudinary
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### Seed Data e Configurazioni

```sql
-- Inserimento dati di esempio per testing
INSERT INTO contact_messages (type, first_name, email, phone, message, priority, source) VALUES
(
  'emergency',
  'Mario',
  'mario.rossi@example.com',
  '+39 333 123 4567',
  'Perdita d''acqua urgente nel seminterrato, serve intervento immediato',
  'emergency',
  'emergency_button'
),
(
  'contact',
  'Giulia',
  'giulia.bianchi@example.com',
  '+39 334 987 6543',
  'Vorrei ricevere un preventivo per ristrutturazione bagno',
  'normal',
  'website'
);

-- View per statistiche rapide
CREATE VIEW message_stats AS
SELECT
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE type = 'emergency') as emergency_count,
  COUNT(*) FILTER (WHERE status = 'new') as new_count,
  COUNT(*) FILTER (WHERE status = 'new' AND type = 'emergency') as new_emergency_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count
FROM contact_messages;
```

### 2. Backend API - Endpoints

#### API Pubbliche (Frontend)

```javascript
// POST /api/contact - Invio messaggio contatti normale
// POST /api/emergency - Invio messaggio emergenza
// GET /api/contact/info - Info contatti (telefono, email, orari)
```

#### API Admin (Dashboard)

```javascript
// GET /api/admin/messages - Lista messaggi con filtri
// GET /api/admin/messages/stats - Statistiche messaggi
// GET /api/admin/messages/:id - Dettaglio messaggio
// PUT /api/admin/messages/:id/status - Aggiorna stato messaggio
// PUT /api/admin/messages/:id/assign - Assegna messaggio ad admin
// POST /api/admin/messages/:id/reply - Risposta via email
// DELETE /api/admin/messages/:id - Elimina messaggio
```

### 3. Backend Implementation

#### Controller Messaggi Pubblici

```javascript
const sendContactMessage = async (req, res) => {
  const { first_name, last_name, email, phone, company, subject, message } =
    req.body;

  // Validazione base
  if (!first_name || !email || !message) {
    return res.status(400).json({
      error: "Nome, email e messaggio sono obbligatori",
    });
  }

  // Verifica rate limiting (opzionale)
  // await checkRateLimit(req.ip, email);

  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        type: "contact",
        first_name,
        last_name,
        email,
        phone,
        company,
        subject,
        message,
        priority: "normal",
        source: "website",
        user_agent: req.headers["user-agent"],
        ip_address: req.ip,
      })
      .select()
      .single();

    if (error) {
      console.error("Errore inserimento messaggio:", error);
      return res.status(500).json({ error: "Errore invio messaggio" });
    }

    // Invia notifica email ad admin (opzionale)
    // await sendAdminNotification('contact', data);

    res.status(201).json({
      message: "Messaggio inviato con successo",
      id: data.id,
    });
  } catch (error) {
    console.error("Errore server:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

const sendEmergencyMessage = async (req, res) => {
  const { first_name, email, phone, message } = req.body;

  // Validazione emergenza (più rigorosa)
  if (!first_name || !phone || !message) {
    return res.status(400).json({
      error: "Nome, telefono e descrizione emergenza sono obbligatori",
    });
  }

  // Validazione formato telefono
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: "Formato telefono non valido",
    });
  }

  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        type: "emergency",
        first_name,
        email,
        phone,
        message,
        subject: "EMERGENZA - Richiesta immediata",
        priority: "emergency",
        source: "emergency_button",
        user_agent: req.headers["user-agent"],
        ip_address: req.ip,
      })
      .select()
      .single();

    if (error) {
      console.error("Errore inserimento emergenza:", error);
      return res
        .status(500)
        .json({ error: "Errore invio richiesta emergenza" });
    }

    // Notifica immediata per emergenze
    // await sendUrgentNotification('emergency', data);

    res.status(201).json({
      message: "Richiesta emergenza inviata. Ti richiameremo entro 24h",
      id: data.id,
    });
  } catch (error) {
    console.error("Errore emergenza:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
```

#### Controller Admin

```javascript
const getAdminMessages = async (req, res) => {
  const {
    type,
    status,
    priority,
    assigned_to,
    page = 1,
    limit = 20,
    search,
  } = req.query;

  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  // Filtri
  if (type) query = query.eq("type", type);
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (assigned_to) query = query.eq("assigned_to", assigned_to);

  // Search in nome, email, messaggio
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`
    );
  }

  // Paginazione
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

const getMessageStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("message_stats")
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Errore recupero statistiche" });
  }
};

const updateMessageStatus = async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  const validStatuses = ["new", "read", "replied", "closed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status non valido" });
  }

  const updateData = { status };
  if (admin_notes) updateData.admin_notes = admin_notes;
  if (status === "replied") updateData.replied_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("contact_messages")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

const assignMessage = async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  const { data, error } = await supabase
    .from("contact_messages")
    .update({ assigned_to })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};
```

### 4. Frontend - Centralino Emergenze (Homepage)

#### Sticky Button Animato

```jsx
const EmergencyButton = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Dopo 2 secondi contrae il button
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="emergency-button-container">
        <button
          className={`emergency-button ${
            isExpanded ? "expanded" : "collapsed"
          }`}
          onClick={() => setShowModal(true)}
          aria-label="Centralino Emergenze"
        >
          <span className="emergency-icon">!</span>
          <span className="emergency-text">Centralino Emergenze</span>
        </button>
      </div>

      {showModal && <EmergencyModal onClose={() => setShowModal(false)} />}
    </>
  );
};
```

#### CSS Animazioni

```css
.emergency-button-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.emergency-button {
  background: #dc2626; /* Rosso emergenza */
  color: white;
  border: none;
  box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(0);
  border-radius: 50px;
  min-width: 60px;
  min-height: 60px;
  justify-content: center;
}

.emergency-button.expanded {
  border-radius: 50px;
  padding: 16px 24px;
  animation: slideInFromRight 0.6s ease-out;
}

.emergency-button.collapsed {
  border-radius: 50%;
  padding: 16px;
  width: 60px;
  height: 60px;
  animation: contractButton 0.6s ease-in-out;
}

.emergency-button.collapsed .emergency-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: all 0.4s ease-in-out;
}

.emergency-button.expanded .emergency-text {
  opacity: 1;
  width: auto;
  transition: all 0.4s ease-in-out 0.2s;
}

.emergency-icon {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  min-width: 24px;
}

.emergency-button:hover {
  background: #b91c1c;
  transform: scale(1.05);
  box-shadow: 0 6px 25px rgba(220, 38, 38, 0.6);
}

.emergency-button:active {
  transform: scale(0.95);
}

@keyframes slideInFromRight {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes contractButton {
  0% {
    border-radius: 50px;
    padding: 16px 24px;
  }
  100% {
    border-radius: 50%;
    padding: 16px;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .emergency-button-container {
    bottom: 20px;
    right: 20px;
  }

  .emergency-button {
    font-size: 14px;
    padding: 12px 20px;
  }

  .emergency-button.collapsed {
    width: 50px;
    height: 50px;
    padding: 12px;
  }
}
```

#### Modal Emergenza

```jsx
const EmergencyModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Nome obbligatorio";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefono obbligatorio";
    } else if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phone)) {
      newErrors.phone = "Formato telefono non valido";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Descrizione emergenza obbligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        // Chiudi modal dopo 3 secondi
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || "Errore invio richiesta" });
      }
    } catch (error) {
      setErrors({ submit: "Errore di connessione" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content emergency-success"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="success-icon">✓</div>
          <h3>Richiesta Inviata!</h3>
          <p>Ti richiameremo entro 24 ore per gestire la tua emergenza.</p>
          <p className="success-note">
            Mantieni il telefono acceso e disponibile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content emergency-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>🚨 Centralino Emergenze</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="emergency-form">
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              placeholder="Il tuo nome"
              className={errors.first_name ? "error" : ""}
            />
            {errors.first_name && (
              <span className="error-text">{errors.first_name}</span>
            )}
          </div>

          <div className="form-group">
            <label>Telefono *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+39 333 123 4567"
              className={errors.phone ? "error" : ""}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Email (opzionale)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="tua@email.com"
            />
          </div>

          <div className="form-group">
            <label>Descrizione Emergenza *</label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Descrivi brevemente la situazione di emergenza..."
              rows={4}
              className={errors.message ? "error" : ""}
            />
            {errors.message && (
              <span className="error-text">{errors.message}</span>
            )}
          </div>

          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <div className="form-footer">
            <p className="callback-info">📞 Ti richiameremo entro 24 ore</p>

            <div className="form-actions">
              <button type="button" onClick={onClose} disabled={loading}>
                Annulla
              </button>
              <button
                type="submit"
                className="emergency-submit"
                disabled={loading}
              >
                {loading ? "Invio..." : "Invia Richiesta"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### 5. Frontend - Sezione Contatti

#### Analisi e Integrazione Form Esistente

```jsx
const ContactSection = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Mantieni il design esistente, aggiungi solo la logica
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateContactForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          company: "",
          subject: "",
          message: "",
        });

        // Reset success dopo 5 secondi
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || "Errore invio messaggio" });
      }
    } catch (error) {
      setErrors({ submit: "Errore di connessione" });
    } finally {
      setLoading(false);
    }
  };

  const validateContactForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = "Nome obbligatorio";
    if (!formData.email.trim()) newErrors.email = "Email obbligatoria";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email non valida";
    }
    if (!formData.message.trim()) newErrors.message = "Messaggio obbligatorio";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="contact-section">
      {/* Mantieni layout esistente */}
      {success && (
        <div className="success-banner">
          ✓ Messaggio inviato con successo! Ti risponderemo presto.
        </div>
      )}

      <form onSubmit={handleSubmit} className="contact-form">
        {/* Utilizza la struttura esistente del form, 
            aggiungendo solo value, onChange e validazioni */}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Invio in corso..." : "Invia Messaggio"}
        </button>

        {errors.submit && <div className="error-message">{errors.submit}</div>}
      </form>
    </div>
  );
};
```

### 6. Dashboard - Gestione Messaggi

#### Widget Dashboard Home

```jsx
const MessagesWidget = () => {
  const [stats, setStats] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentMessages();
  }, []);

  return (
    <div className="messages-widget">
      <div className="widget-header">
        <h3>📧 Gestione Messaggi</h3>
        <button onClick={() => navigate("/admin/messages")}>Vedi Tutti</button>
      </div>

      {/* Statistiche Rapide */}
      {stats && (
        <div className="message-stats">
          <div className="stat-card emergency">
            <span className="stat-number">{stats.new_emergency_count}</span>
            <span className="stat-label">Emergenze Nuove</span>
          </div>
          <div className="stat-card new">
            <span className="stat-number">{stats.new_count}</span>
            <span className="stat-label">Messaggi Nuovi</span>
          </div>
          <div className="stat-card today">
            <span className="stat-number">{stats.today_count}</span>
            <span className="stat-label">Oggi</span>
          </div>
          <div className="stat-card total">
            <span className="stat-number">{stats.total_messages}</span>
            <span className="stat-label">Totali</span>
          </div>
        </div>
      )}

      {/* Messaggi Recenti */}
      <div className="recent-messages">
        <h4>Messaggi Recenti</h4>
        {recentMessages.length > 0 ? (
          <div className="messages-list">
            {recentMessages.map((message) => (
              <MessagePreviewCard key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <p className="no-messages">Nessun messaggio recente</p>
        )}
      </div>
    </div>
  );
};
```

#### Pagina Completa Gestione Messaggi

```jsx
const MessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [filters, setFilters] = useState({
    type: "all", // all, contact, emergency
    status: "all", // all, new, read, replied, closed
    priority: "all", // all, emergency, high, normal, low
    search: "",
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <div className="messages-management">
      <div className="page-header">
        <h1>Gestione Messaggi e Contatti</h1>
        <div className="header-actions">
          <button onClick={markAllAsRead}>Segna tutti come letti</button>
          <button onClick={exportMessages}>Esporta CSV</button>
        </div>
      </div>

      {/* Filtri */}
      <div className="filters-bar">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">Tutti i tipi</option>
          <option value="emergency">🚨 Emergenze</option>
          <option value="contact">📧 Contatti</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">Tutti gli stati</option>
          <option value="new">Nuovi</option>
          <option value="read">Letti</option>
          <option value="replied">Risposti</option>
          <option value="closed">Chiusi</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="all">Tutte le priorità</option>
          <option value="emergency">🚨 Emergenza</option>
          <option value="high">Alta</option>
          <option value="normal">Normale</option>
          <option value="low">Bassa</option>
        </select>

        <input
          type="search"
          placeholder="Cerca per nome, email, messaggio..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Lista Messaggi */}
      <div className="messages-list-container">
        {loading ? (
          <div className="loading">Caricamento messaggi...</div>
        ) : (
          <div className="messages-grid">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onClick={() => setSelectedMessage(message)}
                onStatusChange={handleStatusChange}
                onAssign={handleAssign}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dettaglio Messaggio */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onUpdate={handleMessageUpdate}
        />
      )}
    </div>
  );
};
```

#### Card Messaggio

```jsx
const MessageCard = ({ message, onClick, onStatusChange, onAssign }) => {
  const getTypeIcon = (type) => {
    return type === "emergency" ? "🚨" : "📧";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      emergency: "#DC2626",
      high: "#EA580C",
      normal: "#059669",
      low: "#6B7280",
    };
    return colors[priority] || "#6B7280";
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "#3B82F6",
      read: "#F59E0B",
      replied: "#10B981",
      closed: "#6B7280",
    };
    return colors[status] || "#6B7280";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("it-IT");
  };

  return (
    <div
      className={`message-card ${message.status} ${message.type}`}
      onClick={onClick}
    >
      <div className="message-header">
        <div className="message-type">
          <span className="type-icon">{getTypeIcon(message.type)}</span>
          <span className="type-text">
            {message.type === "emergency" ? "Emergenza" : "Contatto"}
          </span>
        </div>

        <div className="message-priority">
          <span
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(message.priority) }}
          >
            {message.priority}
          </span>
        </div>
      </div>

      <div className="message-content">
        <div className="sender-info">
          <h4>
            {message.first_name} {message.last_name}
          </h4>
          <p className="contact-info">
            <span className="email">{message.email}</span>
            {message.phone && <span className="phone">{message.phone}</span>}
          </p>
        </div>

        {message.subject && (
          <h5 className="message-subject">{message.subject}</h5>
        )}

        <p className="message-preview">
          {message.message.substring(0, 150)}
          {message.message.length > 150 && "..."}
        </p>
      </div>

      <div className="message-footer">
        <div className="message-meta">
          <span className="date">{formatDate(message.created_at)}</span>
          <span className="source">via {message.source}</span>
        </div>

        <div className="message-actions" onClick={(e) => e.stopPropagation()}>
          <select
            value={message.status}
            onChange={(e) => onStatusChange(message.id, e.target.value)}
            style={{ borderColor: getStatusColor(message.status) }}
          >
            <option value="new">Nuovo</option>
            <option value="read">Letto</option>
            <option value="replied">Risposto</option>
            <option value="closed">Chiuso</option>
          </select>

          {message.assigned_to && (
            <span className="assigned-to">👤 {message.assigned_to}</span>
          )}
        </div>
      </div>
    </div>
  );
};
```

#### Modal Dettaglio Messaggio

```jsx
const MessageDetailModal = ({ message, onClose, onUpdate }) => {
  const [status, setStatus] = useState(message.status);
  const [adminNotes, setAdminNotes] = useState(message.admin_notes || "");
  const [assignedTo, setAssignedTo] = useState(message.assigned_to || "");
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleSaveNotes = async () => {
    try {
      const response = await fetch(`/api/admin/messages/${message.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      });

      if (response.ok) {
        onUpdate();
        alert("Note salvate con successo");
      }
    } catch (error) {
      alert("Errore salvataggio note");
    }
  };

  const handleAssign = async () => {
    try {
      const response = await fetch(`/api/admin/messages/${message.id}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: assignedTo }),
      });

      if (response.ok) {
        onUpdate();
        alert("Messaggio assegnato con successo");
      }
    } catch (error) {
      alert("Errore assegnazione messaggio");
    }
  };

  const handleSendReply = async () => {
    try {
      const response = await fetch(`/api/admin/messages/${message.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_text: replyText }),
      });

      if (response.ok) {
        setShowReplyForm(false);
        setReplyText("");
        setStatus("replied");
        onUpdate();
        alert("Risposta inviata con successo");
      }
    } catch (error) {
      alert("Errore invio risposta");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content message-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="message-type-header">
            <span className="type-icon">
              {message.type === "emergency" ? "🚨" : "📧"}
            </span>
            <h3>
              {message.type === "emergency"
                ? "Emergenza"
                : "Messaggio di Contatto"}
            </h3>
            <span className={`priority-badge ${message.priority}`}>
              {message.priority}
            </span>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Informazioni Mittente */}
          <section className="sender-section">
            <h4>Informazioni Mittente</h4>
            <div className="sender-details">
              <div className="detail-item">
                <strong>Nome:</strong> {message.first_name} {message.last_name}
              </div>
              <div className="detail-item">
                <strong>Email:</strong>
                <a href={`mailto:${message.email}`}>{message.email}</a>
              </div>
              {message.phone && (
                <div className="detail-item">
                  <strong>Telefono:</strong>
                  <a href={`tel:${message.phone}`}>{message.phone}</a>
                </div>
              )}
              {message.company && (
                <div className="detail-item">
                  <strong>Azienda:</strong> {message.company}
                </div>
              )}
              <div className="detail-item">
                <strong>Data:</strong>{" "}
                {new Date(message.created_at).toLocaleString("it-IT")}
              </div>
              <div className="detail-item">
                <strong>Origine:</strong> {message.source}
              </div>
            </div>
          </section>

          {/* Contenuto Messaggio */}
          <section className="message-content-section">
            {message.subject && (
              <div className="message-subject">
                <h4>Oggetto</h4>
                <p>{message.subject}</p>
              </div>
            )}

            <div className="message-text">
              <h4>Messaggio</h4>
              <div className="message-body">
                {message.message.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          </section>

          {/* Gestione Messaggio */}
          <section className="management-section">
            <h4>Gestione Messaggio</h4>

            <div className="management-row">
              <div className="form-group">
                <label>Stato</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="new">Nuovo</option>
                  <option value="read">Letto</option>
                  <option value="replied">Risposto</option>
                  <option value="closed">Chiuso</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assegna a</label>
                <input
                  type="email"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="email@admin.com"
                />
                <button onClick={handleAssign}>Assegna</button>
              </div>
            </div>

            <div className="form-group">
              <label>Note Amministrative</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Aggiungi note interne..."
                rows={3}
              />
            </div>

            <button onClick={handleSaveNotes} className="save-notes-btn">
              Salva Note e Stato
            </button>
          </section>

          {/* Risposta Email */}
          <section className="reply-section">
            <h4>Risposta</h4>

            {!showReplyForm ? (
              <button
                onClick={() => setShowReplyForm(true)}
                className="reply-button"
              >
                📧 Rispondi via Email
              </button>
            ) : (
              <div className="reply-form">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Scrivi la tua risposta..."
                  rows={5}
                />
                <div className="reply-actions">
                  <button onClick={() => setShowReplyForm(false)}>
                    Annulla
                  </button>
                  <button
                    onClick={handleSendReply}
                    className="send-reply-btn"
                    disabled={!replyText.trim()}
                  >
                    Invia Risposta
                  </button>
                </div>
              </div>
            )}

            {message.replied_at && (
              <div className="reply-info">
                <p className="replied-date">
                  ✅ Risposto il{" "}
                  {new Date(message.replied_at).toLocaleString("it-IT")}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
```

### 7. CSS Styling

#### Styling Componenti Dashboard

```css
/* Messages Widget */
.messages-widget {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.widget-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 20px;
}

.message-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid;
}

.stat-card.emergency {
  border-left-color: #dc2626;
}
.stat-card.new {
  border-left-color: #3b82f6;
}
.stat-card.today {
  border-left-color: #10b981;
}
.stat-card.total {
  border-left-color: #6b7280;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* Message Cards */
.messages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.message-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.message-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.message-card.emergency {
  border-left: 4px solid #dc2626;
}

.message-card.new {
  background: #fef3f2;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.message-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.priority-badge {
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.sender-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #1f2937;
}

.contact-info {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  gap: 16px;
}

.message-subject {
  margin: 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.message-preview {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
  margin: 8px 0;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.message-meta {
  font-size: 12px;
  color: #9ca3af;
}

.message-actions select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
}

/* Modal Styling */
.emergency-modal {
  max-width: 500px;
  width: 90vw;
}

.emergency-form .form-group {
  margin-bottom: 20px;
}

.emergency-form label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
}

.emergency-form input,
.emergency-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.emergency-form input.error,
.emergency-form textarea.error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.callback-info {
  background: #fef3c7;
  color: #92400e;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14px;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.emergency-submit {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.emergency-submit:hover {
  background: #b91c1c;
}

.emergency-submit:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Success States */
.emergency-success {
  text-align: center;
  padding: 40px;
}

.success-icon {
  font-size: 48px;
  color: #10b981;
  margin-bottom: 16px;
}

.success-note {
  color: #059669;
  font-weight: 500;
  margin-top: 8px;
}

.success-banner {
  background: #d1fae5;
  color: #065f46;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #a7f3d0;
}

/* Responsive */
@media (max-width: 768px) {
  .messages-grid {
    grid-template-columns: 1fr;
  }

  .message-card {
    padding: 16px;
  }

  .emergency-modal {
    margin: 20px;
    max-width: none;
  }

  .contact-info {
    flex-direction: column;
    gap: 4px;
  }
}
```

### 8. Implementazione Step-by-Step

#### Fase 1: Database e Backend (1-2 giorni)

1. **Creazione schema Supabase** (manuale come richiesto)
2. **Implementazione API endpoints** (pubblici e admin)
3. **Testing API con Postman/tools**
4. **Configurazione CORS e validazioni**

#### Fase 2: Centralino Emergenze (1 giorno)

1. **Sticky button animato homepage**
2. **Modal emergenza con form**
3. **CSS animazioni fluide**
4. **Testing responsive e accessibilità**

#### Fase 3: Sezione Contatti (0.5 giorni)

1. **Analisi form esistente**
2. **Integrazione API contatti**
3. **Stati loading/success/error**
4. **Testing form completo**

#### Fase 4: Dashboard Messaggi (1-2 giorni)

1. **Widget dashboard home**
2. **Pagina gestione completa**
3. **Modal dettaglio messaggio**
4. **Filtri e ricerca**

#### Fase 5: Testing e Refinement (0.5 giorni)

1. **Testing end-to-end completo**
2. **Ottimizzazioni performance**
3. **Fix bug e polish UI**
4. **Documentazione utilizzo**

### 9. Note Implementative Importanti

#### Sicurezza

- **Rate limiting** per prevenire spam
- **Validazione rigorosa** input utente
- **Sanitizzazione** dati prima del salvataggio
- **CAPTCHA** opzionale per form pubblici

#### Performance

- **Paginazione** messaggi in dashboard
- **Lazy loading** lista messaggi
- **Debounce** per ricerca
- **Caching** statistiche dashboard

#### Accessibilità

- **Screen reader friendly**
- **Keyboard navigation** completa
- **Focus management** nei modal
- **Color contrast** appropriato

#### SEO e Analytics

- **Meta tags** sezione contatti
- **Structured data** informazioni contatto
- **Google Analytics** tracking form submissions
- **Error tracking** per debugging

Inizia implementando il database schema e gli endpoint API, poi procedi con il centralino emergenze che è la feature più visibile e impattante per gli utenti.
