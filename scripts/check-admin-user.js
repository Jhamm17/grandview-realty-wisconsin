const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL;
const supabaseServiceKey = process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminUser() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node check-admin-user.js <email>');
      process.exit(1);
    }

    console.log(`🔍 Checking admin user: ${email}\n`);

    // Check what columns exist
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email);

    if (error) {
      console.error('❌ Error querying admin_users:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No admin user found with that email');
      return;
    }

    const user = users[0];
    console.log('✅ Found admin user:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Created:', user.created_at);
    console.log('\n📋 Available columns:');
    console.log('   password:', user.password ? '✅ EXISTS' : '❌ MISSING');
    console.log('   password_hash:', user.password_hash ? '✅ EXISTS' : '❌ MISSING');
    
    if (user.password) {
      console.log('\n⚠️  WARNING: User has plain text password field');
      console.log('   Password value:', user.password.substring(0, 10) + '...');
    }
    
    if (user.password_hash) {
      console.log('\n✅ User has password_hash field');
      console.log('   Hash length:', user.password_hash.length);
    }

    // Test password if provided
    const testPassword = process.argv[3];
    if (testPassword) {
      console.log(`\n🔐 Testing password...`);
      
      if (user.password_hash) {
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        if (isValid) {
          console.log('✅ Password matches password_hash!');
        } else {
          console.log('❌ Password does NOT match password_hash');
        }
      }
      
      if (user.password) {
        if (user.password === testPassword) {
          console.log('✅ Password matches plain text password field');
        } else {
          console.log('❌ Password does NOT match plain text password field');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAdminUser();

