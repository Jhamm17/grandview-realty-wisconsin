#!/usr/bin/env tsx

/**
 * Standalone script to refresh property and agent cache
 * Runs directly in GitHub Actions (not via Vercel API)
 * This allows the full 20-minute script to run without Vercel timeout limits
 * 
 * Usage:
 *   npx tsx scripts/refresh-cache-standalone.ts
 * 
 * Environment variables required:
 *   - NEXT_PUBLIC_WISCONSIN_SUPABASE_URL
 *   - WISCONSIN_SUPABASE_SERVICE_ROLE_KEY
 *   - WISCONSIN_MLS_ACCESS_TOKEN
 *   - WISCONSIN_MLS_API_URL (optional)
 *   - WISCONSIN_MLS_OUID (optional)
 *   - MLS_Aligned_User_Agent (optional)
 */

import { PropertyCacheService } from '../src/lib/property-cache';
import { AgentCacheService } from '../src/lib/agent-cache';

async function refreshCache() {
  const startTime = Date.now();
  console.log('🚀 Starting cache refresh (running directly in GitHub Actions)...');
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL || !process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_WISCONSIN_SUPABASE_URL');
    console.error('   - WISCONSIN_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const results = {
    properties: { success: false, count: 0, error: null as string | null },
    agents: { success: false, count: 0, error: null as string | null },
    totalDuration: 0
  };

  // Step 1: Refresh property cache
  console.log('📊 Step 1: Refreshing property cache...');
  try {
    // Clear existing cache
    console.log('   🗑️  Clearing existing property cache...');
    await PropertyCacheService.clearCache();
    
    // Fetch fresh properties (this will take ~20 minutes)
    console.log('   🔄 Fetching fresh properties from MLS API...');
    console.log('   ⏳ This may take 20+ minutes depending on property count...');
    
    const activeProperties = await PropertyCacheService.fetchFreshActiveProperties();
    console.log(`   ✅ Fetched ${activeProperties.length} active properties`);
    
    const underContractProperties = await PropertyCacheService.fetchFreshUnderContractProperties();
    console.log(`   ✅ Fetched ${underContractProperties.length} under contract properties`);
    
    const allProperties = [...activeProperties, ...underContractProperties];
    console.log(`   📦 Total properties: ${allProperties.length}`);
    
    // Cache all properties
    if (allProperties.length > 0) {
      console.log('   💾 Caching properties to Supabase...');
      await PropertyCacheService.cacheAllProperties(allProperties);
      console.log(`   ✅ Successfully cached ${allProperties.length} properties to Supabase`);
    } else {
      console.warn('   ⚠️  No properties fetched - cache may be empty');
    }
    
    results.properties = { success: true, count: allProperties.length, error: null };
  } catch (error) {
    console.error('   ❌ Error refreshing property cache:', error);
    results.properties = { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }

  console.log(''); // Blank line

  // Step 2: Refresh agent cache
  console.log('👥 Step 2: Refreshing agent cache...');
  try {
    console.log('   🗑️  Clearing existing agent cache...');
    await AgentCacheService.clearAllAgentCache();
    
    console.log('   🔄 Fetching fresh agent data...');
    const agents = await AgentCacheService.getAllAgents();
    console.log(`   ✅ Successfully refreshed ${agents.length} agents`);
    
    results.agents = { success: true, count: agents.length, error: null };
  } catch (error) {
    console.error('   ❌ Error refreshing agent cache:', error);
    results.agents = { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }

  // Calculate total duration
  results.totalDuration = Date.now() - startTime;
  const durationMinutes = Math.floor(results.totalDuration / 60000);
  const durationSeconds = Math.floor((results.totalDuration % 60000) / 1000);

  console.log(''); // Blank line
  console.log('🎯 Cache refresh completed!');
  console.log(`⏱️  Total duration: ${durationMinutes}m ${durationSeconds}s (${results.totalDuration}ms)`);
  console.log(`📊 Properties: ${results.properties.count} ${results.properties.success ? '✅' : '❌'}`);
  console.log(`👥 Agents: ${results.agents.count} ${results.agents.success ? '✅' : '❌'}`);
  console.log(`✅ Overall success: ${results.properties.success && results.agents.success ? 'YES' : 'PARTIAL'}`);
  console.log(`⏰ Completed at: ${new Date().toISOString()}`);

  // Exit with appropriate code
  if (results.properties.success && results.agents.success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run the refresh
refreshCache().catch(error => {
  console.error('❌ Fatal error:', error);
  console.error('Error stack:', error.stack);
  process.exit(1);
});
