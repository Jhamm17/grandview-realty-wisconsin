-- Migration script to update admin_users table for Supabase Auth
-- Run this in your Supabase SQL Editor

-- First, backup existing data
CREATE TABLE IF NOT EXISTS admin_users_backup AS SELECT * FROM admin_users;

-- Drop the existing table
DROP TABLE IF EXISTS admin_users;

-- Create the new admin_users table with Supabase Auth integration
CREATE TABLE admin_users (
  id UUID PRIMARY KEY, -- This will be the Supabase Auth user ID
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to admin_users" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "Allow write access to admin_users" ON admin_users
  FOR ALL USING (true);

-- Insert a default admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'your-supabase-auth-user-id' with the actual UUID from Supabase Auth
-- INSERT INTO admin_users (id, email, role) VALUES ('your-supabase-auth-user-id', 'your-email@example.com', 'admin');

-- Optional: Restore data from backup (if you had existing admin users)
-- You'll need to manually map the old emails to new Supabase Auth user IDs
-- INSERT INTO admin_users (id, email, role, created_at) 
-- SELECT gen_random_uuid(), email, role, created_at FROM admin_users_backup;

-- Clean up backup table
-- DROP TABLE admin_users_backup; 