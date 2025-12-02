const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL;
const supabaseServiceKey = process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY;
const mlsToken = process.env.WISCONSIN_MLS_ACCESS_TOKEN;
const mlsApiUrl = process.env.NEXT_PUBLIC_WISCONSIN_MLS_API_URL || 'http://aligned.metromls.com/RESO/OData';
const mlsOuid = process.env.WISCONSIN_MLS_OUID || 'M00000662';
const mlsAppName = process.env['MLS-Aligned-User-Agent'] || process.env.WISCONSIN_MLS_APP_NAME || 'Jackson Hamm Consultant';

console.log('🔍 Testing Wisconsin MLS API Configuration...\n');
console.log('Environment Variables:');
console.log('  MLS API URL:', mlsApiUrl);
console.log('  MLS Access Token:', mlsToken ? '✅ Set (' + mlsToken.substring(0, 10) + '...)' : '❌ Missing');
console.log('  MLS OUID:', mlsOuid);
console.log('  MLS App Name:', mlsAppName);
console.log('');

if (!mlsToken || mlsToken === 'your_wisconsin_mls_access_token') {
  console.error('❌ WISCONSIN_MLS_ACCESS_TOKEN is not set or is still the placeholder value!');
  console.error('   Please set a valid access token in your .env.local file');
  process.exit(1);
}

// Test API call
async function testMLSAPI() {
  try {
    console.log('📡 Testing MLS API connection...');
    console.log('   URL:', `${mlsApiUrl}/Property/?$top=1`);
    
    const response = await fetch(`${mlsApiUrl}/Property/?$top=1`, {
      headers: {
        'MLS-Aligned-User-Agent': mlsAppName,
        'Authorization': `Bearer ${mlsToken}`,
        'OUID': mlsOuid,
        'Accept': 'application/json',
      },
    });

    console.log('   Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:');
      console.error(errorText.substring(0, 500));
      return;
    }

    const data = await response.json();
    console.log('✅ API Connection successful!');
    console.log('   Response keys:', Object.keys(data));
    if (data.value) {
      console.log('   Properties returned:', data.value.length);
      if (data.value.length > 0) {
        console.log('   Sample property:', {
          ListingId: data.value[0].ListingId,
          City: data.value[0].City,
          ListPrice: data.value[0].ListPrice
        });
      }
    }

    // Check Supabase cache
    if (supabaseUrl && supabaseServiceKey) {
      console.log('\n📊 Checking Supabase property_cache...');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: cached, count, error } = await supabase
        .from('property_cache')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error querying cache:', error);
      } else {
        console.log(`   Cached properties: ${count || 0}`);
        if (count === 0) {
          console.log('   ⚠️  Cache is empty - properties need to be fetched and cached');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error testing MLS API:', error.message);
    console.error('   Stack:', error.stack);
  }
}

testMLSAPI();

