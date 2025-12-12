# GitHub Actions Setup - Step-by-Step Walkthrough

## ✅ Yes, This Will Update Supabase and Your Site!

Here's what happens when the workflow runs:

1. **GitHub Actions** triggers your Vercel API endpoint
2. **Your API** fetches fresh properties from the Wisconsin MLS API (takes ~20 minutes)
3. **Properties are saved** to your Supabase `property_cache` table
4. **Your website** automatically uses the cached data from Supabase
5. **Next.js pages** are revalidated so visitors see the new data

**Result:** Your site will show the latest properties from the MLS API! 🎉

---

## Step-by-Step Setup

### Step 1: Generate a CRON_SECRET (Security Token)

First, generate a random secret token for security. This prevents unauthorized access to your cache refresh endpoint.

**On Mac/Linux:**
```bash
openssl rand -hex 32
```

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Or use an online generator:**
- Go to https://randomkeygen.com/
- Copy a "CodeIgniter Encryption Keys" value

**Save this value** - you'll need it in the next steps!

Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

---

### Step 2: Add GitHub Secrets

1. **Go to your GitHub repository**
   - Navigate to: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`

2. **Open Settings**
   - Click the **"Settings"** tab (top right of the repository)

3. **Go to Secrets**
   - In the left sidebar, click **"Secrets and variables"**
   - Click **"Actions"**

4. **Add VERCEL_URL Secret**
   - Click **"New repository secret"** button
   - **Name:** `VERCEL_URL`
   - **Value:** Your Vercel deployment URL
     - Example: `https://grandviewwisconsin.com`
     - Or: `https://your-project.vercel.app`
   - Click **"Add secret"**

5. **Add CRON_SECRET Secret**
   - Click **"New repository secret"** button again
   - **Name:** `CRON_SECRET`
   - **Value:** The random string you generated in Step 1
   - Click **"Add secret"**

✅ You should now see both secrets listed!

---

### Step 3: Add CRON_SECRET to Vercel

Your Vercel API needs to know the secret to accept requests from GitHub Actions.

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Open Environment Variables**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in the sidebar

3. **Add CRON_SECRET**
   - Click **"Add New"**
   - **Key:** `CRON_SECRET`
   - **Value:** The same random string from Step 1
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Save"**

4. **Redeploy** (Important!)
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on your latest deployment
   - Click **"Redeploy"**
   - This ensures the new environment variable is available

---

### Step 4: Push Files to GitHub

Now let's add the workflow file to your repository.

**Option A: Using Git Command Line**

```bash
# Navigate to your project directory
cd /path/to/grandview-realty-wisconsin

# Check what files we're adding
git status

# Add the workflow and script files
git add .github/workflows/refresh-cache.yml
git add scripts/refresh-cache-simple.js

# Commit the changes
git commit -m "Add GitHub Actions workflow for automatic cache refresh"

# Push to GitHub
git push origin main
```

**Option B: Using GitHub Web Interface**

1. Go to your repository on GitHub
2. Click **"Add file"** → **"Create new file"**
3. **File path:** `.github/workflows/refresh-cache.yml`
4. Copy the contents from the file I created (or it should already be there if you pulled)
5. Click **"Commit new file"**
6. Repeat for `scripts/refresh-cache-simple.js` if needed

---

### Step 5: Test the Workflow

Let's test it manually to make sure everything works!

1. **Go to Actions Tab**
   - In your GitHub repository, click the **"Actions"** tab (top navigation)

2. **Find the Workflow**
   - You should see **"Refresh Property Cache"** in the left sidebar
   - Click on it

3. **Run Manually**
   - Click the **"Run workflow"** dropdown button (top right)
   - Click the green **"Run workflow"** button
   - The workflow will start running!

4. **Watch It Run**
   - You'll see the workflow appear in the list
   - Click on it to see the logs
   - Expand the steps to see what's happening

**Expected Output:**
```
🚀 Triggering cache refresh via API...
📡 Calling: https://your-domain.com/api/admin/refresh-cache
✅ Cache refresh initiated successfully!
⏳ Background processing may take 20+ minutes
```

---

### Step 6: Verify It's Working

After the workflow runs, verify that properties are being updated:

**Option 1: Check Vercel Logs**

1. Go to Vercel Dashboard → Your Project
2. Click **"Functions"** tab
3. Find `/api/admin/refresh-cache`
4. Click to see logs
5. Look for messages like:
   - `✅ Fetched X active properties`
   - `✅ Successfully cached X properties to Wisconsin Supabase!`

**Option 2: Check Supabase**

1. Go to Supabase Dashboard
2. Navigate to **"Table Editor"**
3. Open the `property_cache` table
4. Check the `last_updated` column - it should show recent timestamps
5. Count the rows - should match your expected property count

**Option 3: Check Your Website**

