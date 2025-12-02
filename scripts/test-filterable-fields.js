require('dotenv').config({ path: '.env.local' });

const mlsToken = process.env.WISCONSIN_MLS_ACCESS_TOKEN;
const mlsApiUrl = process.env.NEXT_PUBLIC_WISCONSIN_MLS_API_URL || 'https://api.mlsaligned.com/reso/odata';
const mlsOuid = process.env.WISCONSIN_MLS_OUID || 'M00000662';
const mlsAppName = process.env['MLS-Aligned_User-Agent'] || process.env.WISCONSIN_MLS_APP_NAME || 'Jackson Hamm Consultant';

// Handle token that may or may not already include "Bearer "
const authToken = mlsToken?.startsWith('Bearer ') ? mlsToken : `Bearer ${mlsToken}`;

console.log('🔍 Testing Filterable Fields in MLS API...\n');

// Fields to test
const fieldsToTest = [
  'ListOfficeName',
  'ListOfficeMlsId',
  'ListOfficeMlsData',
  'ListOfficeKey',
  'ListingId',
  'ListingKey',
  'MlsStatus',
  'StandardStatus',
  'City',
  'ListPrice',
  'PropertyType'
];

async function testFieldFilterability(fieldName) {
  try {
    // Try a simple equality filter
    const filter = `${fieldName} eq 'test'`;
    const url = `${mlsApiUrl}/Property/?$top=1&$filter=${encodeURIComponent(filter)}`;
    
    const response = await fetch(url, {
      headers: {
        'MLS-Aligned_User-Agent': mlsAppName,
        'Authorization': authToken,
        'OUID': mlsOuid,
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();
    
    // If we get a 400 Bad Request with an error about the field, it's not filterable
    if (response.status === 400) {
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message && (
          errorData.message.includes('not filterable') ||
          errorData.message.includes('not supported') ||
          errorData.message.includes('invalid property') ||
          errorData.message.includes('cannot be used in filter')
        )) {
          return { filterable: false, reason: errorData.message };
        }
      } catch (e) {
        // Not JSON error, might be HTML or other format
      }
      return { filterable: false, reason: `HTTP ${response.status}` };
    }
    
    // If we get 200, the field might be filterable (even if no results)
    if (response.status === 200) {
      return { filterable: true, reason: 'Filter accepted (HTTP 200)' };
    }
    
    return { filterable: 'unknown', reason: `HTTP ${response.status}` };
  } catch (error) {
    return { filterable: false, reason: error.message };
  }
}

async function testAllFields() {
  console.log('Testing field filterability...\n');
  
  for (const field of fieldsToTest) {
    process.stdout.write(`Testing ${field}... `);
    const result = await testFieldFilterability(field);
    
    if (result.filterable === true) {
      console.log(`✅ FILTERABLE - ${result.reason}`);
    } else if (result.filterable === false) {
      console.log(`❌ NOT FILTERABLE - ${result.reason}`);
    } else {
      console.log(`⚠️  UNKNOWN - ${result.reason}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n\n💡 Tip: Only fields marked as ✅ FILTERABLE can be used in $filter queries.');
  console.log('   For office filtering, try using ListOfficeName or ListOfficeMlsId instead of ListOfficeMlsData.');
}

// Also try to get metadata to see filterable fields
async function checkMetadata() {
  try {
    console.log('\n📋 Attempting to fetch API metadata...\n');
    const metadataUrl = `${mlsApiUrl}/$metadata`;
    
    const response = await fetch(metadataUrl, {
      headers: {
        'MLS-Aligned_User-Agent': mlsAppName,
        'Authorization': authToken,
        'OUID': mlsOuid,
        'Accept': 'application/xml',
      },
    });

    if (response.ok) {
      const xml = await response.text();
      console.log('✅ Metadata available at:', metadataUrl);
      console.log('   (Check the XML for fields marked as filterable)');
    } else {
      console.log('⚠️  Metadata not accessible');
    }
  } catch (error) {
    console.log('⚠️  Could not fetch metadata:', error.message);
  }
}

async function main() {
  await testAllFields();
  await checkMetadata();
}

main().catch(console.error);

