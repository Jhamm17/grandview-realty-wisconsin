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

-- Insert a default admin user (replace with your email and password)
-- You'll need to hash the password first using bcrypt
-- INSERT INTO admin_users (email, password_hash, role) VALUES ('your-email@example.com', 'hashed_password_here', 'admin');

-- Enable Row Level Security (RLS)
ALTER TABLE property_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for property_cache table
-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to property_cache" ON property_cache
  FOR SELECT USING (true);

-- Allow insert/update/delete for authenticated users (you might want to restrict this further)
CREATE POLICY "Allow write access to property_cache" ON property_cache
  FOR ALL USING (true);

-- Create policies for admin_users table
-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to admin_users" ON admin_users
  FOR SELECT USING (true);

-- Allow insert/update/delete for authenticated users (you might want to restrict this further)
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

-- Insert sample data for agents
INSERT INTO agents (slug, name, title, image_url, logo_url, phone, email, specialties, experience, service_area, description, sort_order) VALUES
('christopher-lobrillo', 'Christopher Lobrillo', 'Managing Broker & Managing Partner', '/agents/christopher-lobrillo.png', '/agents/chris-lobrillo-logo.png', '630-802-4411', 'chris@grandviewsells.com', ARRAY['Buyers', 'Sellers', 'Investors', 'REO', 'Corporate'], '20+ years', 'Chicago and Surrounding Suburbs', 'Christopher Lobrillo brings over 20 years of experience in the real estate industry and serves as Owner and Managing Broker of Grandview Realty. He is actively involved in guiding the firm''s growth, operations, and agent mentorship programs. Before co-founding Grandview Realty, Christopher was a partner on the top-performing real estate team in Kane County, Illinois, under the RE/MAX brand. Over the course of his career, he has successfully closed more than 3,700 transactions, covering residential, REO, and corporate properties. Known for his strategic insight and hands-on leadership, Christopher is passionate about business development and supporting agents as they build thriving careers.', 1),
('lynda-werner', 'Lynda Werner', 'Operations Manager | Licensed Real Estate Agent', '/agents/lynda-werner.png', '/agents/lynda-werner-logo.png', '630-402-6382', 'lynda@grandviewsells.com', ARRAY['Buyers', 'Sellers', 'Operations', 'REO'], '20+ years', 'Chicago and Surrounding Suburbs', 'With over 20 years of experience in the real estate industry, Lynda Werner brings a wealth of knowledge and operational expertise to her role as Operations Manager at Grandview Realty. Her diverse background spans real estate collections, foreclosure, bankruptcy, REO management, and mortgage auditing—providing her with a comprehensive understanding of the industry from every angle. At Grandview Realty, Lynda oversees the administrative and support staff, ensuring smooth day-to-day operations and seamless service for agents and clients alike. She is deeply committed to fostering professional growth and encouraging continuous development among team members.', 2),
('chris-clark', 'Chris Clark', 'Managing Broker', '/agents/chris-clark.png', '/agents/chris-clark-logo.png', '630-973-7825', 'chris.clark@grandviewsells.com', ARRAY['Buyers', 'Sellers', 'Investors'], '20+ years', 'Chicagoland and West Suburbs', 'Chris Clark launched his real estate career in 2003, and is passionate about helping people achieve their real estate goals by leveraging data, technology and wow service to create raving fans and customers for life. In April, 2021, Chris partnered with Grandview Realty as their Sales Manager to drive growth in the brokerage by increasing transactions, adding agents and growing his personal real estate business under the Clark Home Team banner.', 3),
('randall-glenn', 'Randall Glenn', 'Agent', '/agents/randall-glenn.png', '/agents/randall-glenn-logo.png', '312-752-7415', 'randall@grandviewsells.com', ARRAY['Sellers', 'Investors'], NULL, 'Chicago and South Suburbs', 'Randall works primarily in the Chicagoland area, and he is extremely diligent to consistently provide his clients with the utmost transparency, professionalism, and respect.', 4),
('yolanda-weathers', 'Yolanda Weathers', 'Agent', '/agents/yolanda-weathers.png', '/agents/yolanda-weathers-logo.png', '773-817-6829', 'yolanda@grandviewsells.com', ARRAY['Buyers', 'Sellers', 'Investors'], '10+ years', 'Chicago and West Suburbs', 'Yolanda has been working in real estate for over 10 years. She is diligent and hardworking and willing to do what''s necessary to get the job done. She can work with first-time buyers and sellers, investors, renters, landlords, etc. Whether it''s residential, investment or commercial – she is the one for the job!', 5),
('laura-cook', 'Laura Cook-Horlbeck', 'Agent', '/agents/laura-cook.png', '/agents/laura-cook-logo.png', '630-235-4791', 'laura@grandviewsells.com', ARRAY['Buyers', 'Sellers'], NULL, 'Chicago and West Suburbs', 'My enthusiasm for real estate, my professional approach and my drive to always exceed expectations is something you will appreciate as we work together. I take pride in my attention to detail, communication, and negotiation skills, ensuring my clients a smooth process throughout the entire transaction, from listing to closing!', 6),
('elias-mondragon', 'Elias Mondragon', 'Agent', '/agents/elias-mondragon.png', '/agents/elias-mondragon-logo.png', '630-538-2383', 'elias@grandviewsells.com', ARRAY['Buyers', 'Sellers', 'Investors'], NULL, 'Chicago and surrounding suburbs', 'In today''s digitally driven world, personalized attention is often hard to come by. That''s why I''m committed to bringing back the art of genuine service: driven by loyalty, honesty, and authenticity. I have a strong desire to go above and beyond what is expected. Whether you''re navigating the complexities of buying or selling, I''m here to ensure a seamless, stress-free experience.', 7),
('david-rodriguez', 'David Rodriguez', 'Agent', '/agents/david-rodriguez.png', '/agents/david-rodriguez-logo.png', '630-461-7263', 'david@grandviewsells.com', ARRAY['Buyers', 'Sellers', 'Investors'], NULL, 'Chicago and surrounding suburbs', 'With boundless enthusiasm and a steadfast commitment to putting my client''s best interests first, I am a bilingual real estate agent fluent in Spanish, ensuring a seamless experience for buyers, sellers, and investors alike. I approach each transaction with unwavering determination, leveraging my linguistic skills and market expertise to navigate the complexities of real estate transactions. Whether it''s finding the perfect home, negotiating the best deal, or securing a satisfactory closing, I am here to guide you every step of the way. So, what''s your next move? Let''s make it happen together.', 8),
('steve-zidek', 'Steve Zidek', 'Agent', '/agents/stephen-zidek.png', '/agents/stephen-zidek-logo.png', '630-212-0064', 'zideksteve1@gmail.com', ARRAY['Buyers', 'Sellers', 'Investors'], NULL, 'Chicago and Surrounding suburbs', 'Steve is an experienced Real Estate Broker and Certified Residential Appraiser. With an in depth value perspective, he works tirelessly to make sure your best interests are protected and your equity position is always preserved. Steve treats every transaction as if it were his own and considers communication to be one of the most important aspects of his role through all phases of your successful real estate transaction.', 9),
('alberto-monarrez', 'Alberto Monarrez', 'Agent', '/agents/alberto-monarrez.png', '/agents/alberto-monarrez-logo.png', '773-742-6728', 'alberto9804@gmail.com', ARRAY['Buyers', 'Sellers', 'Investors'], '20+ years', 'Chicago and surrounding suburbs', 'Alberto, family man with over 20 + years of experience in the real estate industry, now member of Grandview Realty Family. Ready to help represent buyers and sellers, as well as investors. Alberto holds a General Contractor License and specializes in Residential Development and Renovation. He has the ability to examine real estate transactions in detail from a financial and practical perspective and design creative solutions for clients. Alberto is committed and passionate about Real Estate, he is ready to assist in every step of buying, selling and be part of your next Real Estate adventure.', 10),
('jim-karner', 'Jim Karner', 'Agent', '/agents/jim-karner.png', '/agents/jim-karner-logo.png', '630-220-2107', 'jimkarnerteam@gmail.com', ARRAY['Buyers', 'Sellers', 'Family'], NULL, 'Chicago and Surrounding Suburbs', 'With a rich background in the financial services industry, Jim brings a wealth of expertise to the real estate market. Transitioning seamlessly into a realtor role, Jim combines financial acumen with a passion for helping all of his clients. Whether it''s finding their dream homes or guiding his clients through the selling process, Jim''s thoroughness and care are unmatched. As a dedicated family man with a wife and four children, Jim understands the importance of finding the perfect home for every family''s unique needs. With Jim as your realtor, you can trust in his commitment to finding the ideal property for you and your loved ones.', 11),
('shaun-israel', 'Shaun Israel', 'Agent', '/agents/shaun-israel.png', '/agents/shaun-israel-logo.png', '312-882-0110', 'shaunisrael@icloud.com', ARRAY['Buyers', 'Renters'], NULL, 'Chicago and West Suburbs', 'Specializing in helping buyers and renters find their perfect home, Shaun brings a fresh perspective and dedicated approach to real estate. With a focus on exceptional customer service and attention to detail, he ensures every client receives personalized guidance throughout their home search journey. Shaun''s commitment to understanding his clients'' unique needs and preferences makes him an invaluable partner in finding the right property.', 12),
('katherine-alderfer', 'Katherine Alderfer', 'Agent', '/agents/katherine-alderfer.png', '/agents/katherine-alderfer-logo.png', '630-216-9178', 'katherine@homesbykalderfer.com', ARRAY['Buyers', 'Sellers', 'Family'], NULL, 'Chicagoland and Suburbs', 'With a contagious smile that instantly puts clients at ease, Katherine brings a unique blend of warmth and professionalism to the world of real estate. Her genuine care for people and passion for helping others find their dream homes make her an invaluable asset to the Grandview Realty team.', 13),
('adam-turner', 'Adam Turner', 'Agent', '/agents/adam-turner.jpeg', '/agents/adam-turner-logo.png', '224-325-5871', 'eaglefreedomrealestate@outlook.com', ARRAY['Buyers', 'Sellers', 'Investors'], 'Newly Licensed', 'Chicagoland and Suburbs', 'Newly licensed realtor and excited to begin a new career! Real estate has always been a passion of mine and I can''t think of a better industry to work in. My entire work experience has been centered around customer service. I will continue to apply the skills I learned over the years to assist buyers/sellers in the real estate market, putting my client''s needs first and doing my best to ensure a smooth and transparent process.', 14),
('sam-tousi', 'Sam Tousi', 'Agent', '/agents/sam-tousi.png', '/agents/sam-tousi-logo.png', '847-962-8400', 'samtousi@hotmail.com', ARRAY['Buyers', 'Sellers', 'Investors'], '25+ years', 'North and Northwest Suburbs', 'With over 25 years of experience as a licensed real estate broker and more than 40 years of familiarity with the North and Northwest suburbs, Sam Tousi brings unmatched local expertise and industry knowledge. He specializes in residential, commercial, investment, and new construction properties, providing clients with reliable guidance and proven results.', 15)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample data for office staff
INSERT INTO office_staff (name, title, image_url, phone, email, responsibilities, experience, description, sort_order) VALUES
('Christopher Lobrillo', 'Managing Broker & Managing Partner', '/agents/chris-lobrillo-logo.png', '630-802-4411', 'chris@grandviewsells.com', ARRAY['Business Growth & Development', 'Agent Mentorship & Development', 'Brokerage Oversight & Compliance', 'REO Specialist', 'Corporate Closings'], '20+ years', 'Christopher Lobrillo is Co-Founder and Owner of Grandview Realty, bringing over 20 years of experience and more than 3,700 closed transactions across residential, REO, and corporate real estate. A former partner on Kane County''s top RE/MAX team, he now leads Grandview''s growth, operations, and agent development. Known for his strategic vision and hands-on leadership, Christopher is committed to building a high-performing, agent-focused brokerage.', 1),
('Lynda Werner', 'Operations Manager | Licensed Real Estate Agent', '/agents/lynda-werner-logo.png', '630-402-6382', 'lynda@grandviewsells.com', ARRAY['Real Estate Operations', 'Administrative Oversight', 'Real Estate Compliance', 'REO Management', 'Agent Support and Development', 'Office Management'], '20+ years', 'With over 20 years in real estate, Lynda Werner serves as Operations Manager at Grandview Realty, where she brings deep expertise in collections, foreclosure, REO, and mortgage auditing. She leads the administrative team, ensuring smooth operations and top-tier support for agents and clients. A licensed real estate agent herself, Lynda bridges operations with front-line insight, all while fostering growth and development across the team.', 2),
('Christopher Clark', 'Managing Broker', '/agents/chris-clark.png', '630-973-7825', 'chris@clarkhometeam.com', ARRAY['Agent Leadership & Support', 'Compliance & Contract Oversight', 'Training & Mentorship', 'Business Development', 'Recruiting & Retention'], '20+ years', 'Chris Clark, Managing Broker at Grandview Realty, has been a driving force in the firm''s growth since joining in 2021. With a real estate career dating back to 2003, Chris leads expansion efforts through agent development, strategic planning, and production under his Clark Home Team brand. Known for blending market expertise with tech and high-touch service, his leadership and vision continue to elevate the entire organization.', 3),
('Michael Jostes', 'Transaction Coordinator', '/michaeljostes.png', '630-402-6462', 'michael@grandviewsells.com', ARRAY['Transaction Management', 'Documentation', 'Closing Support', 'MLS & CRM Updates', 'File Organization & Audit Prep'], '1+ years', 'Michael ensures all transactions progress seamlessly from contract to close. As our dedicated Transaction Coordinator, he manages timelines, coordinates with all parties involved, and ensures every document is accurate and submitted on time. His deep knowledge of real estate processes and attention to detail are invaluable to keeping our deals on track and our clients well-supported throughout every step.', 4),
('Cailida Werner', 'Senior Transaction Coordinator', '/cailidawerner.jpeg', '630-480-4347', 'cailida@grandviewsells.com', ARRAY['Transaction Management', 'Documentation', 'Closing Support', 'MLS & CRM Updates', 'File Organization & Audit Prep'], '6+ years', 'Cailida is our Senior Transaction Coordinator and has been an integral part of our team for over six years. With a sharp eye for detail and a deep understanding of the real estate process, she oversees each transaction from start to finish—ensuring nothing falls through the cracks. Her experience allows her to anticipate potential issues before they arise, keeping everything on track and our clients informed every step of the way. Her dedication and expertise make her a true backbone of our operations.', 5),
('Anastasiya Voznyuk', 'Listing Coordinator & Social Media Manager', '/anastasiyavoznyuk.png', '630-402-6285', 'anastasiya@grandviewsells.com', ARRAY['MLS Data Entry & Verification', 'Detailed Audits & Compliance', 'Reporting: Feedback, Scrubs, Pricing, MLS Data Reports', 'Designing and Producing Marketing Material'], '4+ years', 'Anastasiya brings four years of experience in real estate, combining her background in transaction coordination with her expertise in managing the listing process. She ensures exceptional accuracy and compliance across all platforms, overseeing listing preparation and audits with great attention to detail. Additionally, Anastasiya leads creative digital marketing initiatives, producing engaging content that boosts brand visibility and drives meaningful lead engagement.', 6)
ON CONFLICT DO NOTHING; 