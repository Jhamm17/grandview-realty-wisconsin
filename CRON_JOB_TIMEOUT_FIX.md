# Cron Job Timeout Issue - Explanation and Fix

## Problem Summary

The cron job was timing out before it could fetch all properties. When you ran the script in the terminal, it took 20+ minutes to complete, but the Vercel serverless function has a maximum execution time of **60 seconds** (Pro plan) or **10 seconds** (Hobby plan).

### Root Cause

1. **Vercel Function Timeout Limits**:
   - Hobby plan: 10 seconds max
   - Pro plan: 60 seconds max
   - Enterprise: 300 seconds (5 minutes) max

2. **Property Fetching Process**:
   - Fetches properties in batches of 25-50 per API request (MLS API limit)
   - Each API request can take 1-5 seconds
   - Rate limiting: 500ms delay between requests (2 requests/second)
   - If you have 200+ properties, this requires 4-8+ API calls
   - Total time: 4-8 API calls × (1-5 seconds + 500ms delay) = **10-40+ seconds**
   - With many properties, this easily exceeds the 60-second limit

3. **Previous Configuration**:
   - Timeout was set to only **45 seconds** for property fetching
   - This was too short for fetching many properties with pagination

## Solution Implemented

### 1. Asynchronous Processing for Cron Jobs

The cron job now returns immediately (HTTP 202 Accepted) and processes in the background:

```typescript
// POST handler detects cron jobs via x-vercel-cron header
if (isCronJob) {
  // Start background processing
  void (async () => {
    await refreshCache(true);
  })();
  
  // Return immediately
  return NextResponse.json({...}, { status: 202 });
}
```

**Note**: There's still a limitation - Vercel serverless functions may terminate background processing after the response is sent. This is a platform limitation.

### 2. Optimized Property Fetching for Cron Jobs

Cron jobs now use optimized batch methods:
- `fetchFreshActiveProperties()` - Fetches only active properties
- `fetchFreshUnderContractProperties()` - Fetches only under contract properties

These methods are more efficient than `getAllProperties()` which fetches everything.

### 3. Increased Timeout for Manual Refreshes

Manual admin refreshes now have a 55-second timeout (leaving buffer for other operations).

## Current Configuration

### Timeout Settings
- **maxDuration**: 60 seconds (Vercel Pro plan limit)
- **Property fetch timeout (manual)**: 50 seconds
- **Property fetch timeout (cron)**: No timeout (runs in background)
- **Agent fetch timeout**: 10 seconds

### Cron Job Endpoints

The cron job can use either:
1. **GET `/api/admin/refresh-cache`** - Returns immediately, processes in background
2. **POST `/api/admin/refresh-cache`** - Now also detects cron jobs and returns immediately

Both endpoints detect cron jobs via the `x-vercel-cron` header that Vercel automatically adds.

## Remaining Limitations

### Vercel Platform Limitations

1. **Function Timeout**: Even with background processing, Vercel may terminate the function after 60 seconds
2. **No True Background Jobs**: Serverless functions don't support true background processing after response is sent
3. **Cold Starts**: First request after inactivity may be slower

### If Timeout Still Occurs

If you're still seeing only one property after the cron runs, consider these alternatives:

#### Option 1: Use External Cron Service (Recommended)

Use a service like [cron-job.org](https://cron-job.org) that can handle longer-running tasks:

1. Sign up for free account
2. Create cron job pointing to: `https://your-domain.com/api/admin/refresh-cache`
3. Method: GET (returns immediately, processes in background)
4. Schedule: Daily at 6 AM

**Advantages**:
- No Vercel timeout limits
- More reliable
- Free
- Better monitoring

#### Option 2: Process in Smaller Batches

Modify the code to process properties in smaller batches over multiple cron runs:

```typescript
// Process only first 50 properties per run
// Store progress in database
// Next run continues from where it left off
```

#### Option 3: Use Supabase Edge Functions

Supabase Edge Functions have longer timeout limits and can be scheduled with pg_cron:

1. Deploy Edge Function to Supabase
2. Schedule with pg_cron (database-level scheduling)
3. No timeout limits like Vercel

#### Option 4: Upgrade to Vercel Enterprise

Enterprise plan supports up to 300 seconds (5 minutes), which should be enough for most cases.

## Monitoring

### Check Cron Job Logs

```bash
# View Vercel function logs
vercel logs [deployment-url]

# Or check in Vercel Dashboard
# Project → Functions → View Logs
```

### What to Look For

1. **Timeout errors**: "timed out after X seconds"
2. **Property count**: Should match expected number
3. **Execution time**: Should be under 60 seconds for initial response
4. **Background processing**: Check if it completes after response

### Expected Log Output

```
🔍 POST handler called for /api/admin/refresh-cache (Vercel cron job)
🚀 Starting background cache refresh process...
🕐 Cron job triggered - refreshing all caches...
🗑️ Clearing property cache...
🔄 Fetching fresh properties from MLS API...
📦 Using optimized batch fetching for cron job...
✅ Fetched X active + Y under contract = Z total properties
✅ Property cache refreshed! Loaded Z properties
...
✅ Background cache refresh completed
```

## Testing

### Test Cron Job Manually

```bash
# Simulate cron job request
curl -X POST https://your-domain.com/api/admin/refresh-cache \
  -H "x-vercel-cron: 1" \
  -H "Content-Type: application/json"

# Should return 202 Accepted immediately
```

### Test Property Count

After cron runs, check how many properties are cached:

```bash
# Check cache status (if you have an endpoint)
curl https://your-domain.com/api/admin/cache-status
```

## Next Steps

1. **Deploy the changes** to production
2. **Monitor the next cron run** to see if it completes
3. **Check property count** after cron runs
4. **If still timing out**, consider using external cron service (Option 1)

## Files Modified

- `src/app/api/admin/refresh-cache/route.ts`
  - Added cron job detection in POST handler
  - Made cron jobs return immediately (202 Accepted)
  - Optimized property fetching for cron jobs
  - Increased timeout for manual refreshes
