-- 🔧 ESEGUI QUESTO SQL PER SISTEMARE LE RLS POLICIES

-- Rimuovi le policy problematiche esistenti
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team member skills" ON team_member_skills;

-- Crea policy più permissive per gli admin autenticati
-- Per team_members: permetti tutto agli utenti autenticati
CREATE POLICY "Authenticated users can manage team members" ON team_members
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Per team_member_skills: permetti tutto agli utenti autenticati  
CREATE POLICY "Authenticated users can manage team member skills" ON team_member_skills
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- Verifica che le policy siano attive
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('team_members', 'team_member_skills')
ORDER BY tablename, policyname;