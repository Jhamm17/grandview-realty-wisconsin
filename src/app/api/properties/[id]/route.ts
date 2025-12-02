import { NextRequest, NextResponse } from 'next/server';
import { PropertyCacheService } from '@/lib/property-cache';

// Mark this route as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`[API] Fetching property: ${id}`);
    
    const property = await PropertyCacheService.getProperty(id);
    
    if (!property) {
      console.log(`[API] Property not found: ${id}`);
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    console.log(`[API] Found property: ${id}`);
    return NextResponse.json({
      property,
      cached: true, // Always cached now through Supabase
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[API] Error in individual property API route:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
} 