import { supabase } from './supabase';
import { AdminUser, AuthUser } from './supabase';
import bcrypt from 'bcryptjs';

export class AdminAuthService {
  // Sign in with email and password (with bcrypt password hashing)
  static async signIn(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // Find user by email (don't filter by password - we'll verify it separately)
      const { data: adminUsers, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase().trim()); // Normalize email

      if (error) {
        console.error('Error querying admin_users:', error);
        return { success: false, error: 'Database error' };
      }

      if (!adminUsers || adminUsers.length === 0) {
        return { success: false, error: 'Invalid email or password' };
      }

      const adminUser = adminUsers[0];
      
      // Check password - support both password_hash (bcrypt) and password (plain text for migration)
      let passwordValid = false;
      
      if (adminUser.password_hash) {
        // Use bcrypt to compare with hashed password
        try {
          passwordValid = await bcrypt.compare(password, adminUser.password_hash);
        } catch (bcryptError) {
          console.error('Error comparing password with bcrypt:', bcryptError);
          passwordValid = false;
        }
      } else if (adminUser.password) {
        // Fallback to plain text comparison (for migration purposes)
        passwordValid = adminUser.password === password;
      } else {
        return { success: false, error: 'Invalid email or password' };
      }

      if (!passwordValid) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      return {
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role
        }
      };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { success: false, error: 'Sign in failed' };
    }
  }

  // Sign out (simple - just clear local state)
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      // For simple auth, we just return success
      // The client will handle clearing the session
      return { success: true };
    } catch (error) {
      console.error('Error in signOut:', error);
      return { success: false, error: 'Sign out failed' };
    }
  }

  // Get current user (simple - check if user exists in admin_users)
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // For simple auth, we'll need to store the user in localStorage or session
      // For now, return null to force login
      return null;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  // Check if user is admin
  static async isAdmin(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin');

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error in isAdmin:', error);
      return false;
    }
  }

  // Check if user is editor or admin
  static async isEditor(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .in('role', ['admin', 'editor']);

      if (error) {
        console.error('Error checking editor status:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error in isEditor:', error);
      return false;
    }
  }

  // Get admin user details
  static async getAdminUser(email: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error getting admin user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getAdminUser:', error);
      return null;
    }
  }

  // Get all admin users
  static async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting admin users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllAdminUsers:', error);
      return [];
    }
  }

  // Remove admin user
  static async removeAdminUser(email: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('email', email);

      if (error) {
        console.error('Error removing admin user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeAdminUser:', error);
      return false;
    }
  }

  // Create a new admin user (simple)
  static async createAdminUser(email: string, password: string, role: 'admin' | 'editor' = 'editor'): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          email: email,
          password: password,
          role: role
        });

      if (error) {
        console.error('Error creating admin user:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in createAdminUser:', error);
      return { success: false, error: 'Admin user creation failed' };
    }
  }

  // Change password for current user
  static async changePassword(_currentPassword: string, _newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For simple auth, we'll need to implement this differently
      // For now, return an error
      return { success: false, error: 'Password change not implemented for simple auth' };
    } catch (error) {
      console.error('Error in changePassword:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  // Reset password (for admin use)
  static async resetPassword(_email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For simple auth, we'll need to implement this differently
      // For now, return an error
      return { success: false, error: 'Password reset not implemented for simple auth' };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { success: false, error: 'Failed to send reset email' };
    }
  }
} 