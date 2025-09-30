import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // For now, we'll skip authentication in the API routes
    // In production, you should implement proper authentication

    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching agents:', error);
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
    }

    // Set cache control headers to prevent caching
    const response = NextResponse.json({ agents });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error in GET /api/admin/agents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // For now, we'll skip authentication in the API routes
    // In production, you should implement proper authentication

    const body = await request.json();
    const { slug, name, title, image_url, logo_url, phone, email, specialties, experience, service_area, description, sort_order } = body;

    // Validate required fields
    if (!slug || !name || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slug already exists
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingAgent) {
      return NextResponse.json({ error: 'Agent with this slug already exists' }, { status: 400 });
    }

    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
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
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error in POST /api/admin/agents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 