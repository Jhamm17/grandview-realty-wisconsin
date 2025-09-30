import { NextResponse } from 'next/server';
import { PropertyCacheService } from '@/lib/property-cache';

export async function GET() {
  try {
    console.log('[API] Fetching under contract properties...');
    const underContractProperties = await PropertyCacheService.getUnderContractProperties();
    
    console.log(`[API] Returning ${underContractProperties.length} under contract properties`);
    
    return NextResponse.json({
      properties: underContractProperties,
      cached: true,
      lastUpdated: new Date().toISOString(),
      totalCount: underContractProperties.length,
      status: 'under-contract'
    });
    
  } catch (error) {
    console.error('[API] Error in under contract properties API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch under contract properties' },
      { status: 500 }
    );
  }
} 