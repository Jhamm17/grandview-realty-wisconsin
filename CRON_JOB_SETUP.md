# Cron Job Setup Guide for Grandview Realty

This guide explains how to set up and troubleshoot the automatic cache refresh cron job.

## Overview

The cron job system automatically refreshes your website's cache to ensure property listings and agent information stay up-to-date. The system includes:

- **Property Cache Refresh**: Fetches fresh property data from the MLS API
- **Agent Cache Refresh**: Updates agent information and listings
- **Page Cache Revalidation**: Clears Next.js page caches
- **Automatic Execution**: Runs daily at 6 AM via Vercel cron jobs

## Current Configuration

### Cron Jobs in `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/admin/refresh-cache", 
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/instagram",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Schedule Explanation

- **Cache Refresh**: `0 6 * * *` - Runs daily at 6 AM
- **Instagram**: `0 9 * * *` - Runs daily at 9 AM

**Note**: Hobby plans on Vercel only support daily cron jobs (once per day). If you need more frequent updates, consider upgrading to a Pro plan.

## Setup Steps

### 1. Deploy the Updated Configuration

```bash
# Deploy to Vercel with the new cron job configuration
vercel --prod
```

### 2. Verify Environment Variables

Ensure these environment variables are set in your Vercel project:

**Required for Cache Refresh:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MRED_CLIENT_ID`
- `MRED_CLIENT_SECRET`

**Optional for Redeployment:**
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- `VERCEL_TEAM_ID`

### 3. Test the Cache Refresh

Since the cron job only runs daily, you can test it manually:

1. **Via Admin Dashboard**: Use the "Refresh All Caches" button
2. **Via API**: 
   ```bash
   curl -X POST https://your-domain.vercel.app/api/admin/refresh-cache \
     -H "Content-Type: application/json" \
     -d '{"adminEmail": "your-admin-email"}'
   ```

## Monitoring and Troubleshooting

### Check Cron Job Logs

```bash
# View recent function logs
vercel logs [deployment-url]

# Or check in Vercel Dashboard:
# 1. Go to your project
# 2. Click "Functions" tab
# 3. Look for `/api/admin/refresh-cache`
```

### Manual Testing

You can test the cache refresh manually at any time:

1. **Via Admin Dashboard**: Use the "Refresh All Caches" button
2. **Via API**: 
   ```bash
   curl -X POST https://your-domain.vercel.app/api/admin/refresh-cache \
     -H "Content-Type: application/json" \
     -d '{"adminEmail": "your-admin-email"}'
   ```

### Common Issues and Solutions

#### 1. Cron Job Not Running

**Symptoms:**
- No logs in Vercel function logs
- Cache not updating automatically

**Solutions:**
- Verify `vercel.json` is deployed correctly
- Check that the cron schedule is valid
- Ensure the endpoint path exists and is accessible
- Verify you're on a plan that supports cron jobs

#### 2. Cache Refresh Failing

**Symptoms:**
- Error logs in function execution
- Properties not updating

**Solutions:**
- Check environment variables are set correctly
- Verify Supabase connection
- Check MLS API credentials

#### 3. Authentication Issues

**Symptoms:**
- "Unauthorized" errors
- Admin access denied

**Solutions:**
- Verify admin email is in the admin list
- Check Supabase RLS policies
- Ensure service role key has proper permissions

### Debugging Steps

1. **Test Manual Refresh**: Use the admin dashboard to test cache refresh
2. **Check Environment Variables**: Ensure all required vars are set
3. **Check Supabase Connection**: Verify database connectivity
4. **Check MLS API**: Ensure API credentials are valid
5. **Check Function Logs**: Look for specific error messages

## Expected Behavior

### Successful Cache Refresh

When working correctly, you should see these log messages:

```
🕐 Cron job triggered - refreshing all caches...
🗑️ Clearing property cache...
🔄 Fetching fresh properties from MLS API...
✅ Property cache refreshed! Loaded [X] properties
🗑️ Clearing agent cache...
🔄 Fetching fresh agent data...
✅ Agent cache refreshed! Loaded [X] agents
🔄 Revalidating page caches...
✅ Revalidated: /team/agents
✅ Revalidated: /team/office-staff
✅ Revalidated: /careers
✅ Revalidated: /properties
✅ Revalidated: /
✅ Page cache revalidation completed!
🎯 Cache refresh completed!
⏱️ Total duration: [X]ms
✅ Overall success: YES
```

### Response Format

The endpoint returns:

```json
{
  "success": true,
  "message": "Cache refreshed successfully",
  "results": {
    "propertyCache": { "success": true, "count": 150 },
    "agentCache": { "success": true, "count": 12 },
    "pageCache": { "success": true, "paths": ["/team/agents", ...] },
    "totalDuration": 45000
  },
  "timestamp": "2024-01-15T06:00:00.000Z",
  "triggeredBy": "cron-job"
}
```

## Maintenance

### Regular Monitoring

- Check function logs weekly
- Monitor cache refresh success rates
- Verify property counts are reasonable
- Check execution times (should be under 60 seconds)

### Updating Schedules

To change when the cron job runs, update the schedule in `vercel.json`:

```json
{
  "path": "/api/admin/refresh-cache",
  "schedule": "0 8 * * *"  // Change to 8 AM
}
```

### Hobby Plan Limitations

With a Hobby plan, you can only have:
- **Daily cron jobs** (once per day)
- **Maximum 2 cron jobs** per project

If you need more frequent updates, consider:
1. **Upgrading to Pro plan** for hourly cron jobs
2. **Using manual refresh** via admin dashboard
3. **Setting up external cron services** (like cron-job.org)

## Support

If you continue to have issues:

1. Check the Vercel function logs for specific error messages
2. Verify all environment variables are set correctly
3. Test the manual cache refresh to isolate the issue
4. Check Supabase and MLS API connectivity separately
5. Consider upgrading to Pro plan for more frequent cron jobs
