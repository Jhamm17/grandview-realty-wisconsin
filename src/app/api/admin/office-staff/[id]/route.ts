import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For now, we'll skip authentication in the API routes
    // In production, you should implement proper authentication

    const body = await request.json();
    const { name, title, image_url, phone, email, responsibilities, experience, description, sort_order, is_active } = body;

    // Validate required fields
    if (!name || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: staff, error } = await supabase
      .from('office_staff')
      .update({
        name,
        title,
        image_url,
        phone,
        email,
        responsibilities: responsibilities || [],
        experience,
        description,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating office staff:', error);
      return NextResponse.json({ error: 'Failed to update office staff' }, { status: 500 });
    }

    if (!staff) {
      return NextResponse.json({ error: 'Office staff not found' }, { status: 404 });
    }

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Error in PUT /api/admin/office-staff/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For now, we'll skip authentication in the API routes
    // In production, you should implement proper authentication

    const { error } = await supabase
      .from('office_staff')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting office staff:', error);
      return NextResponse.json({ error: 'Failed to delete office staff' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/office-staff/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 