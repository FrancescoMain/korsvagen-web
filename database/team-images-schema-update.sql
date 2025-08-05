-- TEAM IMAGES SCHEMA UPDATE
-- Aggiorna la tabella team_members per supportare le immagini profilo

-- Aggiungi campi per gestione immagini (se non già presenti)
DO $$ 
BEGIN
    -- Verifica se il campo image_public_id esiste già
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'image_public_id'
    ) THEN
        ALTER TABLE team_members ADD COLUMN image_public_id VARCHAR(255) NULL;
        COMMENT ON COLUMN team_members.image_public_id IS 'Public ID Cloudinary per gestione eliminazione immagine';
    END IF;

    -- Verifica se il campo image_upload_date esiste già
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' 
        AND column_name = 'image_upload_date'
    ) THEN
        ALTER TABLE team_members ADD COLUMN image_upload_date TIMESTAMPTZ NULL;
        COMMENT ON COLUMN team_members.image_upload_date IS 'Data caricamento immagine profilo';
    END IF;
END $$;

-- Aggiorna i commenti sui campi esistenti
COMMENT ON COLUMN team_members.profile_image_url IS 'URL Cloudinary dell''immagine profilo del membro';

-- Crea indice per performance su ricerche per immagine
CREATE INDEX IF NOT EXISTS idx_team_members_with_image 
ON team_members(profile_image_url) 
WHERE profile_image_url IS NOT NULL;

-- Aggiorna la vista team_members_complete per includere info immagine
DROP VIEW IF EXISTS team_members_complete;

CREATE VIEW team_members_complete AS
SELECT 
    tm.*,
    COALESCE(
        json_agg(
            tms.skill_name ORDER BY tms.display_order
        ) FILTER (WHERE tms.skill_name IS NOT NULL), 
        '[]'::json
    ) as skills,
    cu.username as created_by_username,
    uu.username as updated_by_username,
    -- Info aggiuntive per immagini
    CASE WHEN tm.profile_image_url IS NOT NULL THEN true ELSE false END as has_image
FROM team_members tm
LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
LEFT JOIN admin_users cu ON tm.created_by = cu.id
LEFT JOIN admin_users uu ON tm.updated_by = uu.id
GROUP BY tm.id, cu.username, uu.username;

-- Log dell'aggiornamento
INSERT INTO admin_logs (action, details, created_at) 
VALUES (
    'schema_update', 
    'Aggiornamento schema team_members per supporto immagini profilo', 
    NOW()
) ON CONFLICT DO NOTHING;

-- Messaggio di completamento
DO $$ 
BEGIN
    RAISE NOTICE '✅ Schema team_members aggiornato per supporto immagini profilo';
    RAISE NOTICE '📋 Campi aggiunti: image_public_id, image_upload_date';
    RAISE NOTICE '🔍 Vista team_members_complete aggiornata';
    RAISE NOTICE '⚡ Indice per performance creato';
END $$;