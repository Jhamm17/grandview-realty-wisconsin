# Vercel Cron Job Setup for Daily Maintenance

This guide explains how to set up the daily maintenance cron job that automatically refreshes all caches and triggers a redeployment.

## Overview

The daily maintenance system includes:
- **Cache Refresh**: Clears property cache, agent cache, and revalidates Next.js page caches
- **Redeployment**: Triggers a fresh Vercel deployment to ensure all changes are live
- **Automatic Execution**: Runs daily at 6 AM via Vercel cron jobs

## Environment Variables Required

You need to add these environment variables to your Vercel project:

### 1. Vercel API Configuration
```
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
VERCEL_TEAM_ID=your_team_id (optional, only if using team projects)
```

### 2. How to Get These Values

#### Vercel Token
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile picture → Settings
3. Go to "Tokens" tab
4. Click "Create Token"
5. Give it a name like "Grandview Realty Cron Job"
6. Select "Full Account" scope
7. Copy the generated token

#### Project ID
1. Go to your project in Vercel Dashboard
2. Click on "Settings" tab
3. Scroll down to "General" section
4. Copy the "Project ID"

#### Team ID (if applicable)
1. If your project is under a team, go to team settings
2. Copy the team ID from the URL or settings

## Cron Job Configuration

The cron job is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/admin/daily-maintenance",
      "schedule": "0 6 * * *"
    }
  ]
}
```

This runs the daily maintenance at 6 AM every day.

## Manual Triggers

You can also manually trigger these operations from the admin dashboard:

1. **Refresh All Caches**: Clears all caches and revalidates pages
2. **Trigger Redeployment**: Forces a fresh Vercel deployment

## API Endpoints

### Daily Maintenance (Cron Job)
- **Endpoint**: `/api/admin/daily-maintenance`
- **Method**: POST
- **Access**: Cron jobs only (requires `x-vercel-cron` header)
- **Function**: Performs both cache refresh and redeployment

### Cache Refresh (Manual)
- **Endpoint**: `/api/admin/refresh-cache`
- **Method**: POST
- **Access**: Admin users only
- **Function**: Refreshes all caches without redeployment

### Redeployment (Manual)
- **Endpoint**: `/api/admin/redeploy`
- **Method**: POST
- **Access**: Admin users only
- **Function**: Triggers Vercel redeployment

## Monitoring

### Vercel Function Logs
Monitor the cron job execution in Vercel Dashboard:
1. Go to your project
2. Click "Functions" tab
3. Look for `/api/admin/daily-maintenance` function
4. Check execution logs and timing

### Success Indicators
- Cache refresh should show success for all three cache types
- Redeployment should return a deployment ID and URL
- Total execution time should be under 60 seconds

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Error: "Vercel configuration missing"
   - Solution: Add VERCEL_TOKEN and VERCEL_PROJECT_ID

2. **Invalid Token**
   - Error: "Unauthorized" from Vercel API
   - Solution: Regenerate Vercel token with proper permissions

3. **Project ID Mismatch**
   - Error: "Project not found"
   - Solution: Verify VERCEL_PROJECT_ID matches your project

4. **Team ID Issues**
   - Error: "Team not found"
   - Solution: Remove VERCEL_TEAM_ID if not using teams, or verify team ID

### Testing

You can test the endpoints manually:

```bash
# Test cache refresh (requires admin authentication)
curl -X POST /api/admin/refresh-cache \
  -H "Content-Type: application/json" \
  -d '{"adminEmail": "your-admin-email"}'

# Test redeployment (requires admin authentication)
curl -X POST /api/admin/redeploy \
  -H "Content-Type: application/json" \
  -d '{"adminEmail": "your-admin-email"}'
```

## Security Notes

- The cron job endpoints are protected and only accessible via Vercel's cron job system
- Manual endpoints require admin authentication
- Vercel tokens should have minimal required permissions
- Consider rotating tokens periodically

## Cost Considerations

- Vercel cron jobs count towards your function execution limits
- Each daily maintenance run typically takes 30-60 seconds
- Monitor usage in Vercel Dashboard to ensure you stay within limits

