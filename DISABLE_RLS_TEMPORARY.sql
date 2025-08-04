-- ⚠️ SOLUZIONE TEMPORANEA: Disabilita RLS per permettere agli admin di lavorare
-- ESEGUI QUESTO SE IL FIX DELLE POLICY NON FUNZIONA

-- Disabilita temporaneamente RLS sulle tabelle team
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_skills DISABLE ROW LEVEL SECURITY;

-- Verifica che RLS sia disabilitato
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('team_members', 'team_member_skills');

-- NOTA: Questo è temporaneo per il debugging. 
-- In produzione dovresti abilitare RLS con policy corrette.