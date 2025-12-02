import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { InstagramScraper } from '@/lib/instagram-scraper';

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧪 Testing Instagram scraper and database population...');

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL!,
      process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch Instagram posts using the scraper
    const instagramPosts = await InstagramScraper.fetchLatestPosts('grandviewrealtygeneva', 8);

    console.log(`📸 Found ${instagramPosts.length} Instagram posts`);

    if (instagramPosts.length === 0) {
      console.log('❌ No real Instagram posts found');
      return NextResponse.json({ 
        success: false, 
        message: 'No Instagram posts found',
        postsCount: 0 
      });
    }

    // Store posts in database
    const { error: upsertError } = await supabase
      .from('instagram_posts')
      .upsert(
        instagramPosts.map((post) => ({
          post_url: post.url,
          caption: post.caption,
          media_url: post.mediaUrl,
          timestamp: post.timestamp,
          is_active: true
        })),
        { onConflict: 'post_url' }
      );

    if (upsertError) {
      console.error('❌ Error storing posts:', upsertError);
      return NextResponse.json({ 
        success: false, 
        error: upsertError.message 
      });
    }

    console.log('✅ Successfully stored posts in database');
    return NextResponse.json({ 
      success: true, 
      postsCount: instagramPosts.length,
      message: `Successfully stored ${instagramPosts.length} Instagram posts`
    });

  } catch (error) {
    console.error('❌ Error in cron job:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

 