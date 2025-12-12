import { NextRequest, NextResponse } from 'next/server';
import { PropertyCacheService } from '@/lib/property-cache';
import { AgentCacheService } from '@/lib/agent-cache';
import { AdminAuthService } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import { Property } from '@/lib/mred/types';

// Mark this route as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Maximum execution time: 60 seconds (Vercel Pro plan limit)
// Note: For longer operations, the cron job returns immediately and processes in background

// Rate limiting for cache refresh (prevent multiple simultaneous refreshes)
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 60 * 1000; // 1 minute minimum between refreshes

// Timeout wrapper to prevent function from exceeding limits
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

// Shared function for both GET and POST requests
async function refreshCache(isCronJob: boolean, adminEmail?: string) {
  try {
    if (isCronJob) {
      console.log('🕐 Cron job triggered - refreshing all caches...');
    } else {
      console.log(`👤 Manual cache refresh requested by admin: ${adminEmail}`);
      
      // Rate limiting for manual refreshes
      const now = Date.now();
      if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
        const remainingTime = Math.ceil((MIN_REFRESH_INTERVAL - (now - lastRefreshTime)) / 1000);
        throw new Error(`Rate limited. Please wait ${remainingTime} seconds before refreshing again.`);
      }
    }

    // Update last refresh time
    lastRefreshTime = Date.now();

    const startTime = Date.now();
    const results: {
      propertyCache: { success: boolean; count: number };
      agentCache: { success: boolean; count: number };
      pageCache: { success: boolean; paths: string[] };
      totalDuration: number;
    } = {
      propertyCache: { success: false, count: 0 },
      agentCache: { success: false, count: 0 },
      pageCache: { success: false, paths: [] },
      totalDuration: 0
    };

    // Step 1: Clear and refresh property cache (with timeout protection)
    console.log('🗑️ Clearing property cache...');
    try {
      await PropertyCacheService.clearCache();
      
      console.log('🔄 Fetching fresh properties from MLS API...');
      // For cron jobs, we use fetchFreshActiveProperties and fetchFreshUnderContractProperties
      // which are optimized for batch processing. For manual refreshes, use getAllProperties.
      let properties: Property[];
      
      if (isCronJob) {
        // Cron job: Use optimized batch fetching methods
        console.log('📦 Using optimized batch fetching for cron job...');
        const activeProperties = await PropertyCacheService.fetchFreshActiveProperties();
        const underContractProperties = await PropertyCacheService.fetchFreshUnderContractProperties();
        properties = [...activeProperties, ...underContractProperties];
        console.log(`✅ Fetched ${activeProperties.length} active + ${underContractProperties.length} under contract = ${properties.length} total properties`);
        
        // Save fetched properties to cache
        if (properties.length > 0) {
          console.log('💾 Saving properties to Supabase cache...');
          await PropertyCacheService.cacheAllProperties(properties);
          console.log(`✅ Successfully cached ${properties.length} properties to Supabase`);
        }
      } else {
        // Manual refresh: Use standard method with timeout
        // Set timeout to 50 seconds for property cache refresh (leave buffer for other operations)
        properties = await withTimeout(
          PropertyCacheService.getAllProperties(),
          50000, // 50 seconds - enough for most cases
          'Property cache refresh timed out after 50 seconds'
        );
        // Note: getAllProperties() already handles caching internally
      }
      
      results.propertyCache = { success: true, count: properties.length };
      console.log(`✅ Property cache refreshed! Loaded ${properties.length} properties`);
    } catch (error) {
      console.error('❌ Error refreshing property cache:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('timed out')) {
        console.error('⏱️ Property cache refresh exceeded timeout limit');
      }
      results.propertyCache = { success: false, count: 0 };
    }

    // Step 2: Clear and refresh agent cache (with timeout protection)
    console.log('🗑️ Clearing agent cache...');
    try {
      await AgentCacheService.clearAllAgentCache();
      
      console.log('🔄 Fetching fresh agent data...');
      // Set timeout to 10 seconds for agent cache refresh
      const agents = await withTimeout(
        AgentCacheService.getAllAgents(),
        10000,
        'Agent cache refresh timed out after 10 seconds'
      );
      
      results.agentCache = { success: true, count: agents.length };
      console.log(`✅ Agent cache refreshed! Loaded ${agents.length} agents`);
    } catch (error) {
      console.error('❌ Error refreshing agent cache:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('timed out')) {
        console.error('⏱️ Agent cache refresh exceeded timeout limit');
      }
      results.agentCache = { success: false, count: 0 };
    }

    // Step 3: Revalidate Next.js page caches
    console.log('🔄 Revalidating page caches...');
    try {
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
      
      results.pageCache = { success: true, paths: pathsToRevalidate };
      console.log('✅ Page cache revalidation completed!');
    } catch (error) {
      console.error('❌ Error revalidating page cache:', error);
      results.pageCache = { success: false, paths: [] };
    }

    // Calculate total duration
    results.totalDuration = Date.now() - startTime;

    const overallSuccess = results.propertyCache.success && 
                          results.agentCache.success && 
                          results.pageCache.success;

    console.log(`🎯 Cache refresh completed!`);
    console.log(`⏱️ Total duration: ${results.totalDuration}ms`);
    console.log(`✅ Overall success: ${overallSuccess ? 'YES' : 'PARTIAL'}`);

    return {
      success: overallSuccess,
      message: 'Cache refreshed successfully',
      results,
      timestamp: new Date().toISOString(),
      triggeredBy: isCronJob ? 'cron-job' : 'admin'
    };

  } catch (error) {
    console.error('❌ Error refreshing cache:', error);
    throw error;
  }
}

