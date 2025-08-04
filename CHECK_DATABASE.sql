-- ✅ ESEGUI QUESTO PER VERIFICARE I DATI NEL DATABASE

-- 1. Conta membri nel database
SELECT 'Total members in database:' as info, COUNT(*) as count FROM team_members;

-- 2. Lista tutti i membri con ID reali
SELECT 
    'MEMBER DATA:' as type,
    id, 
    name, 
    role, 
    is_active,
    display_order,
    created_at
FROM team_members 
ORDER BY display_order;

-- 3. Conta skills
SELECT 'Total skills in database:' as info, COUNT(*) as count FROM team_member_skills;

-- 4. Se non ci sono membri, inseriscili
INSERT INTO team_members (name, role, short_description, placeholder, display_order, is_active)
SELECT * FROM (
    VALUES 
    ('Marco Rossi Test', 'CEO', 'Test member', 'MR', 1, true),
    ('Elena Bianchi Test', 'CTO', 'Test member 2', 'EB', 2, true)
) AS new_members(name, role, short_description, placeholder, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM team_members);

-- 5. Verifica finale
SELECT 'FINAL CHECK:' as type, id, name, role FROM team_members ORDER BY display_order;