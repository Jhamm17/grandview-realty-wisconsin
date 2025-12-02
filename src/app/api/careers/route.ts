import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mark this route as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lazy-initialize Supabase client to avoid build-time errors
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL!,
    process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data: careers, error } = await supabase
      .from('careers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching careers:', error);
      return NextResponse.json({ error: 'Failed to fetch careers' }, { status: 500 });
    }

    console.log('Fetched careers:', careers); // Debug log

    // Set cache control headers to prevent caching
    const response = NextResponse.json({ careers });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error in GET /api/careers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 