-- Update Christopher Lobrillo and Lynda Werner to use their logos as headshots
-- This script updates the agents table in Supabase to set their logo images as their main profile images

-- Update Christopher Lobrillo's profile
UPDATE agents 
SET image_url = '/agents/chris-lobrillo-logo.png'
WHERE slug = 'christopher-lobrillo' 
   OR name ILIKE '%Christopher Lobrillo%'
   OR email = 'chris@grandviewsells.com';

-- Update Lynda Werner's profile  
UPDATE agents 
SET image_url = '/agents/lynda-werner-logo.png'
WHERE slug = 'lynda-werner' 
   OR name ILIKE '%Lynda Werner%'
   OR email = 'lynda@grandviewsells.com';

-- Verify the updates
SELECT id, name, slug, image_url, logo_url, email 
FROM agents 
WHERE name ILIKE '%Christopher Lobrillo%' 
   OR name ILIKE '%Lynda Werner%'
   OR email IN ('chris@grandviewsells.com', 'lynda@grandviewsells.com')
ORDER BY name; 