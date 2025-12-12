# Free Services for Long-Running Scripts (20+ minutes)

Since your property refresh script takes 20 minutes, you need a service that can handle long-running tasks. Here are the **best free options**:

## 🏆 Option 1: GitHub Actions (RECOMMENDED)

**Best for:** Free, reliable, version-controlled, unlimited runtime (up to 6 hours)

### Pros:
- ✅ **Completely free** for public repositories
- ✅ **6-hour maximum runtime** (plenty for your 20-minute script)
- ✅ **Very reliable** - GitHub's infrastructure
- ✅ **Easy to monitor** - see logs in GitHub UI
- ✅ **Version controlled** - workflow files in your repo
- ✅ **Manual triggers** - can run on-demand from GitHub UI
- ✅ **Email notifications** - get notified on success/failure

### Cons:
- ⚠️ Only free for **public repos** (private repos have limited free minutes)
- ⚠️ Requires GitHub repository

### Setup:

1. **Add the workflow file** (already created: `.github/workflows/refresh-cache.yml`)

2. **Add GitHub Secrets**:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     - `NEXT_PUBLIC_WISCONSIN_SUPABASE_URL`
     - `WISCONSIN_SUPABASE_SERVICE_ROLE_KEY`
     - `WISCONSIN_MLS_ACCESS_TOKEN`
     - `WISCONSIN_MLS_API_URL` (optional)
     - `WISCONSIN_MLS_OUID` (optional)
     - `MLS_Aligned_User_Agent` (optional)

3. **Test it**:
   - Go to Actions tab in GitHub
   - Click "Refresh Property Cache" workflow
   - Click "Run workflow" button
   - Watch it run!

### Schedule:
- Currently set to run **daily at 6 AM UTC** (1 AM EST / 12 AM CST)
- You can change the schedule in `.github/workflows/refresh-cache.yml`
- Format: `cron: '0 6 * * *'` (minute hour day month weekday)

**Cost:** FREE for public repos ✅

---

## Option 2: Railway (Free Tier)

**Best for:** Simple deployment, Docker support

### Pros:
- ✅ Free tier available ($5 credit/month)
- ✅ Can run long processes
- ✅ Simple setup
- ✅ Supports cron jobs

### Cons:
- ⚠️ Free tier has limited resources
- ⚠️ May require Docker setup
- ⚠️ Less reliable than GitHub Actions for scheduled tasks

**Cost:** Free tier available, but may need to upgrade for reliability

---

## Option 3: Render (Free Tier)

**Best for:** Background workers, scheduled jobs

### Pros:
- ✅ Free tier for background workers
- ✅ Can run long processes
- ✅ Built-in cron support

### Cons:
- ⚠️ Free tier spins down after inactivity
- ⚠️ May have cold starts
- ⚠️ Less reliable than GitHub Actions

**Cost:** Free tier available

---

## Option 4: Google Cloud Run (Free Tier)

**Best for:** Serverless with longer timeouts

### Pros:
- ✅ Generous free tier
- ✅ 60-minute timeout (Enterprise plan)
- ✅ Pay-per-use pricing

### Cons:
- ⚠️ More complex setup
- ⚠️ Requires Google Cloud account
- ⚠️ Free tier has limits

**Cost:** Free tier available, pay for usage beyond free tier

---

## Option 5: AWS Lambda (Not Recommended)

**Why not:** 
- ❌ Maximum 15-minute timeout (even on paid plans)
- ❌ Your script takes 20 minutes, so it won't work

---

## 🎯 Recommendation: GitHub Actions

For your use case, **GitHub Actions is the clear winner**:

1. ✅ **Free** for public repos
2. ✅ **6-hour max runtime** (your 20-minute script fits easily)
3. ✅ **Very reliable** - GitHub's infrastructure
4. ✅ **Easy to monitor** - see logs in GitHub UI
5. ✅ **Version controlled** - workflow files in your repo
6. ✅ **Manual triggers** - can run on-demand
7. ✅ **Email notifications** - get notified on success/failure

### Already Set Up For You:

1. ✅ Created `.github/workflows/refresh-cache.yml` - workflow file
2. ✅ Created `scripts/refresh-cache-simple.js` - simple API caller script

**Note:** The current setup calls your Vercel API endpoint, which returns immediately and processes in the background. This is the simplest approach. If you need to guarantee the full 20-minute script runs without any Vercel timeouts, you can modify the workflow to run the script directly in GitHub Actions (see GITHUB_ACTIONS_SETUP.md for details).

### Next Steps:

1. **Add GitHub Secrets** (see setup instructions above)
2. **Push to GitHub** - the workflow will be available
3. **Test it** - manually trigger from GitHub Actions tab
4. **Monitor** - check logs after it runs

### Customization:

You can customize the schedule in `.github/workflows/refresh-cache.yml`:

```yaml
schedule:
  - cron: '0 6 * * *'  # Daily at 6 AM UTC
  # Examples:
  # - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 0 * * *'    # Daily at midnight UTC
  # - cron: '0 6 * * 1'    # Every Monday at 6 AM UTC
```

### Timezone Note:

GitHub Actions uses UTC. If you want it to run at 6 AM EST:
- EST is UTC-5, so 6 AM EST = 11 AM UTC
- Change to: `cron: '0 11 * * *'`

---

## Comparison Table

| Service | Free? | Max Runtime | Reliability | Setup Difficulty |
|---------|-------|-------------|-------------|------------------|
| **GitHub Actions** | ✅ Yes | 6 hours | ⭐⭐⭐⭐⭐ | Easy |
| Railway | ✅ Yes* | Unlimited | ⭐⭐⭐ | Medium |
| Render | ✅ Yes* | Unlimited | ⭐⭐⭐ | Medium |
| Google Cloud Run | ✅ Yes* | 60 min | ⭐⭐⭐⭐ | Hard |
| AWS Lambda | ✅ Yes* | 15 min | ⭐⭐⭐⭐ | Hard |

*Free tier with limits

---

## Need Help?

If you need help setting up GitHub Actions or have questions, the workflow file is already created and ready to use. Just add your secrets and push to GitHub!
