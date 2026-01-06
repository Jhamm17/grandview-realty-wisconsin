import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Use service role key for admin operations
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL!,
    process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { data: careers, error } = await supabase
      .from('careers')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching careers:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch careers', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ careers });
  } catch (error) {
    console.error('Error in GET /api/admin/careers:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('careers')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating career:', error);
      return NextResponse.json({ 
        error: 'Failed to create career',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ career: data });
  } catch (error) {
    console.error('Error in POST /api/admin/careers:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 