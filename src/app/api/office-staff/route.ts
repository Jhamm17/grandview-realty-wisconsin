import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: officeStaff, error } = await supabase
      .from('office_staff')
      .select('*')
      .eq('is_active', true)
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
    console.error('Error in GET /api/office-staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 