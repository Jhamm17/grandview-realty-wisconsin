import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a service role client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
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