import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/admin-auth';

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

    console.log(`🧪 Manual daily update test triggered by admin: ${adminEmail}`);

    // Call the daily update endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/cron/daily-update`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    return NextResponse.json({
      success: response.ok,
      message: 'Daily update test completed',
      result,
      timestamp: new Date().toISOString(),
      triggeredBy: 'admin-test'
    });

  } catch (error) {
    console.error('❌ Error in test daily update:', error);
    return NextResponse.json(
      { error: 'Failed to test daily update', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
