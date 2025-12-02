require('dotenv').config({ path: '.env.local' });

const mlsToken = process.env.WISCONSIN_MLS_ACCESS_TOKEN;
const mlsApiUrl = process.env.NEXT_PUBLIC_WISCONSIN_MLS_API_URL || 'https://api.mlsaligned.com/reso/odata';
const mlsOuid = process.env.WISCONSIN_MLS_OUID || 'M00000662';
const mlsAppName = process.env['MLS-Aligned_User-Agent'] || process.env.WISCONSIN_MLS_APP_NAME || 'Jackson Hamm Consultant';

const authToken = mlsToken?.startsWith('Bearer ') ? mlsToken : `Bearer ${mlsToken}`;

const headers = {
  'MLS-Aligned_User-Agent': mlsAppName,
  'Authorization': authToken,
  'OUID': mlsOuid,
  'Accept': 'application/json',
};

async function findGrandviewRealty() {
  console.log('🔍 Searching for Grandview Realty...\n');
  
  // Search through multiple pages to find Grandview Realty
  let skip = 0;
  const top = 25;
  let found = false;
  let grandviewData = null;
  
  // Search up to 20 pages (500 properties)
  for (let page = 0; page < 20 && !found; page++) {
    const url = `${mlsApiUrl}/Property?$top=${top}&$skip=${skip}&$select=ListOfficeName,ListOfficeMlsId,ListOfficeKey,ListingId,City`;
    
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (!data.value || data.value.length === 0) break;
      
      // Search for Grandview Realty (case-insensitive, partial match)
      const grandview = data.value.find(p => 
        p.ListOfficeName && 
        p.ListOfficeName.toLowerCase().includes('grandview')
      );
      
      if (grandview) {
        found = true;
        grandviewData = {
          name: grandview.ListOfficeName,
          mlsId: grandview.ListOfficeMlsId,
          key: grandview.ListOfficeKey,
          sampleListingId: grandview.ListingId,
          city: grandview.City
        };
        console.log('✅ Found Grandview Realty!');
        console.log('   Office Name:', grandviewData.name);
        console.log('   MLS ID:', grandviewData.mlsId);
        console.log('   Office Key:', grandviewData.key);
        console.log('   Sample Listing ID:', grandviewData.sampleListingId);
        console.log('   Sample City:', grandviewData.city);
        break;
      }
      
      skip += top;
      process.stdout.write(`Searched ${skip} properties...\r`);
    } catch (error) {
      console.error('Error:', error.message);
      break;
    }
  }
  
  if (!found) {
    console.log('\n⚠️  Grandview Realty not found in first 500 properties');
    console.log('   Try searching with a different query or check the exact office name');
  } else {
    console.log('\n---\n');
    console.log('📋 Use this filter in your queries:');
    if (grandviewData.mlsId) {
      console.log(`   ListOfficeMlsId eq '${grandviewData.mlsId}'`);
      console.log('\n   Example query:');
      console.log(`   ${mlsApiUrl}/Property?$filter=ListOfficeMlsId eq '${grandviewData.mlsId}'&$top=25`);
    } else {
      console.log('   ⚠️  MLS ID not found, you may need to filter client-side');
    }
  }
}

findGrandviewRealty().catch(console.error);

