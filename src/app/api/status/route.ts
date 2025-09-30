import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get cache status from our properties API
    const propertiesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/properties`);
    const propertiesData = await propertiesResponse.json();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      cache: {
        properties: {
          cached: propertiesData.cached || false,
          stale: propertiesData.stale || false,
          lastUpdated: propertiesData.lastUpdated,
          totalCount: propertiesData.totalCount || 0
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasAccessToken: Boolean(process.env.MLSGRID_ACCESS_TOKEN)
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 