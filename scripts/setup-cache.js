#!/usr/bin/env node

/**
 * Setup script to populate the initial property cache
 * Run this after setting up Supabase and environment variables
 */

import { createClient } from '@supabase/supabase-js';

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mlsToken = process.env.MLSGRID_ACCESS_TOKEN;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

if (!mlsToken) {
  console.error('❌ Missing MLS Grid access token');
  console.error('Please set MLSGRID_ACCESS_TOKEN');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupCache() {
  console.log('🚀 Starting property cache setup...');
  
  try {
    // Test Supabase connection
    console.log('📡 Testing Supabase connection...');
    const { error: testError } = await supabase
      .from('property_cache')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError.message);
      console.error('Make sure you have run the supabase-setup.sql script');
      process.exit(1);
    }
    
    console.log('✅ Supabase connection successful');
    
    // Check if cache is empty
    const { data: existingProperties, error: countError } = await supabase
      .from('property_cache')
      .select('listing_id')
      .eq('is_active', true);
    
    if (countError) {
      console.error('❌ Error checking existing properties:', countError.message);
      process.exit(1);
    }
    
    if (existingProperties && existingProperties.length > 0) {
      console.log(`📊 Found ${existingProperties.length} existing properties in cache`);
      console.log('💡 Cache is already populated. You can refresh it from the admin dashboard.');
      return;
    }
    
    console.log('📥 Cache is empty. Fetching properties from MLS API...');
    
    // Fetch properties from MLS API
    const queryParams = new URLSearchParams({
      '$top': '1000',
      '$filter': 'MlgCanView eq true',
      '$orderby': 'ModificationTimestamp desc',
      '$count': 'true',
      '$expand': 'Media'
    });

    const url = `https://api.mlsgrid.com/v2/Property?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${mlsToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip'
      }
    });

    if (!response.ok) {
      throw new Error(`MLS API request failed: ${response.status}`);
    }

    const data = await response.json();
    let allProperties = [...data.value];
    let nextLink = data['@odata.nextLink'];
    let pageCount = 1;

    // Handle pagination
    while (nextLink && pageCount < 10) {
      pageCount++;
      console.log(`📄 Fetching page ${pageCount}...`);
      
      const nextResponse = await fetch(nextLink, {
        headers: {
          'Authorization': `Bearer ${mlsToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      });
      
      if (!nextResponse.ok) {
        console.error(`❌ Pagination request failed on page ${pageCount}:`, nextResponse.status);
        break;
      }
      
      const nextData = await nextResponse.json();
      allProperties = [...allProperties, ...nextData.value];
      nextLink = nextData['@odata.nextLink'];
    }

    // Filter for active properties
    const activeProperties = allProperties.filter((property) => 
      property.StandardStatus === 'Active' && 
      !property.StandardStatus.includes('Contract') &&
      !property.StandardStatus.includes('Pending') &&
      !property.StandardStatus.includes('Sold')
    );

    console.log(`✅ Fetched ${activeProperties.length} active properties from MLS API`);
    
    if (activeProperties.length === 0) {
      console.log('⚠️  No active properties found');
      return;
    }
    
    // Prepare cache data
    const cacheData = activeProperties.map(property => ({
      listing_id: property.ListingId,
      property_data: property,
      last_updated: new Date().toISOString(),
      is_active: true
    }));

    // Insert into cache
    console.log('💾 Storing properties in cache...');
    const { error: insertError } = await supabase
      .from('property_cache')
      .upsert(cacheData, {
        onConflict: 'listing_id'
      });

    if (insertError) {
      console.error('❌ Error storing properties in cache:', insertError.message);
      process.exit(1);
    }

    console.log(`✅ Successfully cached ${activeProperties.length} properties`);
    console.log('🎉 Cache setup complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit /admin to access the admin dashboard');
    console.log('3. Add your email as an admin user in Supabase');
    console.log('4. Test the property pages');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupCache(); 