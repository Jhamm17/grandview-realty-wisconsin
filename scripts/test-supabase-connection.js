const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL;
  const serviceRoleKey = process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY;

  console.log('📋 Environment Variables:');
  console.log(`  NEXT_PUBLIC_WISCONSIN_SUPABASE_URL: ${supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : '❌ NOT SET'}`);
  console.log(`  WISCONSIN_SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : '❌ NOT SET'}`);
  console.log(`  NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY: ${anonKey ? anonKey.substring(0, 20) + '...' : '❌ NOT SET'}`);
  console.log('');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required Supabase environment variables!');
    console.error('   Please check your .env.local file');
    process.exit(1);
  }

  // Create Supabase client
  console.log('🔌 Creating Supabase client...');
  let supabase;
  try {
    supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log('✅ Supabase client created\n');
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error.message);
    process.exit(1);
  }

  // Test 1: Check if we can connect
  console.log('🧪 Test 1: Testing connection...');
  try {
    const { data, error } = await supabase
      .from('property_cache')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection test failed:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Error details:', error.details);
      console.error('   Error hint:', error.hint);
    } else {
      console.log('✅ Connection successful!');
      console.log(`   Found ${data || 0} properties in cache\n`);
    }
  } catch (error) {
    console.error('❌ Connection test threw an error:', error.message);
    console.error('   Full error:', error);
    console.error('   Error type:', error.constructor.name);
    if (error.cause) {
      console.error('   Error cause:', error.cause);
    }
  }

  // Test 2: Try to read from cache
  console.log('🧪 Test 2: Reading from property_cache...');
  try {
    const { data, error } = await supabase
      .from('property_cache')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Read test failed:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
    } else {
      console.log('✅ Read test successful!');
      console.log(`   Retrieved ${data?.length || 0} record(s)\n`);
    }
  } catch (error) {
    console.error('❌ Read test threw an error:', error.message);
    console.error('   Full error:', error);
  }

  // Test 3: Try to write to cache (test insert)
  console.log('🧪 Test 3: Writing to property_cache (test insert)...');
  try {
    const testData = {
      listing_id: 'TEST_' + Date.now(),
      property_data: {
        ListingId: 'TEST',
        ListingKey: 'TEST',
        City: 'Test City',
        ListPrice: 100000
      },
      is_active: false, // Mark as inactive so it doesn't interfere
      last_updated: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('property_cache')
      .insert(testData)
      .select();

    if (error) {
      console.error('❌ Write test failed:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Error details:', error.details);
      console.error('   Error hint:', error.hint);
    } else {
      console.log('✅ Write test successful!');
      console.log(`   Inserted test record with ID: ${data[0]?.id}\n`);

      // Clean up: delete the test record
      console.log('🧹 Cleaning up test record...');
      const { error: deleteError } = await supabase
        .from('property_cache')
        .delete()
        .eq('listing_id', testData.listing_id);

      if (deleteError) {
        console.error('⚠️  Failed to delete test record:', deleteError.message);
      } else {
        console.log('✅ Test record deleted\n');
      }
    }
  } catch (error) {
    console.error('❌ Write test threw an error:', error.message);
    console.error('   Full error:', error);
  }

  // Test 4: Check table structure
  console.log('🧪 Test 4: Checking table structure...');
  try {
    const { data, error } = await supabase
      .from('property_cache')
      .select('*')
      .limit(0);

    if (error) {
      console.error('❌ Table structure check failed:', error);
    } else {
      console.log('✅ Table exists and is accessible');
      console.log('   Table structure appears to be correct\n');
    }
  } catch (error) {
    console.error('❌ Table structure check threw an error:', error.message);
  }

  // Test 5: Network connectivity test
  console.log('🧪 Test 5: Testing network connectivity...');
  try {
    const response = await fetch(supabaseUrl + '/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });

    console.log(`   HTTP Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      console.log('✅ Network connectivity is working\n');
    } else {
      console.error('❌ Network request failed with status:', response.status);
      const text = await response.text();
      console.error('   Response:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error.message);
    console.error('   This might indicate:');
    console.error('   - Network connectivity issues');
    console.error('   - Incorrect Supabase URL');
    console.error('   - Firewall/proxy blocking the connection');
    console.error('   - DNS resolution issues');
  }

  console.log('\n✅ Supabase connection test completed!');
}

testSupabaseConnection().catch(error => {
  console.error('\n❌ Test script failed:', error);
  process.exit(1);
});
