-- Execute this in your Supabase SQL editor or via psql
-- Run the projects schema creation

\i database/projects-schema.sql

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('projects', 'project_images', 'project_labels');

-- Check initial data
SELECT COUNT(*) as project_count FROM projects;
SELECT COUNT(*) as label_count FROM project_labels;

-- Test the views
SELECT id, title, label, status, cover_image_url 
FROM projects_with_cover 
LIMIT 5;