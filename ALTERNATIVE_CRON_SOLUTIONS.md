# Alternative Cron Solutions for Cache Refresh

Since Vercel has cron job limits on free/hobby plans, here are better alternatives:

## ✅ Option 1: Supabase Edge Functions (Recommended)

**Pros:**
- ✅ Free tier includes scheduled functions
- ✅ No Vercel limits
- ✅ Integrated with your database
- ✅ Can use pg_cron for database-level scheduling

**Setup:**

1. **Deploy the Edge Function:**
   ```bash
   # Install Supabase CLI if needed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Deploy the function
   supabase functions deploy refresh-cache
   ```

2. **Set Environment Variables in Supabase:**
   - Go to Supabase Dashboard → Edge Functions → Settings
   - Add these secrets:
     - `VERCEL_URL` or `NEXT_PUBLIC_WISCONSIN_BASE_URL`
     - `CRON_SECRET` (optional, for security)

3. **Schedule using pg_cron:**
   - Run the SQL in `supabase/migrations/001_setup_cron.sql`
   - Or use Supabase Dashboard → Database → Extensions → Enable pg_cron

**Cost:** Free on Supabase free tier

---

## ✅ Option 2: External Cron Services (Easiest)

**Pros:**
- ✅ Completely free
- ✅ No code changes needed
- ✅ Simple setup
- ✅ Works immediately

**Services:**
- **cron-job.org** (Free, unlimited)
- **EasyCron** (Free tier: 1 job)
- **UptimeRobot** (Free, 50 monitors)
- **GitHub Actions** (Free, unlimited)

**Setup with cron-job.org:**

1. Go to https://cron-job.org (free signup)
2. Create new cron job:
   - **URL:** `https://grandviewwisconsin.com/api/admin/refresh-cache`
   - **Method:** POST
   - **Headers:** 
     ```
     Content-Type: application/json
     ```
   - **Body:** 
     ```json
     {"triggeredBy": "external-cron"}
     ```
   - **Schedule:** `0 6 * * *` (Daily at 6 AM)

3. Save and activate

**Cost:** Free

---

## ✅ Option 3: GitHub Actions (Free & Reliable)

**Pros:**
- ✅ Free for public repos
- ✅ Very reliable
- ✅ Easy to version control

**Setup:**

Create `.github/workflows/refresh-cache.yml`:

```yaml
name: Refresh Cache

on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Refresh Cache
        run: |
          curl -X POST https://grandviewwisconsin.com/api/admin/refresh-cache \
            -H "Content-Type: application/json" \
            -d '{"triggeredBy": "github-actions"}'
```

**Cost:** Free for public repos

---

## ✅ Option 4: Modify API Route to Accept Unauthenticated Calls

If you want to use external services, you may need to modify your API route to accept calls without admin authentication when called from cron services.

**Update `/api/admin/refresh-cache/route.ts`:**

```typescript
// Add a secret token check for cron jobs
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Check for cron secret in header
  const cronSecret = request.headers.get('x-cron-secret');
  
  if (cronSecret === CRON_SECRET) {
    // This is a valid cron call
    const result = await refreshCache(true);
    return NextResponse.json(result);
  }
  
  // Otherwise require admin auth
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Then set `CRON_SECRET` in your Vercel environment variables.

---

## 🎯 Recommended Solution

**For your use case, I recommend Option 2 (External Cron Service)** because:
1. ✅ Zero code changes needed
2. ✅ Works immediately
3. ✅ Completely free
4. ✅ No Vercel limits
5. ✅ Easy to monitor and debug

**Quick Setup:**
1. Remove cron jobs from `vercel.json`
2. Sign up for cron-job.org (free)
3. Point it to your `/api/admin/refresh-cache` endpoint
4. Done! ✅

---

## Removing Vercel Cron Jobs

To remove the cron jobs from `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "next build",
  // ... other config ...
  // Remove or comment out the "crons" section:
  // "crons": [...]
}
```

This will allow your deployment to succeed without hitting the cron job limit!

