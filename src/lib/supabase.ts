import { createClient } from '@supabase/supabase-js';
import { Property } from './mred/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Add defensive programming for missing environment variables
let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  
  // Create a dummy client to prevent crashes
  supabaseClient = createClient('https://dummy.supabase.co', 'dummy-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
} else {
  console.log('Supabase environment variables found, creating client...');
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
}

export const supabase = supabaseClient;

// Database types
export interface PropertyCache {
  id: string;
  listing_id: string;
  property_data: Property;
  last_updated: string;
  is_active: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'editor';
  created_at: string;
  last_login?: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
} 