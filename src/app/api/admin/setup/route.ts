import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if admin user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@test.com');

    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing users' },
        { status: 500 }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'Admin user already exists', email: 'admin@test.com', password: 'test123' },
        { status: 200 }
      );
    }

    // Create test admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@test.com',
        password_hash: 'test123', // In production, this should be properly hashed
        role: 'admin'
      })
      .select();

    if (error) {
      console.error('Error creating admin user:', error);
      return NextResponse.json(
        { error: 'Failed to create admin user' },
        { status: 500 }
      );
    }

    console.log('✅ Test admin user created successfully');

    return NextResponse.json({
      success: true,
      message: 'Test admin user created successfully',
      email: 'admin@test.com',
      password: 'test123'
    });

  } catch (error) {
    console.error('Error in setup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 