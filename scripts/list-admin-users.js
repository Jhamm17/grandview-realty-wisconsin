const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL;
const supabaseServiceKey = process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAdminUsers() {
  try {
    console.log('👥 Listing all admin users...\n');

    const { data: users, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error querying admin_users:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No admin users found in database');
      console.log('\n💡 To create an admin user, run:');
      console.log('   node scripts/fix-admin-password.js your-email@example.com your-password');
      return;
    }

    console.log(`✅ Found ${users.length} admin user(s):\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Last Login: ${user.last_login || 'Never'}`);
      console.log(`   Has password_hash: ${user.password_hash ? '✅ Yes' : '❌ No'}`);
      console.log(`   Has password: ${user.password ? '⚠️  Yes (plain text - should be removed)' : '✅ No'}`);
      console.log('');
    });

    console.log('💡 To fix a user\'s password, run:');
    console.log('   node scripts/fix-admin-password.js <email> <new-password>');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listAdminUsers();

