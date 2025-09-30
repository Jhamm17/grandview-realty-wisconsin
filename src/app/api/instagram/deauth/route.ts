import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    // Log the deauthorization request
    console.log('Instagram deauthorization request for user:', user_id);

    // Here you would typically:
    // 1. Remove the user's access token from your database
    // 2. Clean up any cached data for this user
    // 3. Update your app's state

    // For now, we'll just acknowledge the request
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instagram deauthorization error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 