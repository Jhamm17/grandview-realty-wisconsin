import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 Test GET endpoint called');
  console.log('🔍 Headers:', Object.fromEntries(request.headers.entries()));
  
  return NextResponse.json({
    success: true,
    message: 'GET endpoint working',
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers.entries())
  });
}

export async function POST(request: NextRequest) {
  console.log('🔍 Test POST endpoint called');
  
  return NextResponse.json({
    success: true,
    message: 'POST endpoint working',
    timestamp: new Date().toISOString()
  });
}

