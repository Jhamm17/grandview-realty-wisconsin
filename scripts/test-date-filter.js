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

async function testDateFilter() {
  console.log('🧪 Testing Date Filter for Last 6 Months...\n');
  
  // Calculate date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateStr = sixMonthsAgo.toISOString().split('.')[0];
  
  console.log('Date 6 months ago:', dateStr);
  console.log('Current date:', new Date().toISOString().split('.')[0]);
  console.log('');
  
  // Test 1: Using datetime'...' format
  console.log('Test 1: Using datetime format');
  const filter1 = `(MlsStatus eq 'Active' or MlsStatus eq 'UnderContract') and ModificationTimestamp ge datetime'${dateStr}'`;
  const url1 = `${mlsApiUrl}/Property?$top=5&$filter=${encodeURIComponent(filter1)}&$count=true`;
  console.log('Filter:', filter1);
  console.log('URL:', url1);
  
  try {
    const response1 = await fetch(url1, { headers });
    const data1 = await response1.json();
    
    if (response1.ok && data1.value) {
      console.log(`✅ Success! Got ${data1.value.length} results`);
      console.log(`   Total count: ${data1['@odata.count'] || 'unknown'}`);
      if (data1.value.length > 0) {
        console.log('   Sample ModificationTimestamp:', data1.value[0].ModificationTimestamp);
      }
    } else {
      console.log(`❌ Error: ${response1.status}`);
      console.log('Response:', JSON.stringify(data1, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Using year/month/day functions (alternative approach)
  console.log('Test 2: Using year/month/day functions');
  const year = sixMonthsAgo.getFullYear();
  const month = sixMonthsAgo.getMonth() + 1;
  const day = sixMonthsAgo.getDate();
  
  // This is more complex - we'd need to check if year/month/day >= our target
  // For simplicity, let's just test if the API accepts this format
  const filter2 = `(MlsStatus eq 'Active' or MlsStatus eq 'UnderContract') and year(ModificationTimestamp) ge ${year}`;
  const url2 = `${mlsApiUrl}/Property?$top=5&$filter=${encodeURIComponent(filter2)}&$count=true`;
  console.log('Filter:', filter2);
  console.log('URL:', url2);
  
  try {
    const response2 = await fetch(url2, { headers });
    const data2 = await response2.json();
    
    if (response2.ok && data2.value) {
      console.log(`✅ Success! Got ${data2.value.length} results`);
      console.log(`   Total count: ${data2['@odata.count'] || 'unknown'}`);
    } else {
      console.log(`❌ Error: ${response2.status}`);
      console.log('Response:', JSON.stringify(data2, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n---\n');
  console.log('📋 Recommendation:');
  console.log('   If Test 1 works, use: ModificationTimestamp ge datetime\'YYYY-MM-DDTHH:MM:SS\'');
  console.log('   If Test 1 fails, try using year/month/day functions or contact API provider');
}

testDateFilter().catch(console.error);

