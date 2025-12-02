-- Insert Office Staff Data for Grandview Realty Wisconsin
-- This script inserts office staff members and makes the table publicly accessible

-- First, ensure the table exists (from supabase-wisconsin-setup.sql)
-- CREATE TABLE IF NOT EXISTS office_staff (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   title VARCHAR(255) NOT NULL,
--   image_url VARCHAR(500),
--   phone VARCHAR(50),
--   email VARCHAR(255),
--   responsibilities TEXT[],
--   experience VARCHAR(100),
--   description TEXT,
--   is_active BOOLEAN DEFAULT true,
--   sort_order INTEGER DEFAULT 0,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM office_staff;

-- Insert office staff members (IDs will be auto-generated)
INSERT INTO office_staff (
  name, 
  title, 
  image_url, 
  phone, 
  email, 
  responsibilities, 
  experience, 
  description, 
  is_active, 
  sort_order
) VALUES
(
  'Anthony Lobrillo',
  'Intake Specialist',
  'https://xbojbreklgfhwhkodkma.supabase.co/storage/v1/object/public/images/1761162577526-ldna480ctc.png',
  '630-423-7989',
  'anthony@grandviewells.com',
  ARRAY['Real Estate Compliance', 'Real Estate Operations', 'Documentation'],
  '2+ Months',
  'Anthony is a detail-oriented Intake Specialist beginning his career in real estate administration. At Grandview Realty, he manages the intake process for new listings, assists with property documentation, and helps ensure accurate MLS submissions. He brings a process-driven approach and strong organizational skills to support agents and keep operations running smoothly.',
  true,
  7
),
(
  'Christopher Lobrillo',
  'Managing Broker & Managing Partner',
  'https://xbojbreklgfhwhkodkma.supabase.co/storage/v1/object/public/images/1762294532566-z2jgde56t1k.jpg',
  '630-802-4411',
  'chris@grandviewsells.com',
  ARRAY['Business Growth & Development', 'Agent Mentorship & Development', 'Brokerage Oversight & Compliance', 'REO Specialist', 'Corporate Closings'],
  '20+ years',
  'Chris Lobrillo is a results-driven real estate executive with over 20 years of experience in brokerage operations, business development, and distressed asset sales. As Partner at Grandview Realty LLC since 2017, he has led multi-state expansion, daily operations, and community engagement. Nationally recognized for excellence in corporate-owned, short sale, and investor-owned property sales, Chris is known for building high-performing teams and executing scalable solutions for complex transactions.',
  true,
  1
),
(
  'Anastasiya Voznyuk',
  'Listing Coordinator & Social Media Manager',
  'https://xbojbreklgfhwhkodkma.supabase.co/storage/v1/object/public/images/1762885332986-k6j1k9fveyg.jpg',
  '630-402-6285',
  'anastasiya@grandviewsells.com',
  ARRAY['MLS Data Entry & Verification', 'Detailed Audits & Compliance', 'Reporting: Feedback, Scrubs, Pricing, MLS Data Reports', 'Designing and Producing Marketing Material'],
  '4+ years',
  'Anastasiya brings four years of experience in real estate, combining her background in transaction coordination with her expertise in managing the listing process. She ensures exceptional accuracy and compliance across all platforms, overseeing listing preparation and audits with great attention to detail. Additionally, Anastasiya leads creative digital marketing initiatives, producing engaging content that boosts brand visibility and drives meaningful lead engagement.',
  true,
  6
),
(
  'Michael Jostes',
  'Transaction Coordinator',
  'https://xbojbreklgfhwhkodkma.supabase.co/storage/v1/object/public/images/1762885367843-qccxvvs27c.jpg',
  '630-402-6462',
  'michael@grandviewsells.com',
  ARRAY['Transaction Management', 'Documentation', 'Closing Support', 'MLS & CRM Updates', 'File Organization & Audit Prep'],
  '1+ years',
  'Michael ensures all transactions progress seamlessly from contract to close. As our dedicated Transaction Coordinator, he manages timelines, coordinates with all parties involved, and ensures every document is accurate and submitted on time. His deep knowledge of real estate processes and attention to detail are invaluable to keeping our deals on track and our clients well-supported throughout every step.',
  true,
  4
),
(
  'Cailida Werner',
  'Senior Transaction Coordinator',
  'https://xbojbreklgfhwhkodkma.supabase.co/storage/v1/object/public/images/1762885351614-3cdmqfg7b7y.jpg',
  '630-480-4347',
  'cailida@grandviewsells.com',
  ARRAY['Transaction Management', 'Documentation', 'Closing Support', 'MLS & CRM Updates', 'File Organization & Audit Prep'],
  '6+ years',
  'Cailida is our Senior Transaction Coordinator and has been an integral part of our team for over six years. With a sharp eye for detail and a deep understanding of the real estate process, she oversees each transaction from start to finish—ensuring nothing falls through the cracks. Her experience allows her to anticipate potential issues before they arise, keeping everything on track and our clients informed every step of the way. Her dedication and expertise make her a true backbone of our operations.',
  true,
  5
),
(
  'Lynda Werner',
  'Operations Manager | Licensed Real Estate Agent',
  'https://xbojbreklgfhwhkodkma.supabase.co/storage/v1/object/public/images/1762366983492-jk5kill46do.jpg',
  '630-402-6382',
  'lynda@grandviewsells.com',
  ARRAY['Real Estate Operations', 'Administrative Oversight', 'Real Estate Compliance', 'REO Management', 'Agent Support and Development', 'Office Management'],
  '20+ years',
  'With over 20 years in real estate, Lynda Werner serves as Operations Manager at Grandview Realty, where she brings deep expertise in collections, foreclosure, REO, and mortgage auditing. She leads the administrative team, ensuring smooth operations and top-tier support for agents and clients. A licensed real estate agent herself, Lynda bridges operations with front-line insight, all while fostering growth and development across the team.',
  true,
  2
),
(
  'Christopher Clark',
  'Managing Broker',
  'https://xbojbreklgfhwhkodkma.supabase.co/storage/v1/object/public/images/1762366995507-xf9ird0q81.jpg',
  '630-973-7825',
  'chris@clarkhometeam.com',
  ARRAY['Agent Leadership & Support', 'Compliance & Contract Oversight', 'Training & Mentorship', 'Business Development', 'Recruiting & Retention'],
  '20+ years',
  'Chris Clark, Managing Broker at Grandview Realty, has been a driving force in the firm''s growth since joining in 2021. With a real estate career dating back to 2003, Chris leads expansion efforts through agent development, strategic planning, and production under his Clark Home Team brand. Known for blending market expertise with tech and high-touch service, his leadership and vision continue to elevate the entire organization.',
  true,
  3
)
ON CONFLICT DO NOTHING;

-- Make office_staff table publicly accessible
-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow public read access to office staff" ON office_staff;
DROP POLICY IF EXISTS "Allow service role to manage office staff" ON office_staff;
DROP POLICY IF EXISTS "Allow authenticated users to read office staff" ON office_staff;

-- Create policy to allow public read access to active office staff
CREATE POLICY "Allow public read access to active office staff" ON office_staff
  FOR SELECT 
  USING (is_active = true);

-- Create policy to allow public read access to all office staff (if you want to show inactive too)
-- Uncomment the line below if you want to show inactive staff members publicly
-- CREATE POLICY "Allow public read access to all office staff" ON office_staff
--   FOR SELECT 
--   USING (true);

-- Create policy to allow service role to manage all office staff (for admin operations)
CREATE POLICY "Allow service role to manage office staff" ON office_staff
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
WHERE tablename = 'office_staff';

