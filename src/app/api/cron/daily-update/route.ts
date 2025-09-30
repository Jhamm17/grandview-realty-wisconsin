import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { PropertyCacheService } from '@/lib/property-cache';
import { AgentCacheService } from '@/lib/agent-cache';
import { mlsGridService } from '@/lib/mred/api';

// Rate limiting utility
class RateLimiter {
  private lastRequestTime = 0;
  private requestCount = 0;
  private readonly maxRequestsPerSecond = 2;
  private readonly windowSize = 1000; // 1 second in milliseconds

  async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    
    // Reset counter if we're in a new window
    if (now - this.lastRequestTime >= this.windowSize) {
      this.requestCount = 0;
    }
    
    // If we've hit the limit, wait until the next window
    if (this.requestCount >= this.maxRequestsPerSecond) {
      const waitTime = this.windowSize - (now - this.lastRequestTime);
      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.lastRequestTime = Date.now();
      }
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
  }
}

// MRED API service with rate limiting
class MREDAPIService {
  private rateLimiter = new RateLimiter();
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  private async getAccessToken(): Promise<string> {
    try {
      // Use the existing MLSGRID_ACCESS_TOKEN from environment variables
      const accessToken = process.env.MLSGRID_ACCESS_TOKEN;
      
      if (!accessToken) {
        throw new Error('MLSGRID_ACCESS_TOKEN not configured');
      }

      console.log('✅ Using existing MLSGRID_ACCESS_TOKEN');
      return accessToken;
    } catch (error) {
      console.error('Error getting MRED access token:', error);
      throw error;
    }
  }

