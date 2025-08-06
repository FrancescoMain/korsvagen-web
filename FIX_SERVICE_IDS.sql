-- ⚡ FIX SERVICE IDS - Risolve problema ID mismatch
-- Aggiorna gli ID dei servizi per matchare quelli che il frontend si aspetta

-- Fix ID del servizio Progettazione
UPDATE services 
SET id = 'dc501d91-2c07-4da6-b5d5-e50e8531edad'::uuid
WHERE title = 'Progettazione' 
AND id = 'dc501d91-2c07-4da6-b5d5-e50e8531edac'::uuid;

-- Verifica il fix
SELECT id, title, display_order 
FROM services 
WHERE title = 'Progettazione';

-- Lista tutti i servizi con i loro ID aggiornati
SELECT id, title, subtitle, is_active, display_order
FROM services 
ORDER BY display_order;

SELECT 'SUCCESS: Service ID updated for Progettazione' as result;