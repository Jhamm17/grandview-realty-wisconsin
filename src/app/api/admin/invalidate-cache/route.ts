import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    
    if (path) {
      // Revalidate specific path
      revalidatePath(path);
    } else {
      // Revalidate team pages
      revalidatePath('/team/agents');
      revalidatePath('/team/office-staff');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache invalidated successfully' 
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
} 