1. Visit your properties page: `https://your-domain.com/properties`
2. Properties should be loading from the cache
3. Check a few property pages to verify they're showing correctly

---

## How It Works (Technical Details)

### The Flow:

```
GitHub Actions (Scheduled Daily)
    ↓
Calls: GET /api/admin/refresh-cache
    ↓
Vercel API Endpoint
    ↓
Returns: 202 Accepted (immediately)
    ↓
Background Process Starts:
    1. Clears old cache in Supabase
    2. Fetches fresh properties from Wisconsin MLS API
    3. Processes and saves to Supabase property_cache table
    4. Revalidates Next.js page cache
    ↓
Your Website Uses Cached Data
    ↓
Visitors See Updated Properties! ✅
```

### What Gets Updated:

1. **Supabase `property_cache` table**
   - Old properties are marked inactive
   - New properties are added
   - All properties get fresh data from MLS API

2. **Next.js Page Cache**
   - `/properties` page is revalidated
   - `/properties/[id]` pages are revalidated
   - Home page is revalidated

3. **Agent Cache**
   - Agent information is refreshed
   - Agent listings are updated

---

## Schedule Customization

The workflow runs **daily at 6 AM UTC** by default. To change this:

1. Edit `.github/workflows/refresh-cache.yml`
2. Find the line: `- cron: '0 6 * * *'`
3. Change to your desired schedule

**Common Schedules:**

```yaml
# Every 6 hours
- cron: '0 */6 * * *'

# Twice daily (6 AM and 6 PM UTC)
- cron: '0 6,18 * * *'

# Every Monday at 6 AM UTC
- cron: '0 6 * * 1'

# Daily at midnight UTC
- cron: '0 0 * * *'
```

**Timezone Note:** GitHub Actions uses UTC. To run at 6 AM EST:
- EST is UTC-5 (or UTC-4 during daylight saving)
- 6 AM EST = 11 AM UTC (or 10 AM UTC during DST)
- Use: `cron: '0 11 * * *'`

---

## Troubleshooting

### Workflow Fails with "Unauthorized"

**Problem:** Getting 401 Unauthorized error

**Solution:**
1. Check that `CRON_SECRET` is set in both:
   - GitHub Secrets
   - Vercel Environment Variables
2. Make sure they match exactly (no extra spaces)
3. Redeploy Vercel after adding the secret

### Workflow Runs But No Properties Update

**Problem:** Workflow succeeds but Supabase isn't updated

**Solution:**
1. Check Vercel function logs for errors
2. Verify your Vercel environment variables are set:
   - `NEXT_PUBLIC_WISCONSIN_SUPABASE_URL`
   - `WISCONSIN_SUPABASE_SERVICE_ROLE_KEY`
   - `WISCONSIN_MLS_ACCESS_TOKEN`
3. Check that the API endpoint is accessible: `https://your-domain.com/api/admin/refresh-cache`

### Workflow Doesn't Run on Schedule

**Problem:** Scheduled runs aren't happening

**Solution:**
1. Check that the workflow file is in `.github/workflows/` directory
2. Verify the cron syntax is correct
3. Check GitHub Actions is enabled (Settings → Actions → General)
4. Note: Scheduled workflows may be delayed by a few minutes

### "Workflow file not found"

**Problem:** GitHub can't find the workflow

**Solution:**
1. Make sure the file is at: `.github/workflows/refresh-cache.yml`
2. Check the file is committed and pushed to GitHub
3. Verify the YAML syntax is correct (no indentation errors)

---

## Monitoring

### View Workflow Runs

1. Go to **Actions** tab in GitHub
2. Click **"Refresh Property Cache"** workflow
3. See all past runs with their status
4. Click any run to see detailed logs

### Set Up Email Notifications

GitHub automatically emails you when:
- A workflow fails
- A workflow succeeds (optional - enable in Settings)

### Add Custom Notifications

You can add Slack/Discord notifications in the workflow file. See the "Notify on failure" step in the workflow.

---

## Next Steps

1. ✅ Complete the setup steps above
2. ✅ Test the workflow manually
3. ✅ Verify properties are updating
4. ✅ Wait for the first scheduled run (6 AM UTC daily)
5. ✅ Monitor the first few runs to ensure everything works

---

## Summary

**What you're setting up:**
- ✅ Automatic daily property cache refresh
- ✅ Runs completely free on GitHub Actions
- ✅ Updates Supabase with fresh MLS data
- ✅ Your website automatically uses the updated data
- ✅ No manual intervention needed

**Time investment:** ~10 minutes to set up
**Ongoing maintenance:** None - it runs automatically!

---

## Need Help?

If you run into issues:
1. Check the workflow logs in GitHub Actions
2. Check Vercel function logs
3. Verify all secrets are set correctly
4. Test the API endpoint manually first: `curl https://your-domain.com/api/admin/refresh-cache`

Good luck! 🚀
