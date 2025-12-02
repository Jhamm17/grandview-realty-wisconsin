require('dotenv').config({ path: '.env.local' });

const mlsToken = process.env.WISCONSIN_MLS_ACCESS_TOKEN;
const mlsApiUrl = process.env.NEXT_PUBLIC_WISCONSIN_MLS_API_URL || 'https://api.mlsaligned.com/reso/odata';
const mlsOuid = process.env.WISCONSIN_MLS_OUID || 'M00000662';
const mlsAppName = process.env['MLS-Aligned_User-Agent'] || process.env.WISCONSIN_MLS_APP_NAME || 'Jackson Hamm Consultant';

// Handle token that may or may not already include "Bearer "
const authToken = mlsToken?.startsWith('Bearer ') ? mlsToken : `Bearer ${mlsToken}`;

console.log('🔍 Testing Office Name Filter...\n');

async function testOfficeFilter() {
  const headers = {
    'MLS-Aligned_User-Agent': mlsAppName,
    'Authorization': authToken,
    'OUID': mlsOuid,
    'Accept': 'application/json',
  };

  // Test 1: Try ListOfficeName filter
  console.log('Test 1: ListOfficeName eq \'Grandview Realty\'');
  const url1 = `${mlsApiUrl}/Property?$top=5&$filter=${encodeURIComponent("ListOfficeName eq 'Grandview Realty'")}`;
  console.log('URL:', url1);
  
  try {
    const response1 = await fetch(url1, { headers });
    const data1 = await response1.json();
    
    if (data1.value && data1.value.length > 0) {
      console.log(`✅ Got ${data1.value.length} results`);
      console.log('Sample office names:', data1.value.map(p => p.ListOfficeName).filter(Boolean).slice(0, 5));
      
      // Check if any are actually Grandview Realty
      const grandviewCount = data1.value.filter(p => p.ListOfficeName === 'Grandview Realty').length;
      if (grandviewCount === 0) {
        console.log('❌ WARNING: Filter returned results but NONE are "Grandview Realty"');
        console.log('   This means ListOfficeName is NOT filterable - the API is ignoring the filter');
      } else {
        console.log(`✅ Found ${grandviewCount} properties from Grandview Realty`);
      }
    } else {
      console.log('⚠️  No results returned');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Try ListOfficeMlsId filter (if we know the ID)
  console.log('Test 2: ListOfficeMlsId filter (if you know the MLS ID)');
  console.log('   Note: You\'ll need to find Grandview Realty\'s MLS ID first');
  
  // First, let's try to find Grandview Realty's MLS ID by fetching some properties
  console.log('\nSearching for Grandview Realty in unfiltered results...');
  const url2 = `${mlsApiUrl}/Property?$top=100&$select=ListOfficeName,ListOfficeMlsId,ListingId`;
  
  try {
    const response2 = await fetch(url2, { headers });
    const data2 = await response2.json();
    
    if (data2.value) {
      const grandviewOffices = data2.value.filter(p => 
        p.ListOfficeName && p.ListOfficeName.toLowerCase().includes('grandview')
      );
      
      if (grandviewOffices.length > 0) {
        console.log(`✅ Found ${grandviewOffices.length} properties with "Grandview" in office name`);
        const uniqueOffices = [...new Set(grandviewOffices.map(p => ({
          name: p.ListOfficeName,
          mlsId: p.ListOfficeMlsId
        })))];
        console.log('Office details:', uniqueOffices);
        
        if (uniqueOffices.length === 1 && uniqueOffices[0].mlsId) {
          console.log(`\n💡 Try filtering by ListOfficeMlsId: ${uniqueOffices[0].mlsId}`);
          const url3 = `${mlsApiUrl}/Property?$top=5&$filter=${encodeURIComponent(`ListOfficeMlsId eq '${uniqueOffices[0].mlsId}'`)}`;
          console.log('URL:', url3);
        }
      } else {
        console.log('⚠️  No properties found with "Grandview" in office name');
        console.log('   Checking all unique office names in sample...');
        const uniqueOffices = [...new Set(data2.value.map(p => p.ListOfficeName).filter(Boolean))];
        console.log(`   Found ${uniqueOffices.length} unique offices in sample`);
        console.log('   Sample offices:', uniqueOffices.slice(0, 10));
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n---\n');
  console.log('📋 Summary:');
  console.log('   If Test 1 returned non-Grandview results, ListOfficeName is NOT filterable');
  console.log('   Try using ListOfficeMlsId instead if you can find the MLS ID');
  console.log('   Or filter client-side after fetching all properties');
}

testOfficeFilter().catch(console.error);

