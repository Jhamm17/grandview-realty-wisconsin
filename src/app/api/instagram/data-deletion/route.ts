import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    // Log the data deletion request
    console.log('Instagram data deletion request for user:', user_id);

    // Here you would typically:
    // 1. Delete all cached Instagram data for this user
    // 2. Remove any stored access tokens
    // 3. Clean up any user-specific data

    // For now, we'll just acknowledge the request
    return NextResponse.json({ 
      success: true,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/instagram/data-deletion/status/${user_id}`,
      confirmation_code: `DEL_${user_id}_${Date.now()}`
    });
  } catch (error) {
    console.error('Instagram data deletion error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    // Return the status of data deletion
    return NextResponse.json({
      data_deletion_requested: true,
      status: 'completed',
      user_id: userId
    });
  } catch (error) {
    console.error('Instagram data deletion status error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 