const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDefaultAdmin() {
  try {
    console.log('Creating default admin user...');
    
    // Check if admin user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@grandviewsells.com');

    if (checkError) {
      console.error('Error checking existing admin users:', checkError);
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@grandviewsells.com');
      console.log('Password: admin123');
      console.log('Role: admin');
      return;
    }

    // Create default admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{
        email: 'admin@grandviewsells.com',
        password: 'admin123', // In production, this should be hashed
        role: 'admin'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    console.log('✅ Default admin user created successfully!');
    console.log('Email: admin@grandviewsells.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');

    // List all admin users
    const { data: allUsers, error: listError } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('Error listing admin users:', listError);
      return;
    }

    console.log(`\nTotal admin users: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - Created: ${new Date(user.created_at).toLocaleDateString()}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createDefaultAdmin(); 