  private async makeAPIRequest<T>(endpoint: string, token: string): Promise<T> {
    await this.rateLimiter.waitForNextRequest();

    const apiUrl = process.env.MRED_API_URL || 'https://api.mlsgrid.com/v2';
    const url = `${apiUrl}/${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} - ${endpoint}`);
    }

    return response.json();
  }

  async updateProperties(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      console.log('🔄 Fetching properties using existing API service...');
      
      // Fetch Active properties using the same approach as PropertyCacheService
      console.log('🔄 Fetching Active properties using PropertyCacheService...');
      const activeProperties = await PropertyCacheService.fetchFreshActiveProperties();
      console.log(`✅ Fetched ${activeProperties.length} Active properties from MRED API`);

      // Fetch Active Under Contract properties using the same approach as PropertyCacheService
      console.log('🔄 Fetching Active Under Contract properties using PropertyCacheService...');
      const underContractProperties = await PropertyCacheService.fetchFreshUnderContractProperties();
      console.log(`✅ Fetched ${underContractProperties.length} Active Under Contract properties from MRED API`);

      // Combine all properties
      const allProperties = [...activeProperties, ...underContractProperties];
      
      console.log(`✅ Total properties fetched: ${allProperties.length}`);

      // Clear existing property cache
      await PropertyCacheService.clearCache();
      
      // Store properties in cache using the existing method
      await PropertyCacheService.cacheAllProperties(allProperties);

      return { success: true, count: allProperties.length };
    } catch (error) {
      console.error('❌ Error updating properties:', error);
      return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateAgents(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      console.log('🔄 Getting fresh MRED access token for agents...');
      const token = await this.getAccessToken();

      console.log('🔄 Fetching agents from MRED API...');
      const agents = await this.makeAPIRequest<{ value: any[] }>('Member?$filter=MemberType eq \'Agent\'&$top=1000&$select=MemberKey,MemberFirstName,MemberLastName,MemberEmail,MemberPreferredPhone,OfficeKey,OfficeName', token);
      
      console.log(`✅ Fetched ${agents.value.length} agents from MRED API`);

      // Clear existing agent cache
      await AgentCacheService.clearAllAgentCache();

      // Update agent data in Supabase
      for (const agent of agents.value) {
        const agentEmail = agent.MemberEmail;
        if (agentEmail) {
          // Find existing agent by email
          const { data: existingAgent } = await this.supabase
            .from('agents')
            .select('*')
            .eq('email', agentEmail)
            .single();

          if (existingAgent) {
            // Update existing agent with fresh data
            await this.supabase
              .from('agents')
              .update({
                name: `${agent.MemberFirstName} ${agent.MemberLastName}`,
                phone: agent.MemberPreferredPhone,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingAgent.id);
          }
        }
      }

      // Refresh agent cache
      await AgentCacheService.getAllAgents();

      return { success: true, count: agents.value.length };
    } catch (error) {
      console.error('❌ Error updating agents:', error);
      return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateOffices(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      console.log('🔄 Getting fresh MRED access token for offices...');
      const token = await this.getAccessToken();

      console.log('🔄 Fetching offices from MRED API...');
      const offices = await this.makeAPIRequest<{ value: any[] }>('Office?$top=1000&$select=OfficeKey,OfficeName,OfficeAddress1,OfficeCity,OfficeStateOrProvince,OfficePostalCode,OfficePhone', token);
      
      console.log(`✅ Fetched ${offices.value.length} offices from MRED API`);

      // Update office data in Supabase if needed
      // This could be used to update office staff information
      for (const office of offices.value) {
        if (office.OfficeName === 'Grandview Realty') {
          // Update office information
          await this.supabase
            .from('office_staff')
            .update({
              office_address: office.OfficeAddress1,
              office_city: office.OfficeCity,
              office_state: office.OfficeStateOrProvince,
              office_zip: office.OfficePostalCode,
              office_phone: office.OfficePhone,
              updated_at: new Date().toISOString()
            })
            .eq('office_name', 'Grandview Realty');
        }
      }

      return { success: true, count: offices.value.length };
    } catch (error) {
      console.error('❌ Error updating offices:', error);
      return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Main cron job handler
export async function GET() {
  const startTime = Date.now();
  console.log('🚀 Daily update cron job started');

  try {
    const mredService = new MREDAPIService();
    const results: {
      properties: { success: boolean; count: number; error?: string };
      agents: { success: boolean; count: number; error?: string };
      offices: { success: boolean; count: number; error?: string };
      pageCache: { success: boolean; paths: string[] };
      totalDuration: number;
    } = {
      properties: { success: false, count: 0 },
      agents: { success: false, count: 0 },
      offices: { success: false, count: 0 },
      pageCache: { success: false, paths: [] },
      totalDuration: 0
    };

    // Step 1: Update properties
    console.log('📊 Step 1: Updating properties...');
    results.properties = await mredService.updateProperties();

    // Step 2: Update agents
    console.log('👥 Step 2: Updating agents...');
    results.agents = await mredService.updateAgents();

    // Step 3: Update offices
    console.log('🏢 Step 3: Updating offices...');
    results.offices = await mredService.updateOffices();

    // Step 4: Revalidate page caches
    console.log('🔄 Step 4: Revalidating page caches...');
    try {
      const pathsToRevalidate = [
        '/team/agents',
        '/team/office-staff', 
        '/careers',
        '/properties',
        '/',
        '/properties/under-contract'
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

    const overallSuccess = results.properties.success && 
                          results.agents.success && 
                          results.offices.success && 
                          results.pageCache.success;

    console.log(`🎯 Daily update completed!`);
    console.log(`⏱️ Total duration: ${results.totalDuration}ms`);
    console.log(`✅ Overall success: ${overallSuccess ? 'YES' : 'PARTIAL'}`);
    console.log(`📊 Properties: ${results.properties.count} updated`);
    console.log(`👥 Agents: ${results.agents.count} updated`);
    console.log(`🏢 Offices: ${results.offices.count} updated`);

    return NextResponse.json({
      success: overallSuccess,
      message: 'Daily update completed successfully',
      results,
      timestamp: new Date().toISOString(),
      triggeredBy: 'cron-job'
    });

  } catch (error) {
    console.error('❌ Error in daily update cron job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete daily update', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
