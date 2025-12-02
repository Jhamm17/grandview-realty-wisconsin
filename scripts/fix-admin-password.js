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

async function fixAdminPassword() {
  try {
    const email = process.argv[2];
    const password = process.argv[3];
    
    if (!email || !password) {
      console.log('Usage: node fix-admin-password.js <email> <new-password>');
      console.log('Example: node fix-admin-password.js admin@example.com mypassword123');
      process.exit(1);
    }

    console.log(`🔐 Fixing admin user password...\n`);
    console.log(`📧 Email: ${email}`);

    // Check if user exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim());

    if (checkError) {
      console.error('❌ Error checking user:', checkError);
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    if (!existingUsers || existingUsers.length === 0) {
      // Create new admin user
      console.log('📝 Creating new admin user...');
      const { data, error } = await supabase
        .from('admin_users')
        .insert([
          {
            email: email.toLowerCase().trim(),
            password_hash: passwordHash,
            role: 'admin'
          }
        ])
        .select();

      if (error) {
        console.error('❌ Error creating admin user:', error);
        return;
      }

      console.log('✅ Admin user created successfully!');
      console.log(`   ID: ${data[0].id}`);
    } else {
      // Update existing user
      console.log('📝 Updating existing admin user...');
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          // Remove plain text password if it exists
          password: null
        })
        .eq('email', email.toLowerCase().trim());

      if (updateError) {
        console.error('❌ Error updating admin user:', updateError);
        return;
      }

      console.log('✅ Admin user password updated successfully!');
    }

    // Verify the password works
    console.log('\n🔍 Verifying password...');
    const { data: verifyUser } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (verifyUser && verifyUser.password_hash) {
      const isValid = await bcrypt.compare(password, verifyUser.password_hash);
      if (isValid) {
        console.log('✅ Password verification successful!');
        console.log('\n🎉 You can now log in with:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
      } else {
        console.log('❌ Password verification failed (this shouldn\'t happen)');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAdminPassword();

