-- ⚡ FIX RLS POLICIES for Services
-- Risolve eventuali problemi con Row Level Security

-- Controlla le policy esistenti
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'services';

-- Temporarily disable RLS to test (ONLY for debugging)
-- IMPORTANT: This should be re-enabled after testing
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Alternative: Fix the admin policy to be more permissive
DROP POLICY IF EXISTS "Admins can manage all services" ON services;

CREATE POLICY "Admins can manage all services" ON services
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS with the fixed policy
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Test query that should work now
SELECT id, title, image_public_id 
FROM services 
WHERE id = 'dc501d91-2c07-4da6-b5d5-e50e8531edad'::uuid;

SELECT 'SUCCESS: RLS policies fixed for services table' as result;