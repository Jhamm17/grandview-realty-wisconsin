import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Check if this is a cron job request (Vercel cron jobs send a special header)
    const isCronJob = request.headers.get('x-vercel-cron') === '1';
    
    if (isCronJob) {
      // For cron jobs, we don't need admin authentication
      console.log('🕐 Cron job triggered - initiating redeployment...');
    } else {
      // For manual requests, require admin authentication
      const { adminEmail } = await request.json();
      
      if (!adminEmail) {
        return NextResponse.json(
          { error: 'Admin email required' },
          { status: 400 }
        );
      }

      // Check if user is admin
      const isAdmin = await AdminAuthService.isAdmin(adminEmail);
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      console.log(`👤 Manual redeployment requested by admin: ${adminEmail}`);
    }

    // Check if we have the required environment variables
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    const vercelTeamId = process.env.VERCEL_TEAM_ID; // Optional

    if (!vercelToken || !vercelProjectId) {
      console.error('❌ Missing Vercel configuration');
      return NextResponse.json(
        { error: 'Vercel configuration missing' },
        { status: 500 }
      );
    }

    console.log('🚀 Initiating Vercel redeployment...');

    // Prepare the deployment request
    const deploymentData = {
      name: 'grandview-realty',
      target: 'production',
              alias: ['grandviewsells.com'],
      // Force a fresh deployment by adding a timestamp
      env: {
        REDEPLOY_TIMESTAMP: new Date().toISOString()
      }
    };

    // Build the API URL
    const baseUrl = 'https://api.vercel.com/v1';
    const url = vercelTeamId 
      ? `${baseUrl}/teams/${vercelTeamId}/projects/${vercelProjectId}/deployments`
      : `${baseUrl}/projects/${vercelProjectId}/deployments`;

    // Make the deployment request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deploymentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vercel API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to trigger redeployment', details: errorText },
        { status: response.status }
      );
    }

    const deployment = await response.json();
    
    console.log('✅ Redeployment triggered successfully!');
    console.log(`📋 Deployment ID: ${deployment.id}`);
    console.log(`🔗 Deployment URL: ${deployment.url}`);

    return NextResponse.json({
      success: true,
      message: 'Redeployment triggered successfully',
      deployment: {
        id: deployment.id,
        url: deployment.url,
        status: deployment.status,
        createdAt: deployment.createdAt
      },
      timestamp: new Date().toISOString(),
      triggeredBy: isCronJob ? 'cron-job' : 'admin'
    });

  } catch (error) {
    console.error('❌ Error triggering redeployment:', error);
    return NextResponse.json(
      { error: 'Failed to trigger redeployment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

