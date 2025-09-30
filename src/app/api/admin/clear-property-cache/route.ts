import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/admin-auth';
import { PropertyCacheService } from '@/lib/property-cache';

export async function POST(request: NextRequest) {
  try {
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

    console.log(`🗑️ Clearing property cache triggered by admin: ${adminEmail}`);

    // Clear the property cache
    await PropertyCacheService.clearCache();

    return NextResponse.json({
      success: true,
      message: 'Property cache cleared successfully. Next property request will fetch fresh data from API.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error clearing property cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear property cache' },
      { status: 500 }
    );
  }
}


