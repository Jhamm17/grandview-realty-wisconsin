import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('📸 Instagram feed is now powered by Juicer');

    // Since we're using Juicer embed, we'll return a simple response
    // indicating that the feed is handled by the frontend component
    return NextResponse.json({
      success: true,
      message: 'Instagram feed is powered by Juicer embed',
      provider: 'juicer',
      feedUrl: 'https://www.juicer.io/embed/grandviewrealtygeneva/embed-code.js'
    });

  } catch (error) {
    console.error('❌ Error with Instagram API:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({
      success: false,
      error: 'Instagram feed is handled by Juicer embed'
    });
  }
} 