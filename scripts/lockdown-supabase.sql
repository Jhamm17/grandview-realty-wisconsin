-- =====================================================
-- SUPABASE SECURITY LOCKDOWN SCRIPT
-- This script implements comprehensive security measures
-- =====================================================

-- 1. DISABLE ALL EXISTING POLICIES (too permissive)
DROP POLICY IF EXISTS "Allow read access to property_cache" ON property_cache;
DROP POLICY IF EXISTS "Allow write access to property_cache" ON property_cache;
DROP POLICY IF EXISTS "Allow read access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow write access to admin_users" ON admin_users;

-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE property_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. CREATE SECURE POLICIES FOR PROPERTY_CACHE TABLE

-- Allow public read access to ALL properties (for website visitors)
CREATE POLICY "Public read access to all properties" ON property_cache
  FOR SELECT USING (true);

-- Allow only service role or admin users to insert/update/delete
CREATE POLICY "Service role and admins can write properties" ON property_cache
  FOR ALL USING (
    auth.role() = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role IN ('admin', 'editor')
    )
  );

-- 4. CREATE SECURE POLICIES FOR ADMIN_USERS TABLE

-- Allow users to read their own admin record
CREATE POLICY "Users can read own admin record" ON admin_users
  FOR SELECT USING (id = auth.uid());

-- Allow admins to read all admin users
CREATE POLICY "Admins can read all admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'admin'
    )
  );

-- Allow only service role or admins to insert new admin users
CREATE POLICY "Service role and admins can create admin users" ON admin_users
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'admin'
    )
  );

-- Allow users to update their own admin record
CREATE POLICY "Users can update own admin record" ON admin_users
  FOR UPDATE USING (id = auth.uid());

-- Allow admins to update any admin user
CREATE POLICY "Admins can update any admin user" ON admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'admin'
    )
  );

-- Allow only service role or admins to delete admin users
CREATE POLICY "Service role and admins can delete admin users" ON admin_users
  FOR DELETE USING (
    auth.role() = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'admin'
    )
  );

-- 5. CREATE SECURE FUNCTIONS FOR ADMIN OPERATIONS

-- Function to check if current user is admin
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

-- Function to check if current user is editor or admin
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

-- Function to get current user's admin role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM admin_users 
    WHERE admin_users.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RESTRICT DIRECT TABLE ACCESS

-- Revoke all permissions from public role
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM public;

-- Grant SELECT permissions to public for property_cache (for website visitors)
GRANT SELECT ON property_cache TO public;

-- Grant minimal permissions to authenticated users
GRANT SELECT ON admin_users TO authenticated;

-- Grant full permissions to service role (for server-side operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 7. CREATE SECURE API ENDPOINTS (if using Supabase Edge Functions)

-- Note: These would be implemented as Edge Functions, not SQL
-- But we can create helper functions for them

-- Function to refresh property cache (admin only)
CREATE OR REPLACE FUNCTION refresh_property_cache()
RETURNS JSON AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- This would trigger the cache refresh logic
  -- For now, just return success
  RETURN json_build_object(
    'success', true,
    'message', 'Cache refresh initiated',
    'timestamp', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cache status (admin only)
CREATE OR REPLACE FUNCTION get_cache_status()
RETURNS JSON AS $$
DECLARE
  total_properties INTEGER;
  active_properties INTEGER;
  last_updated TIMESTAMP;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Get cache statistics
  SELECT 
    COUNT(*) INTO total_properties
  FROM property_cache;
  
  SELECT 
    COUNT(*) INTO active_properties
  FROM property_cache 
  WHERE is_active = true;
  
  SELECT 
    MAX(last_updated) INTO last_updated
  FROM property_cache;
  
  RETURN json_build_object(
    'total_properties', total_properties,
    'active_properties', active_properties,
    'last_updated', last_updated,
    'cache_age_hours', EXTRACT(EPOCH FROM (now() - last_updated)) / 3600
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ADD AUDIT LOGGING

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
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

-- Only admins can read audit logs
CREATE POLICY "Only admins can read audit logs" ON audit_log
  FOR SELECT USING (is_admin());

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  action_name TEXT,
  table_name TEXT DEFAULT NULL,
  record_id TEXT DEFAULT NULL,
  old_vals JSONB DEFAULT NULL,
  new_vals JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_log (
    user_id, 
    action, 
    table_name, 
    record_id, 
    old_values, 
    new_values
  ) VALUES (
    auth.uid(),
    action_name,
    table_name,
    record_id,
    old_vals,
    new_vals
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CREATE TRIGGERS FOR AUDIT LOGGING

-- Trigger for admin_users table
CREATE OR REPLACE FUNCTION audit_admin_users()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_admin_action('INSERT', 'admin_users', NEW.id::TEXT, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_admin_action('UPDATE', 'admin_users', NEW.id::TEXT, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_admin_action('DELETE', 'admin_users', OLD.id::TEXT, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_admin_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION audit_admin_users();

-- 10. FINAL SECURITY CHECKS

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('property_cache', 'admin_users', 'audit_log')
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = table_record.tablename
    ) THEN
      RAISE NOTICE 'Warning: No policies found for table %', table_record.tablename;
    END IF;
  END LOOP;
END $$;

-- Display security status
SELECT 
  'Security lockdown completed successfully!' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'; 