// GET handler for external cron services (cron-job.org, GitHub Actions, etc.)
export async function GET(request: NextRequest) {
  try {
    // Check for cron secret token (optional, for security)
    const cronSecret = request.headers.get('x-cron-secret') || request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, require it. Otherwise allow unauthenticated calls (for external cron services)
    if (expectedSecret && cronSecret !== expectedSecret) {
      console.warn('⚠️ Unauthorized cron attempt - missing or invalid secret');
      return NextResponse.json(
        { error: 'Unauthorized - valid cron secret required' },
        { status: 401 }
      );
    }
    
    console.log('🔍 GET handler called for /api/admin/refresh-cache (external cron)');
    
    // For external cron services (like cron-job.org), return immediately
    // Start the cache refresh asynchronously without blocking the response
    // Use void to explicitly mark as fire-and-forget
    void (async () => {
      try {
        console.log('🚀 Starting background cache refresh process...');
        const result = await withTimeout(
          refreshCache(true),
          290000, // 4 minutes 50 seconds - close to maxDuration limit
          'Cache refresh exceeded maximum execution time (4 minutes 50 seconds)'
        );
        console.log('✅ Background cache refresh completed:', result);
      } catch (error) {
        console.error('❌ Background cache refresh error:', error);
      }
    })();
    
    // Return immediately with 202 Accepted - don't wait for cache refresh
    // This prevents timeout issues with external cron services
    return NextResponse.json(
      { 
        success: true,
        message: 'Cache refresh initiated - processing in background',
        timestamp: new Date().toISOString(),
        triggeredBy: 'cron-job',
        note: 'This endpoint returns immediately. Cache refresh continues asynchronously.'
      },
      { status: 202 } // 202 Accepted - request accepted, processing continues
    );

  } catch (error) {
    console.error('❌ Error in GET refresh-cache:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to initiate cache refresh',
        error: errorMessage,
        timestamp: new Date().toISOString(),
        triggeredBy: 'cron-job'
      },
      { status: 500 }
    );
  }
}

// POST handler for manual admin refreshes and cron jobs
export async function POST(request: NextRequest) {
  try {
    // Check if this is a cron job request (Vercel cron jobs send a special header)
    const isCronJob = request.headers.get('x-vercel-cron') === '1';
    
    // If it's a cron job, return immediately and process in background (like GET handler)
    if (isCronJob) {
      console.log('🔍 POST handler called for /api/admin/refresh-cache (Vercel cron job)');
      
      // Start the cache refresh asynchronously without blocking the response
      void (async () => {
        try {
          console.log('🚀 Starting background cache refresh process...');
          const result = await refreshCache(true);
          console.log('✅ Background cache refresh completed:', result);
        } catch (error) {
          console.error('❌ Background cache refresh error:', error);
        }
      })();
      
      // Return immediately with 202 Accepted - don't wait for cache refresh
      return NextResponse.json(
        { 
          success: true,
          message: 'Cache refresh initiated - processing in background',
          timestamp: new Date().toISOString(),
          triggeredBy: 'cron-job',
          note: 'This endpoint returns immediately. Cache refresh continues asynchronously.'
        },
        { status: 202 } // 202 Accepted - request accepted, processing continues
      );
    }
    
    // For manual requests, require admin authentication
    const { adminEmail } = await request.json();
    
    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const isAdmin = await AdminAuthService.isAdmin(adminEmail);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For manual requests, also add timeout protection
    try {
      const result = await withTimeout(
        refreshCache(false, adminEmail),
        55000, // 55 seconds - leave buffer for other operations
        'Cache refresh exceeded maximum execution time (55 seconds)'
      );
      return NextResponse.json(result);
    } catch (timeoutError) {
      // If timeout occurs, return partial success response
      console.error('⏱️ Cache refresh timed out, but may have partially completed');
      return NextResponse.json(
        { 
          success: false,
          message: 'Cache refresh timed out - may have partially completed',
          error: timeoutError instanceof Error ? timeoutError.message : 'Timeout error',
          timestamp: new Date().toISOString(),
          triggeredBy: 'admin'
        },
        { status: 202 } // 202 Accepted - request accepted but not completed
      );
    }

  } catch (error) {
    console.error('❌ Error in POST refresh-cache:', error);
    
    if (error instanceof Error && error.message.includes('Rate limited')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    // Handle timeout errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('timeout') || errorMessage.includes('exceeded')) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Cache refresh timed out - may have partially completed',
          error: errorMessage,
          timestamp: new Date().toISOString(),
          triggeredBy: 'admin'
        },
        { status: 202 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to refresh cache', details: errorMessage },
      { status: 500 }
    );
  }
} 