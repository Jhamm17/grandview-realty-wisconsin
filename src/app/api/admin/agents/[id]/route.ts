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
    const { slug, name, title, image_url, logo_url, phone, email, specialties, experience, service_area, description, sort_order, is_active } = body;

    // Validate required fields
    if (!slug || !name || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slug already exists for a different agent
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .single();

    if (existingAgent) {
      return NextResponse.json({ error: 'Agent with this slug already exists' }, { status: 400 });
    }

    const { data: agent, error } = await supabase
      .from('agents')
      .update({
        slug,
        name,
        title,
        image_url,
        logo_url,
        phone,
        email,
        specialties: specialties || [],
        experience,
        service_area,
        description,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent:', error);
      return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
    }

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error in PUT /api/admin/agents/[id]:', error);
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
      .from('agents')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting agent:', error);
      return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/agents/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 