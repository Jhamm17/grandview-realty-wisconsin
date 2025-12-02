-- =====================================================
-- SAFE SUPABASE SECURITY SETUP SCRIPT
-- This script adds security WITHOUT destroying existing setup
-- =====================================================

-- 1. ENABLE ROW LEVEL SECURITY ON TABLES (if not already enabled)
-- This is safe - it won't break existing functionality
ALTER TABLE property_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_images ENABLE ROW LEVEL SECURITY;

-- 2. CREATE SECURE POLICIES (only if they don't exist)
-- These are additive - they won't break existing policies

-- Property Cache Policies
DO $$
BEGIN
    -- Only create if policy doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'property_cache' 
        AND policyname = 'Public read access to all properties'
    ) THEN
        CREATE POLICY "Public read access to all properties" ON property_cache
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'property_cache' 
        AND policyname = 'Service role can manage properties'
    ) THEN
        CREATE POLICY "Service role can manage properties" ON property_cache
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Admin Users Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_users' 
        AND policyname = 'Service role can manage admin users'
    ) THEN
        CREATE POLICY "Service role can manage admin users" ON admin_users
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Instagram Posts Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'instagram_posts' 
        AND policyname = 'Public read access to active posts'
    ) THEN
        CREATE POLICY "Public read access to active posts" ON instagram_posts
            FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'instagram_posts' 
        AND policyname = 'Service role can manage posts'
    ) THEN
        CREATE POLICY "Service role can manage posts" ON instagram_posts
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Agent Cache Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'agent_cache' 
        AND policyname = 'Public read access to agent cache'
    ) THEN
        CREATE POLICY "Public read access to agent cache" ON agent_cache
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'agent_cache' 
        AND policyname = 'Service role can manage agent cache'
    ) THEN
        CREATE POLICY "Service role can manage agent cache" ON agent_cache
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Agents Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'agents' 
        AND policyname = 'Public read access to active agents'
    ) THEN
        CREATE POLICY "Public read access to active agents" ON agents
            FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'agents' 
        AND policyname = 'Service role can manage agents'
    ) THEN
        CREATE POLICY "Service role can manage agents" ON agents
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Office Staff Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'office_staff' 
        AND policyname = 'Public read access to active staff'
    ) THEN
        CREATE POLICY "Public read access to active staff" ON office_staff
            FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'office_staff' 
        AND policyname = 'Service role can manage staff'
    ) THEN
        CREATE POLICY "Service role can manage staff" ON office_staff
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Careers Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'careers' 
        AND policyname = 'Public read access to active careers'
    ) THEN
        CREATE POLICY "Public read access to active careers" ON careers
            FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'careers' 
        AND policyname = 'Service role can manage careers'
    ) THEN
        CREATE POLICY "Service role can manage careers" ON careers
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Cached Images Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'cached_images' 
        AND policyname = 'Public read access to cached images'
    ) THEN
        CREATE POLICY "Public read access to cached images" ON cached_images
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'cached_images' 
        AND policyname = 'Service role can manage cached images'
    ) THEN
        CREATE POLICY "Service role can manage cached images" ON cached_images
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- 3. CREATE HELPER FUNCTIONS (safe to create or replace)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE AUDIT LOG TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log (only service role can access)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_log' 
        AND policyname = 'Service role can access audit logs'
    ) THEN
        CREATE POLICY "Service role can access audit logs" ON audit_log
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- 5. VERIFICATION QUERIES
-- Check that RLS is enabled on all tables
SELECT 
  'RLS Status Check' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('property_cache', 'admin_users', 'instagram_posts', 'agent_cache', 'agents', 'office_staff', 'careers', 'cached_images', 'audit_log')
ORDER BY tablename;

-- Check that policies exist
SELECT 
  'Policy Check' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Display success message
SELECT 'Safe security setup completed successfully!' as status;
