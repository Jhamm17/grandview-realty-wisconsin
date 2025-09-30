import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // For now, we'll skip authentication in the API routes
    // In production, you should implement proper authentication

    const { data: officeStaff, error } = await supabase
      .from('office_staff')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching office staff:', error);
      return NextResponse.json({ error: 'Failed to fetch office staff' }, { status: 500 });
    }

    // Set cache control headers to prevent caching
    const response = NextResponse.json({ officeStaff });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error in GET /api/admin/office-staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // For now, we'll skip authentication in the API routes
    // In production, you should implement proper authentication

    const body = await request.json();
    const { name, title, image_url, phone, email, responsibilities, experience, description, sort_order } = body;

    // Validate required fields
    if (!name || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: staff, error } = await supabase
      .from('office_staff')
      .insert({
        name,
        title,
        image_url,
        phone,
        email,
        responsibilities: responsibilities || [],
        experience,
        description,
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating office staff:', error);
      return NextResponse.json({ error: 'Failed to create office staff' }, { status: 500 });
    }

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Error in POST /api/admin/office-staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 