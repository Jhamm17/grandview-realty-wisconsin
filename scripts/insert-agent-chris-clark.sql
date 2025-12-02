-- Insert Agent Data for Grandview Realty Wisconsin
-- This script inserts Chris Clark agent data and makes the agents table publicly accessible

-- First, ensure the table exists (from supabase-wisconsin-setup.sql)
-- CREATE TABLE IF NOT EXISTS agents (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   slug VARCHAR(255) UNIQUE NOT NULL,
--   name VARCHAR(255) NOT NULL,
--   title VARCHAR(255) NOT NULL,
--   image_url VARCHAR(500),
--   logo_url VARCHAR(500),
--   phone VARCHAR(50),
--   email VARCHAR(255),
--   specialties TEXT[],
--   experience VARCHAR(100),
--   service_area VARCHAR(255),
--   description TEXT,
--   is_active BOOLEAN DEFAULT true,
--   sort_order INTEGER DEFAULT 0,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Insert Chris Clark agent (ID will be auto-generated)
INSERT INTO agents (
  slug,
  name,
  title,
  image_url,
  logo_url,
  phone,
  email,
  specialties,
  experience,
  service_area,
  description,
  is_active,
  sort_order
) VALUES (
  'chris-clark',
  'Chris Clark',
  'Managing Broker',
  'https://xbojbreklgfhwhkodkma.supabase.co/storage/v1/object/public/images/1762461218849-4v20eup72ho.jpg',
  '/agents/chris-clark-logo.png',
  '630-973-7825',
  'chris.clark@grandviewsells.com',
  ARRAY['Buyers', 'Sellers', 'Investors'],
  '20+ years',
  'Chicagoland and West Suburbs',
  'Chris Clark launched his real estate career in 2003, and is passionate about helping people achieve their real estate goals by leveraging data, technology and wow service.',
  true,
  3
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url,
  logo_url = EXCLUDED.logo_url,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  specialties = EXCLUDED.specialties,
  experience = EXCLUDED.experience,
  service_area = EXCLUDED.service_area,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Make agents table publicly accessible
-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow public read access to active agents" ON agents;
DROP POLICY IF EXISTS "Allow public read access to all agents" ON agents;
DROP POLICY IF EXISTS "Allow service role to manage agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated users to read agents" ON agents;

-- Create policy to allow public read access to active agents
CREATE POLICY "Allow public read access to active agents" ON agents
  FOR SELECT 
  USING (is_active = true);

-- Create policy to allow public read access to all agents (if you want to show inactive too)
-- Uncomment the line below if you want to show inactive agents publicly
-- CREATE POLICY "Allow public read access to all agents" ON agents
--   FOR SELECT 
--   USING (true);

-- Create policy to allow service role to manage all agents (for admin operations)
CREATE POLICY "Allow service role to manage agents" ON agents
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Verify the policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'agents';

