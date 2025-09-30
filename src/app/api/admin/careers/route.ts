import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { data: careers, error } = await supabase
      .from('careers')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching careers:', error);
      return NextResponse.json({ error: 'Failed to fetch careers' }, { status: 500 });
    }

    return NextResponse.json({ careers });
  } catch (error) {
    console.error('Error in GET /api/admin/careers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('careers')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating career:', error);
      return NextResponse.json({ error: 'Failed to create career' }, { status: 500 });
    }

    return NextResponse.json({ career: data });
  } catch (error) {
    console.error('Error in POST /api/admin/careers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 