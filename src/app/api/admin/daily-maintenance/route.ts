import { NextRequest, NextResponse } from 'next/server';
import { PropertyCacheService } from '@/lib/property-cache';
import { AgentCacheService } from '@/lib/agent-cache';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Check if this is a cron job request (Vercel cron jobs send a special header)
    const isCronJob = request.headers.get('x-vercel-cron') === '1';
    
    if (!isCronJob) {
      return NextResponse.json(
        { error: 'This endpoint is only accessible via cron jobs' },
        { status: 403 }
      );
    }

    console.log('🕐 Daily maintenance cron job started...');
    const startTime = Date.now();

    const results = {
      cacheRefresh: { success: false, details: {} },
      redeployment: { success: false, details: {} },
      totalDuration: 0
    };

    // Step 1: Refresh all caches
    console.log('🔄 Step 1: Refreshing all caches...');
    try {
      const cacheResults: {
        propertyCache: { success: boolean; count: number };
        agentCache: { success: boolean; count: number };
        pageCache: { success: boolean; paths: string[] };
      } = {
        propertyCache: { success: false, count: 0 },
        agentCache: { success: false, count: 0 },
        pageCache: { success: false, paths: [] }
      };

      // Clear and refresh property cache
      try {
        console.log('🗑️ Clearing property cache...');
        await PropertyCacheService.clearCache();
        
        console.log('🔄 Fetching fresh properties from MLS API...');
        const properties = await PropertyCacheService.getAllProperties();
        
        cacheResults.propertyCache = { success: true, count: properties.length };
        console.log(`✅ Property cache refreshed! Loaded ${properties.length} properties`);
      } catch (error) {
        console.error('❌ Error refreshing property cache:', error);
        cacheResults.propertyCache = { success: false, count: 0 };
      }

      // Clear and refresh agent cache
      try {
        console.log('🗑️ Clearing agent cache...');
        await AgentCacheService.clearAllAgentCache();
        
        console.log('🔄 Fetching fresh agent data...');
        const agents = await AgentCacheService.getAllAgents();
        
        cacheResults.agentCache = { success: true, count: agents.length };
        console.log(`✅ Agent cache refreshed! Loaded ${agents.length} agents`);
      } catch (error) {
        console.error('❌ Error refreshing agent cache:', error);
        cacheResults.agentCache = { success: false, count: 0 };
      }

      // Revalidate Next.js page caches
      try {
        console.log('🔄 Revalidating page caches...');
        const pathsToRevalidate = [
          '/team/agents',
          '/team/office-staff', 
          '/careers',
          '/properties',
          '/'
        ];
        
        for (const path of pathsToRevalidate) {
          revalidatePath(path);
          console.log(`✅ Revalidated: ${path}`);
        }
        
        cacheResults.pageCache = { success: true, paths: pathsToRevalidate };
        console.log('✅ Page cache revalidation completed!');
      } catch (error) {
        console.error('❌ Error revalidating page cache:', error);
        cacheResults.pageCache = { success: false, paths: [] };
      }

      const cacheSuccess = cacheResults.propertyCache.success && 
                          cacheResults.agentCache.success && 
                          cacheResults.pageCache.success;

      results.cacheRefresh = { success: cacheSuccess, details: cacheResults };
      console.log(`🎯 Cache refresh completed! Success: ${cacheSuccess ? 'YES' : 'PARTIAL'}`);

    } catch (error) {
      console.error('❌ Error in cache refresh step:', error);
      results.cacheRefresh = { success: false, details: { error: error instanceof Error ? error.message : 'Unknown error' } };
    }

    // Step 2: Trigger redeployment (only if cache refresh was successful)
    if (results.cacheRefresh.success) {
      console.log('🚀 Step 2: Triggering redeployment...');
      try {
        // Check if we have the required environment variables
        const vercelToken = process.env.VERCEL_TOKEN;
        const vercelProjectId = process.env.VERCEL_PROJECT_ID;
        const vercelTeamId = process.env.VERCEL_TEAM_ID; // Optional

        if (!vercelToken || !vercelProjectId) {
          console.error('❌ Missing Vercel configuration');
          results.redeployment = { success: false, details: { error: 'Missing Vercel configuration' } };
        } else {
          // Prepare the deployment request
          const deploymentData = {
            name: 'grandview-realty',
            target: 'production',
            alias: ['grandviewsells.com'],
            // Force a fresh deployment by adding a timestamp
            env: {
              REDEPLOY_TIMESTAMP: new Date().toISOString()
            }
          };

          // Build the API URL
          const baseUrl = 'https://api.vercel.com/v1';
          const url = vercelTeamId 
            ? `${baseUrl}/teams/${vercelTeamId}/projects/${vercelProjectId}/deployments`
            : `${baseUrl}/projects/${vercelProjectId}/deployments`;

          // Make the deployment request
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${vercelToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(deploymentData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Vercel API error:', response.status, errorText);
            results.redeployment = { success: false, details: { error: errorText, status: response.status } };
          } else {
            const deployment = await response.json();
            
            console.log('✅ Redeployment triggered successfully!');
            console.log(`📋 Deployment ID: ${deployment.id}`);
            console.log(`🔗 Deployment URL: ${deployment.url}`);

            results.redeployment = { 
              success: true, 
              details: {
                id: deployment.id,
                url: deployment.url,
                status: deployment.status,
                createdAt: deployment.createdAt
              }
            };
          }
        }
      } catch (error) {
        console.error('❌ Error in redeployment step:', error);
        results.redeployment = { success: false, details: { error: error instanceof Error ? error.message : 'Unknown error' } };
      }
    } else {
      console.log('⚠️ Skipping redeployment due to cache refresh failure');
      results.redeployment = { success: false, details: { error: 'Skipped due to cache refresh failure' } };
    }

    // Calculate total duration
    results.totalDuration = Date.now() - startTime;

    const overallSuccess = results.cacheRefresh.success && results.redeployment.success;
    
    console.log(`🎯 Daily maintenance completed!`);
    console.log(`⏱️ Total duration: ${results.totalDuration}ms`);
    console.log(`✅ Overall success: ${overallSuccess ? 'YES' : 'PARTIAL'}`);

    return NextResponse.json({
      success: overallSuccess,
      message: 'Daily maintenance completed',
      results,
      timestamp: new Date().toISOString(),
      triggeredBy: 'cron-job'
    });

  } catch (error) {
    console.error('❌ Error in daily maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to complete daily maintenance', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
