require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const mlsToken = process.env.WISCONSIN_MLS_ACCESS_TOKEN;
const mlsApiUrl = process.env.NEXT_PUBLIC_WISCONSIN_MLS_API_URL || 'https://api.mlsaligned.com/reso/odata';
const mlsOuid = process.env.WISCONSIN_MLS_OUID || 'M00000662';
const mlsAppName = process.env['MLS-Aligned_User-Agent'] || process.env.WISCONSIN_MLS_APP_NAME || 'Jackson Hamm Consultant';

const supabaseUrl = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL;
const supabaseServiceKey = process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testing Property Fetch (simulating refresh cache)...\n');

async function testPropertyFetch() {
  try {
    // Step 1: Test API connection
    console.log('📡 Step 1: Testing MLS API connection...');
    const url = `${mlsApiUrl}/Property/?$top=1&$filter=MlsStatus eq 'Active'`;
    
    console.log('   URL:', url);
    // Handle token that may or may not already include "Bearer "
    const authToken = mlsToken?.startsWith('Bearer ') ? mlsToken : `Bearer ${mlsToken}`;
    
    console.log('   Headers:');
    console.log('     MLS-Aligned_User-Agent:', mlsAppName);
    console.log('     Authorization:', authToken.substring(0, 25) + '...');
    console.log('     OUID:', mlsOuid);
    console.log('     Accept: application/json');
    console.log('');

    const response = await fetch(url, {
      headers: {
        'MLS-Aligned_User-Agent': mlsAppName,
        'Authorization': authToken,
        'OUID': mlsOuid,
        'Accept': 'application/json',
      },
    });

    console.log('   Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('   ❌ API Error:');
      console.error('   ', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('\n   Parsed Error:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        // Not JSON
      }
      
      console.log('\n❌ Cannot proceed - API connection failed');
      return;
    }

    const data = await response.json();
    console.log('   ✅ API Connection successful!');
    console.log('   Properties returned:', data.value?.length || 0);
    
    if (data.value && data.value.length > 0) {
      console.log('   Sample property:', {
        ListingId: data.value[0].ListingId,
        City: data.value[0].City,
        ListPrice: data.value[0].ListPrice
      });
    }

    // Step 2: Test Supabase cache
    if (supabaseUrl && supabaseServiceKey) {
      console.log('\n📊 Step 2: Testing Supabase cache...');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Check current cache
      const { data: cached, count, error: cacheError } = await supabase
        .from('property_cache')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (cacheError) {
        console.error('   ❌ Error querying cache:', cacheError);
      } else {
        console.log(`   Current cached properties: ${count || 0}`);
      }

      // Try to insert a test property
      if (data.value && data.value.length > 0) {
        console.log('\n   Testing cache insert...');
        const testProperty = data.value[0];
        const { error: insertError } = await supabase
          .from('property_cache')
          .upsert({
            listing_id: testProperty.ListingId || 'TEST123',
            property_data: testProperty,
            last_updated: new Date().toISOString(),
            is_active: true
          }, {
            onConflict: 'listing_id'
          });

        if (insertError) {
          console.error('   ❌ Error inserting into cache:', insertError);
        } else {
          console.log('   ✅ Successfully inserted test property into cache!');
        }
      }
    }

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

testPropertyFetch();

