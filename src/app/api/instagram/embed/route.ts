import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Validate that it's an Instagram URL
    if (!url.includes('instagram.com')) {
      return NextResponse.json({ error: 'Invalid Instagram URL' }, { status: 400 });
    }

    // Fetch Instagram oEmbed data
    const response = await axios.get('https://api.instagram.com/oembed', {
      params: {
        url: url,
        maxwidth: 540,
        hidecaption: false,
        omitscript: true
      },
      timeout: 10000
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Instagram oEmbed error:', error);
    
    // Return a fallback response
    return NextResponse.json({
      error: 'Failed to fetch Instagram post',
      fallback: {
        title: 'Instagram Post',
        thumbnail_url: '/property-1.jpg',
        author_name: 'Grandview Realty',
        provider_name: 'Instagram'
      }
    }, { status: 500 });
  }
} 