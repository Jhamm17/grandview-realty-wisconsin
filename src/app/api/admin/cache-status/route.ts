import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AdminAuthService } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    // Check for admin authentication
    const authHeader = request.headers.get('authorization');
    const adminEmail = request.headers.get('x-admin-email');
    
    if (!authHeader || !adminEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin authentication required' },
        { status: 401 }
      );
    }

    // Verify admin status
    const isAdmin = await AdminAuthService.isAdmin(adminEmail);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied - Not an admin user' },
        { status: 403 }
      );
    }

    // Get cache statistics
    const { data: properties, error: propertiesError } = await supabase
      .from('property_cache')
      .select('*');

    if (propertiesError) {
      throw new Error(`Database error: ${propertiesError.message}`);
    }

    // Get the most recent cache update
    const { data: latestUpdate, error: latestError } = await supabase
      .from('property_cache')
      .select('last_updated')
      .order('last_updated', { ascending: false })
      .limit(1);

    if (latestError) {
      throw new Error(`Database error: ${latestError.message}`);
    }

    // Calculate statistics
    const totalProperties = properties?.length || 0;
    const activeProperties = properties?.filter(p => p.is_active).length || 0;
    const propertiesWithImages = properties?.filter(p => 
      p.property_data?.Media && p.property_data.Media.length > 0
    ).length || 0;

    const lastUpdated = latestUpdate?.[0]?.last_updated || null;
    const cacheAge = lastUpdated ? 
      Math.floor((Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60)) : 
      null; // hours

    return NextResponse.json({
      success: true,
      cache: {
        totalProperties,
        activeProperties,
        propertiesWithImages,
        lastUpdated,
        cacheAgeHours: cacheAge,
        isStale: cacheAge !== null && cacheAge > 2 // Consider stale if older than 2 hours
      },
      cronJob: {
        schedule: 'Every day at 6 AM (0 6 * * *)',
        endpoint: '/api/admin/refresh-cache',
        status: 'active'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting cache status:', error);
    return NextResponse.json(
      { error: 'Failed to get cache status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 