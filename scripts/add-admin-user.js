const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAdminUser(email, password) {
  try {
    console.log(`🔄 Adding admin user: ${email}`);
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert the admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: email,
        password_hash: passwordHash,
        role: 'admin'
      })
      .select();

    if (error) {
      console.error('❌ Error adding admin user:', error.message);
      return false;
    }

    console.log('✅ Admin user added successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: admin`);
    return true;
  } catch (error) {
    console.error('❌ Error adding admin user:', error.message);
    return false;
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Please provide both email and password:');
  console.error('   node scripts/add-admin-user.js your-email@example.com your-password');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Please provide a valid email address');
  process.exit(1);
}

// Validate password length
if (password.length < 6) {
  console.error('❌ Password must be at least 6 characters long');
  process.exit(1);
}

addAdminUser(email, password).then(success => {
  if (success) {
    console.log('\n🎉 Admin user created! You can now log in to the admin dashboard.');
    console.log('🌐 Visit: https://grandviewsells.com/admin');
  } else {
    console.log('\n❌ Failed to create admin user. Please check the error messages above.');
    process.exit(1);
  }
}); 