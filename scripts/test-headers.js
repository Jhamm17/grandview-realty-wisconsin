require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Environment Variables and Headers...\n');

// Check what values we're actually getting
const mlsToken = process.env.WISCONSIN_MLS_ACCESS_TOKEN;
const mlsOuid = process.env.WISCONSIN_MLS_OUID;
const mlsAppName = process.env['MLS-Aligned-User-Agent'] || process.env.WISCONSIN_MLS_APP_NAME;

console.log('Environment Variables:');
console.log('  WISCONSIN_MLS_ACCESS_TOKEN:', mlsToken ? `✅ "${mlsToken.substring(0, 15)}..." (length: ${mlsToken.length})` : '❌ NOT SET');
console.log('  WISCONSIN_MLS_OUID:', mlsOuid ? `✅ "${mlsOuid}"` : '❌ NOT SET');
console.log('  MLS-Aligned-User-Agent:', process.env['MLS-Aligned-User-Agent'] ? `✅ "${process.env['MLS-Aligned-User-Agent']}"` : '❌ NOT SET');
console.log('  WISCONSIN_MLS_APP_NAME:', process.env.WISCONSIN_MLS_APP_NAME ? `✅ "${process.env.WISCONSIN_MLS_APP_NAME}"` : '❌ NOT SET');
console.log('  Final App Name (used):', mlsAppName ? `✅ "${mlsAppName}"` : '❌ NOT SET');

console.log('\n📤 Headers that will be sent:');
console.log('  MLS-Aligned-User-Agent:', mlsAppName || 'MISSING');
console.log('  Authorization:', mlsToken ? `Bearer ${mlsToken.substring(0, 15)}...` : 'MISSING');
console.log('  OUID:', mlsOuid || 'MISSING');
console.log('  Accept: application/json');

console.log('\n✅ If all values above are set correctly, the headers should work!');

