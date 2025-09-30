const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    // Create a test admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@test.com',
        password_hash: 'test123', // In production, this should be properly hashed
        role: 'admin'
      })
      .select();

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    console.log('✅ Admin user created successfully:', data);
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: test123');
    console.log('👤 Role: admin');

  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser(); 