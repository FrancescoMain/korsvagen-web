-- KORSVAGEN WEB APPLICATION - CONTACT MESSAGES SCHEMA
-- 
-- Comprehensive database schema for contact messages and emergency requests
-- Includes support for both normal contact messages and emergency requests
-- 
-- Author: KORSVAGEN S.R.L.
-- Version: 1.0.0

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS message_attachments CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP VIEW IF EXISTS message_stats CASCADE;

-- Main contact messages table (replaces admin_messages for better structure)
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL DEFAULT 'contact', -- 'contact' | 'emergency'

  -- Sender information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),

  -- Message content
  subject VARCHAR(255), -- Optional for emergency messages
  message TEXT NOT NULL,

  -- Status management
  status VARCHAR(20) DEFAULT 'new', -- 'new' | 'read' | 'replied' | 'closed'
  priority VARCHAR(10) DEFAULT 'normal', -- 'low' | 'normal' | 'high' | 'emergency'

  -- Metadata
  source VARCHAR(50) DEFAULT 'website', -- 'website' | 'emergency_button'
  user_agent TEXT,
  ip_address INET,

  -- Admin management
  assigned_to VARCHAR(255), -- Email of assigned admin
  admin_notes TEXT,
  replied_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_type CHECK (type IN ('contact', 'emergency')),
  CONSTRAINT valid_status CHECK (status IN ('new', 'read', 'replied', 'closed')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'emergency')),
  CONSTRAINT valid_source CHECK (source IN ('website', 'emergency_button')),
  CONSTRAINT emergency_phone CHECK (
    type != 'emergency' OR phone IS NOT NULL
  ) -- Emergency messages must have phone
);

-- Message attachments table (for future extensions)
CREATE TABLE message_attachments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_public_id VARCHAR(255), -- Cloudinary public ID
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_contact_messages_type_status ON contact_messages(type, status, created_at DESC);
CREATE INDEX idx_contact_messages_priority ON contact_messages(priority, created_at DESC);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_phone ON contact_messages(phone);
CREATE INDEX idx_contact_messages_assigned ON contact_messages(assigned_to, status);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- View for quick statistics
CREATE VIEW message_stats AS
SELECT
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE type = 'emergency') as emergency_count,
  COUNT(*) FILTER (WHERE type = 'contact') as contact_count,
  COUNT(*) FILTER (WHERE status = 'new') as new_count,
  COUNT(*) FILTER (WHERE status = 'new' AND type = 'emergency') as new_emergency_count,
  COUNT(*) FILTER (WHERE status = 'new' AND type = 'contact') as new_contact_count,
  COUNT(*) FILTER (WHERE status = 'replied') as replied_count,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_count,
  COUNT(*) FILTER (WHERE priority = 'emergency') as priority_emergency_count,
  COUNT(*) FILTER (WHERE priority = 'high') as priority_high_count
FROM contact_messages;

-- Sample data for testing
INSERT INTO contact_messages (
  type, 
  first_name, 
  last_name,
  email, 
  phone, 
  message, 
  priority, 
  source,
  created_at
) VALUES
-- Emergency message example
(
  'emergency',
  'Mario',
  'Rossi',
  'mario.rossi@example.com',
  '+39 333 123 4567',
  'Perdita d''acqua urgente nel seminterrato del cantiere in Via Roma 15. L''acqua sta allagando l''area e rischia di compromettere le fondamenta. Serve intervento immediato!',
  'emergency',
  'emergency_button',
  NOW() - INTERVAL '2 hours'
),
-- Normal contact message example
(
  'contact',
  'Giulia',
  'Bianchi',
  'giulia.bianchi@example.com',
  '+39 334 987 6543',
  'Vorrei ricevere un preventivo dettagliato per la ristrutturazione completa di un bagno di circa 8mq. L''appartamento si trova a Milano zona Brera.',
  'normal',
  'website',
  NOW() - INTERVAL '1 day'
),
-- Another contact message
(
  'contact',
  'Alessandro',
  'Verdi',
  'alessandro.verdi@azienda.com',
  '+39 335 555 1234',
  'Siamo interessati a una collaborazione per la costruzione di un nuovo stabilimento produttivo. Potreste contattarmi per fissare un appuntamento?',
  'high',
  'website',
  NOW() - INTERVAL '3 days'
),
-- Emergency without last name
(
  'emergency',
  'Laura',
  NULL,
  'laura@email.com',
  '+39 340 111 2233',
  'Problema strutturale nel cantiere di Corso Italia. Una trave presenta crepe evidenti. Situazione potenzialmente pericolosa.',
  'emergency',
  'emergency_button',
  NOW() - INTERVAL '5 hours'
);

-- Grant permissions for Supabase
-- Note: These permissions should be configured through Supabase dashboard RLS policies

-- Comment with usage examples
COMMENT ON TABLE contact_messages IS 'Stores all contact messages including normal contacts and emergency requests';
COMMENT ON COLUMN contact_messages.type IS 'Type of message: contact for normal messages, emergency for urgent requests';
COMMENT ON COLUMN contact_messages.priority IS 'Priority level: emergency for critical issues, high for important, normal/low for standard';
COMMENT ON COLUMN contact_messages.source IS 'Origin of the message: website for contact form, emergency_button for emergency widget';
COMMENT ON COLUMN contact_messages.assigned_to IS 'Email of admin user assigned to handle this message';
COMMENT ON VIEW message_stats IS 'Quick statistics view for dashboard widgets';

-- Helpful queries for development/debugging:
-- 1. Get all emergency messages: SELECT * FROM contact_messages WHERE type = 'emergency' ORDER BY created_at DESC;
-- 2. Get unread messages: SELECT * FROM contact_messages WHERE status = 'new' ORDER BY priority DESC, created_at DESC;
-- 3. Get statistics: SELECT * FROM message_stats;
-- 4. Messages by priority: SELECT priority, COUNT(*) FROM contact_messages GROUP BY priority;