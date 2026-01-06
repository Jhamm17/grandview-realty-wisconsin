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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('careers')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating career:', error);
      return NextResponse.json({ 
        error: 'Failed to update career',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        error: 'Career not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ career: data });
  } catch (error) {
    console.error('Error in PUT /api/admin/careers/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('careers')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting career:', error);
      return NextResponse.json({ 
        error: 'Failed to delete career',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/careers/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 