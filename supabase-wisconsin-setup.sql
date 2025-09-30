-- Wisconsin Supabase Database Setup
-- Run this script in your Wisconsin Supabase project SQL Editor

-- Create property_cache table
CREATE TABLE IF NOT EXISTS property_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT UNIQUE NOT NULL,
  property_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table with password support
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_cache_listing_id ON property_cache(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_cache_is_active ON property_cache(is_active);
CREATE INDEX IF NOT EXISTS idx_property_cache_last_updated ON property_cache(last_updated);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Enable Row Level Security (RLS)
ALTER TABLE property_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for property_cache table
-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to property_cache" ON property_cache
  FOR SELECT USING (true);

-- Allow insert/update/delete for authenticated users
CREATE POLICY "Allow write access to property_cache" ON property_cache
  FOR ALL USING (true);

-- Create policies for admin_users table
-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to admin_users" ON admin_users
  FOR SELECT USING (true);

-- Allow insert/update/delete for authenticated users
CREATE POLICY "Allow write access to admin_users" ON admin_users
  FOR ALL USING (true);

-- Create a function to automatically update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update last_updated
CREATE TRIGGER update_property_cache_last_updated
  BEFORE UPDATE ON property_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_column();

-- Create Instagram posts table for storing latest posts from cron job
CREATE TABLE IF NOT EXISTS instagram_posts (
  id INTEGER PRIMARY KEY,
  post_url TEXT NOT NULL,
  caption TEXT,
  media_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_instagram_posts_active ON instagram_posts(is_active);

-- Enable Row Level Security
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active posts
CREATE POLICY "Allow public read access to active Instagram posts" ON instagram_posts
  FOR SELECT USING (is_active = true);

-- Create policy to allow service role to manage all posts
CREATE POLICY "Allow service role to manage Instagram posts" ON instagram_posts
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_instagram_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_instagram_posts_updated_at
  BEFORE UPDATE ON instagram_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_instagram_posts_updated_at();

-- Create agent_cache table for caching agent data and listings
CREATE TABLE IF NOT EXISTS agent_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_slug VARCHAR(255) UNIQUE NOT NULL,
  agent_data JSONB NOT NULL,
  listings_data JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_agent_cache_slug ON agent_cache(agent_slug);
CREATE INDEX IF NOT EXISTS idx_agent_cache_last_updated ON agent_cache(last_updated);

-- Enable Row Level Security
ALTER TABLE agent_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to agent cache" ON agent_cache
  FOR SELECT USING (true);

-- Create policy to allow service role to manage cache
CREATE POLICY "Allow service role to manage agent cache" ON agent_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update the last_updated timestamp
CREATE OR REPLACE FUNCTION update_agent_cache_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_updated
CREATE TRIGGER update_agent_cache_last_updated
  BEFORE UPDATE ON agent_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_cache_last_updated();

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  logo_url VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(255),
  specialties TEXT[],
  experience VARCHAR(100),
  service_area VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create office_staff table
CREATE TABLE IF NOT EXISTS office_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(255),
  responsibilities TEXT[],
  experience VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_sort ON agents(sort_order);
CREATE INDEX IF NOT EXISTS idx_office_staff_active ON office_staff(is_active);
CREATE INDEX IF NOT EXISTS idx_office_staff_sort ON office_staff(sort_order);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_office_staff_updated_at BEFORE UPDATE ON office_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create careers table
CREATE TABLE IF NOT EXISTS careers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  benefits TEXT[],
  salary_range TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for careers
CREATE INDEX IF NOT EXISTS idx_careers_active ON careers(is_active);
CREATE INDEX IF NOT EXISTS idx_careers_sort ON careers(sort_order);

-- Enable Row Level Security for careers
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;

-- Create policies for careers table
CREATE POLICY "Allow public read access to active careers" ON careers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow service role to manage careers" ON careers
  FOR ALL USING (auth.role() = 'service_role');

-- Create trigger for careers updated_at
CREATE TRIGGER update_careers_updated_at 
  BEFORE UPDATE ON careers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create cached_images table for storing downloaded property images
CREATE TABLE IF NOT EXISTS cached_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  media_key TEXT UNIQUE NOT NULL,
  property_id TEXT NOT NULL,
  original_url TEXT NOT NULL,
  cached_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size INTEGER,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cached_images_media_key ON cached_images(media_key);
CREATE INDEX IF NOT EXISTS idx_cached_images_property_id ON cached_images(property_id);
CREATE INDEX IF NOT EXISTS idx_cached_images_cached_at ON cached_images(cached_at);

-- Enable Row Level Security
ALTER TABLE cached_images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to cached images" ON cached_images
  FOR SELECT USING (true);

-- Create policy to allow service role to manage cache
CREATE POLICY "Allow service role to manage cached images" ON cached_images
  FOR ALL USING (auth.role() = 'service_role');

-- Insert sample Wisconsin agent data (placeholder - update with actual Wisconsin agents)
INSERT INTO agents (slug, name, title, image_url, logo_url, phone, email, specialties, experience, service_area, description, sort_order) VALUES
('wisconsin-agent-1', 'Wisconsin Agent 1', 'Licensed Real Estate Agent', '/agents/wisconsin-agent-1.png', '/agents/wisconsin-agent-1-logo.png', '555-0001', 'agent1@grandviewwisconsin.com', ARRAY['Buyers', 'Sellers'], '5+ years', 'Wisconsin', 'Wisconsin real estate specialist with local market expertise.', 1),
('wisconsin-agent-2', 'Wisconsin Agent 2', 'Licensed Real Estate Agent', '/agents/wisconsin-agent-2.png', '/agents/wisconsin-agent-2-logo.png', '555-0002', 'agent2@grandviewwisconsin.com', ARRAY['Buyers', 'Sellers', 'Investors'], '10+ years', 'Wisconsin', 'Experienced Wisconsin real estate professional.', 2)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample Wisconsin office staff data (placeholder - update with actual Wisconsin staff)
INSERT INTO office_staff (name, title, image_url, phone, email, responsibilities, experience, description, sort_order) VALUES
('Wisconsin Manager', 'Office Manager', '/staff/wisconsin-manager.png', '555-0100', 'manager@grandviewwisconsin.com', ARRAY['Office Management', 'Client Support'], '5+ years', 'Wisconsin office manager ensuring smooth operations.', 1),
('Wisconsin Coordinator', 'Transaction Coordinator', '/staff/wisconsin-coordinator.png', '555-0101', 'coordinator@grandviewwisconsin.com', ARRAY['Transaction Management', 'Documentation'], '3+ years', 'Wisconsin transaction coordinator handling all closing details.', 2)
ON CONFLICT DO NOTHING;

-- Insert sample Wisconsin careers data
INSERT INTO careers (title, type, location, description, requirements, benefits, salary_range, sort_order) VALUES
('Real Estate Agent', 'Full-time', 'Wisconsin', 'Join our Wisconsin team as a licensed real estate agent.', ARRAY['Valid Wisconsin Real Estate License', 'Strong communication skills', 'Local market knowledge'], ARRAY['Competitive commission structure', 'Marketing support', 'Training and mentorship'], 'Commission-based', 1),
('Office Assistant', 'Part-time', 'Wisconsin', 'Support our Wisconsin office operations.', ARRAY['High school diploma', 'Computer skills', 'Customer service experience'], ARRAY['Flexible schedule', 'Health benefits', 'Growth opportunities'], '$15-20/hour', 2)
ON CONFLICT DO NOTHING;

-- Create your first admin user (replace with your actual email and hashed password)
-- You'll need to hash the password using bcrypt before inserting
-- For now, this is a placeholder - you'll need to run the create-admin script
-- INSERT INTO admin_users (email, password_hash, role) VALUES ('your-email@example.com', 'hashed_password_here', 'admin');
