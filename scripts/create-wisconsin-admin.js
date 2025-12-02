const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Wisconsin Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL;
const supabaseServiceKey = process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Wisconsin Supabase environment variables:');
  console.error('   NEXT_PUBLIC_WISCONSIN_SUPABASE_URL');
  console.error('   WISCONSIN_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createWisconsinAdmin() {
  try {
    // Get admin email from command line arguments
    const adminEmail = process.argv[2];
    const adminPassword = process.argv[3];

    if (!adminEmail || !adminPassword) {
      console.log('Usage: node create-wisconsin-admin.js <email> <password>');
      console.log('Example: node create-wisconsin-admin.js admin@grandviewwisconsin.com mypassword123');
      process.exit(1);
    }

    console.log('🔐 Creating Wisconsin admin user...');
    console.log(`📧 Email: ${adminEmail}`);

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Insert admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          email: adminEmail,
          password_hash: passwordHash,
          role: 'admin'
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') {
        console.log('⚠️  Admin user already exists with this email');
      } else {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
      }
    } else {
      console.log('✅ Wisconsin admin user created successfully!');
      console.log('📋 Admin Details:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Role: admin`);
      console.log(`   ID: ${data[0].id}`);
    }

    // Test the connection
    console.log('\n🔍 Testing Wisconsin Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('admin_users')
      .select('email, role')
      .eq('email', adminEmail);

    if (testError) {
      console.error('❌ Connection test failed:', testError);
    } else {
      console.log('✅ Wisconsin Supabase connection successful!');
      console.log('📊 Found admin user:', testData[0]);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

createWisconsinAdmin();
