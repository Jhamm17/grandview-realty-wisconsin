import { NextRequest, NextResponse } from 'next/server';
import { PropertyCacheService } from '@/lib/property-cache';
import { AgentCacheService } from '@/lib/agent-cache';
import { AdminAuthService } from '@/lib/admin-auth';
import { revalidatePath } from 'next/cache';

// Rate limiting for cache refresh (prevent multiple simultaneous refreshes)
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 60 * 1000; // 1 minute minimum between refreshes

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

    // Step 1: Clear and refresh property cache
    console.log('🗑️ Clearing property cache...');
    try {
      await PropertyCacheService.clearCache();
      
      console.log('🔄 Fetching fresh properties from MLS API...');
      const properties = await PropertyCacheService.getAllProperties();
      
      results.propertyCache = { success: true, count: properties.length };
      console.log(`✅ Property cache refreshed! Loaded ${properties.length} properties`);
    } catch (error) {
      console.error('❌ Error refreshing property cache:', error);
      results.propertyCache = { success: false, count: 0 };
    }

    // Step 2: Clear and refresh agent cache
    console.log('🗑️ Clearing agent cache...');
    try {
      await AgentCacheService.clearAllAgentCache();
      
      console.log('🔄 Fetching fresh agent data...');
      const agents = await AgentCacheService.getAllAgents();
      
      results.agentCache = { success: true, count: agents.length };
      console.log(`✅ Agent cache refreshed! Loaded ${agents.length} agents`);
    } catch (error) {
      console.error('❌ Error refreshing agent cache:', error);
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

// GET handler for Vercel cron jobs
export async function GET() {
  try {
    console.log('🔍 GET handler called for /api/admin/refresh-cache');
    
    const result = await refreshCache(true);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in GET refresh-cache:', error);
    return NextResponse.json(
      { error: 'Failed to refresh cache', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST handler for manual admin refreshes
export async function POST(request: NextRequest) {
  try {
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

    const result = await refreshCache(false, adminEmail);
    return NextResponse.json(result);

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
    
    return NextResponse.json(
      { error: 'Failed to refresh cache', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 