import { NextResponse } from 'next/server';
import { PropertyCacheService } from '@/lib/property-cache';

export async function GET() {
  try {
    console.log('[API] Fetching all properties...');
    const properties = await PropertyCacheService.getAllProperties();
    
    console.log(`[API] Returning ${properties.length} properties`);
    
    return NextResponse.json({
      properties,
      cached: true, // Always cached now through Supabase
      lastUpdated: new Date().toISOString(),
      totalCount: properties.length
    });
    
  } catch (error) {
    console.error('[API] Error in properties API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
} 