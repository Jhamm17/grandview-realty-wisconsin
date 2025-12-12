# GitHub Actions Setup for Long-Running Cache Refresh

## Overview

GitHub Actions is the **best free solution** for running your 20-minute property cache refresh script. It's completely free for public repositories and supports up to 6 hours of runtime.

## Quick Setup (5 minutes)

### Step 1: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these:

   **Required:**
   - `VERCEL_URL` - Your Vercel deployment URL (e.g., `https://grandviewwisconsin.com`)
   - `CRON_SECRET` - A secret token for security (generate a random string)

   **Optional (if using standalone script instead of API):**
   - `NEXT_PUBLIC_WISCONSIN_SUPABASE_URL`
   - `WISCONSIN_SUPABASE_SERVICE_ROLE_KEY`
   - `WISCONSIN_MLS_ACCESS_TOKEN`
   - `WISCONSIN_MLS_API_URL`
   - `WISCONSIN_MLS_OUID`
   - `MLS_Aligned_User_Agent`

### Step 2: Generate CRON_SECRET

Generate a random secret token:

```bash
# On Mac/Linux:
openssl rand -hex 32

# Or use any random string generator
```

Add this to:
- GitHub Secret: `CRON_SECRET`
- Vercel Environment Variable: `CRON_SECRET`

### Step 3: Update API Route (if needed)

The `/api/admin/refresh-cache` route already supports cron jobs via the `x-cron-secret` header. Make sure it's configured to accept your secret.

### Step 4: Push to GitHub

The workflow file (`.github/workflows/refresh-cache.yml`) is already created. Just push to GitHub:

```bash
git add .github/workflows/refresh-cache.yml
git commit -m "Add GitHub Actions workflow for cache refresh"
git push
```

### Step 5: Test It

1. Go to your GitHub repository
2. Click the **Actions** tab
3. Find **"Refresh Property Cache"** workflow
4. Click **"Run workflow"** button
5. Click the green **"Run workflow"** button
6. Watch it run!

## How It Works

### Current Setup (API-Based - Recommended)

The workflow calls your Vercel API endpoint:
- **Endpoint**: `GET /api/admin/refresh-cache`
- **Header**: `x-cron-secret: <your-secret>` (optional)
- **Response**: Returns 202 Accepted immediately
- **Processing**: Continues in background on Vercel

**Pros:**
- ✅ Simple setup
- ✅ No need to install dependencies in GitHub Actions
- ✅ Uses your existing API code
- ✅ Returns immediately, doesn't block GitHub Actions

**Note:** The API endpoint returns immediately (202 Accepted) and processes in the background. However, Vercel may still have timeout limits. If you need to guarantee the full 20 minutes runs, see "Alternative: Direct Script Execution" below.

### Alternative: Direct Script Execution (For Full 20-Minute Run)

If you need to guarantee the full 20-minute script runs without any Vercel timeouts, you can modify the workflow to run the script directly in GitHub Actions. This requires:

1. Setting up all environment variables in GitHub Secrets
2. Installing dependencies in GitHub Actions
3. Running the script directly (not via API)

**Pros:**
- ✅ Full 20-minute runtime guaranteed
- ✅ No Vercel timeout limits
- ✅ Complete control over execution

**Cons:**
- ⚠️ More complex setup
- ⚠️ Requires all environment variables in GitHub
- ⚠️ Need to handle TypeScript/ES modules in Node.js script

### Alternative: Standalone Script

If you want to run the full script in GitHub Actions (not via API), you can modify the workflow to use the standalone script instead. This would run the full 20 minutes in GitHub Actions.

## Schedule Customization

Edit `.github/workflows/refresh-cache.yml` to change the schedule:

```yaml
schedule:
  - cron: '0 6 * * *'  # Daily at 6 AM UTC
```

### Common Schedules:

```yaml
# Every 6 hours
- cron: '0 */6 * * *'

# Twice daily (6 AM and 6 PM UTC)
- cron: '0 6,18 * * *'

# Every Monday at 6 AM UTC
- cron: '0 6 * * 1'

# Every day at midnight UTC
- cron: '0 0 * * *'
```

### Timezone Conversion:

GitHub Actions uses UTC. To run at 6 AM EST:
- EST is UTC-5 (or UTC-4 during daylight saving)
- 6 AM EST = 11 AM UTC (or 10 AM UTC during DST)
- Use: `cron: '0 11 * * *'`

## Monitoring

### View Logs:

1. Go to **Actions** tab in GitHub
2. Click on a workflow run
3. Click on the job
4. Expand steps to see logs

### Email Notifications:

GitHub automatically sends email notifications when:
- A workflow fails
- A workflow succeeds (optional, can be enabled in settings)

### Add Custom Notifications:

You can add Slack/Discord/Email notifications in the workflow file:

```yaml
- name: Notify on failure
  if: failure()
  run: |
    curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
      -d '{"text":"❌ Cache refresh failed!"}'
```

## Troubleshooting

### Workflow doesn't run:

1. Check that the workflow file is in `.github/workflows/` directory
2. Check that the schedule syntax is correct
3. Check GitHub Actions is enabled for your repository (Settings → Actions)

### API call fails:

1. Check that `VERCEL_URL` secret is correct
2. Check that `CRON_SECRET` matches in both GitHub and Vercel
3. Check Vercel function logs for errors

### Timeout issues:

If using the API-based approach and still seeing timeouts, consider:
1. Using the standalone script approach (runs full 20 minutes in GitHub)
2. Processing properties in smaller batches
3. Using a different service (Railway, Render)

## Cost

**GitHub Actions:**
- ✅ **FREE** for public repositories
- ✅ Unlimited minutes for public repos
- ✅ 6-hour maximum runtime per job
- ⚠️ Private repos: 2,000 free minutes/month

## Next Steps

1. ✅ Add GitHub Secrets (see Step 1)
2. ✅ Push workflow file to GitHub
3. ✅ Test manually from Actions tab
4. ✅ Monitor first scheduled run
5. ✅ Adjust schedule if needed

## Support

If you need help:
1. Check workflow logs in GitHub Actions tab
2. Check Vercel function logs
3. Verify all secrets are set correctly
4. Test the API endpoint manually first

---

**That's it!** Your 20-minute script will now run automatically every day at 6 AM UTC, completely free! 🎉
