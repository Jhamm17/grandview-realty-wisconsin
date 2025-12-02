-- Check for duplicate or old Chris Clark entries
-- This will help identify why the old entry isn't showing

-- Check all agents with chris-clark slug or similar names
SELECT 
  id,
  slug,
  name,
  email,
  is_active,
  sort_order,
  created_at,
  updated_at
FROM agents
WHERE slug = 'chris-clark' 
   OR name ILIKE '%chris%clark%'
   OR email ILIKE '%chris%clark%'
ORDER BY created_at DESC;

-- Check the specific old entry
SELECT 
  id,
  slug,
  name,
  email,
  is_active,
  sort_order,
  created_at,
  updated_at
FROM agents
WHERE id = '3360af37-1ec2-45d7-922b-4fd3f8b7a43b';

-- If the old entry has a different slug or is inactive, we can either:
-- 1. Delete it if it's a duplicate
-- 2. Update it to match the new entry
-- 3. Make it active if it's inactive

