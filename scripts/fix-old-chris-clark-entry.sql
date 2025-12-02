-- Fix the old Chris Clark entry (ID: 3360af37-1ec2-45d7-922b-4fd3f8b7a43b)
-- This script will update the old entry to match the new data and remove duplicates

-- First, check what the old entry looks like
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

-- Check for any duplicates with slug 'chris-clark'
SELECT 
  id,
  slug,
  name,
  email,
  is_active,
  sort_order
FROM agents
WHERE slug = 'chris-clark'
ORDER BY created_at;

-- Update the old entry to match the new data
-- This preserves the old ID but updates all the fields
UPDATE agents
SET 
  slug = 'chris-clark',
  name = 'Chris Clark',
  title = 'Managing Broker',
  image_url = 'https://xbojbreklgfhwhkodkma.supabase.co/storage/v1/object/public/images/1762461218849-4v20eup72ho.jpg',
  logo_url = '/agents/chris-clark-logo.png',
  phone = '630-973-7825',
  email = 'chris.clark@grandviewsells.com',
  specialties = ARRAY['Buyers', 'Sellers', 'Investors'],
  experience = '20+ years',
  service_area = 'Chicagoland and West Suburbs',
  description = 'Chris Clark launched his real estate career in 2003, and is passionate about helping people achieve their real estate goals by leveraging data, technology and wow service.',
  is_active = true,
  sort_order = 3,
  updated_at = NOW()
WHERE id = '3360af37-1ec2-45d7-922b-4fd3f8b7a43b';

-- Delete any duplicate entries with slug 'chris-clark' except the one we just updated
-- This keeps only the old entry (now updated) and removes any new duplicates
DELETE FROM agents 
WHERE slug = 'chris-clark' 
  AND id != '3360af37-1ec2-45d7-922b-4fd3f8b7a43b';

-- Verify the result - should only show one entry now
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
WHERE slug = 'chris-clark';

