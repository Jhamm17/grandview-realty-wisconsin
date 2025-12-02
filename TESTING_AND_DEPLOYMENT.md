# Testing and Deployment Guide for Grandview Realty Wisconsin

## Quick Answer: Can You Use Vercel?

**YES!** ✅ Your project is fully configured for Vercel deployment. Since you already have a Wisconsin Vercel project created, you're ready to deploy once the code is updated to use Wisconsin environment variables.

## How to Test Your Current Setup

### 1. Local Testing (Before Deployment)

#### Step 1: Set Up Environment
```bash
# Copy the example environment file
cp env.wisconsin.example .env.local

# Edit .env.local with your Wisconsin Supabase credentials
# Get these from: Wisconsin Supabase Project → Settings → API
```

**Required values for `.env.local`:**
```env
NEXT_PUBLIC_WISCONSIN_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY=your-anon-key-here
WISCONSIN_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### Step 2: Install and Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

#### Step 3: Test Key Pages
Open your browser and test:

1. **Home Page**: `http://localhost:3000`
   - Should load without errors
   - Check browser console for errors

2. **Properties Page**: `http://localhost:3000/properties`
   - May show empty (expected without MLS API)
   - Should not show errors

3. **Admin Dashboard**: `http://localhost:3000/admin`
   - Should load admin interface
   - Check if Supabase connection works

4. **Team Pages**: 
   - `http://localhost:3000/team/agents`
   - `http://localhost:3000/team/office-staff`
   - Should load (may be empty until you add Wisconsin team data)

#### Step 4: Check Build
```bash
# Test production build
npm run build

# If build succeeds, test production server
npm run start
```

**Expected Results:**
- ✅ Build completes without errors
- ✅ Production server starts
- ✅ Pages load correctly

### 2. Test Supabase Connection

#### Check Connection in Browser Console
1. Open `http://localhost:3000/admin`
2. Open browser Developer Tools (F12)
3. Check Console tab for:
   - "Supabase environment variables found" ✅
   - Any connection errors ❌

#### Test Database Tables
1. Go to your Wisconsin Supabase project
2. Table Editor → Check if tables exist:
   - `agents`
   - `office_staff`
   - `property_cache`
   - `admin_users`
   - `careers`
   - etc.

3. If tables don't exist:
   - Go to SQL Editor
   - Run `supabase-wisconsin-setup.sql`

### 3. Test API Endpoints Locally

#### Test Properties API
```bash
curl http://localhost:3000/api/properties
```
**Expected**: JSON response (may be empty array `{"properties":[]}`)

#### Test Status API
```bash
curl http://localhost:3000/api/status
```
**Expected**: Status information about the system

#### Test Agents API
```bash
curl http://localhost:3000/api/agents
```
**Expected**: List of agents (may be empty)

## Deployment to Vercel

### Prerequisites Checklist
- [ ] Wisconsin Supabase project created
- [ ] Wisconsin Vercel project created
- [ ] Database setup script run in Supabase
- [ ] Code updated to use Wisconsin environment variables (see below)

### Step 1: Update Code for Wisconsin

**⚠️ CRITICAL**: The code currently uses generic environment variable names. You need to update them to Wisconsin-specific names, OR set up your Vercel environment variables to match what the code expects.

**Option A: Update Code** (Recommended)
- Update all files to use `NEXT_PUBLIC_WISCONSIN_SUPABASE_URL` instead of `NEXT_PUBLIC_SUPABASE_URL`
- See `WISCONSIN_INTEGRATION_GUIDE.md` for file list

**Option B: Match Environment Variables**
- Set Vercel environment variables to match what code expects:
  - `NEXT_PUBLIC_SUPABASE_URL` = Your Wisconsin Supabase URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Wisconsin anon key
  - etc.

### Step 2: Configure Vercel Environment Variables

1. **Go to your Wisconsin Vercel project**
2. **Settings → Environment Variables**
3. **Add these variables:**

```
NEXT_PUBLIC_WISCONSIN_SUPABASE_URL
NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY
WISCONSIN_SUPABASE_SERVICE_ROLE_KEY
```

**Optional (for when you have MLS API):**
```
WISCONSIN_MLS_ACCESS_TOKEN
NEXT_PUBLIC_WISCONSIN_MLS_API_URL
```

**Other variables:**
```
RESEND_API_KEY (for contact forms)
INSTAGRAM_ACCESS_TOKEN (for Instagram feed)
VERCEL_TOKEN (for redeployment features)
VERCEL_PROJECT_ID (your Wisconsin project ID)
```

4. **Set for**: Production, Preview, and Development

### Step 3: Connect Repository

1. **Vercel Project → Settings → Git**
2. **Connect Repository**:
   - If not connected, click "Connect Git Repository"
   - Select your GitHub repository
   - Choose branch (usually `main`)

### Step 4: Deploy

#### Automatic Deployment
- Push to `main` branch
- Vercel automatically deploys

#### Manual Deployment
1. **Vercel Dashboard → Your Project**
2. **Deployments tab**
3. **Click "Redeploy"** or create new deployment

### Step 5: Verify Deployment

1. **Check Build Logs**:
   - Vercel → Deployments → Click on deployment
   - Check "Build Logs" for errors
   - Should see: "Build Completed" ✅

2. **Test Production URL**:
   - Visit your Vercel deployment URL
   - Test all pages
   - Check browser console for errors

3. **Check Function Logs**:
   - Vercel → Functions tab
   - Monitor API route executions
   - Check for errors

## Testing After Deployment

### Smoke Tests
1. **Homepage loads** ✅
2. **Properties page loads** ✅
3. **Admin dashboard accessible** ✅
4. **API endpoints respond** ✅

### API Testing
```bash
# Replace with your Vercel URL
curl https://your-project.vercel.app/api/properties
curl https://your-project.vercel.app/api/status
curl https://your-project.vercel.app/api/agents
```

### Database Testing
1. Go to Wisconsin Supabase project
2. Check Table Editor for data
3. Verify admin user exists (if you created one)

## Common Issues and Solutions

### Issue: "Missing Supabase environment variables"
**Solution:**
- Check Vercel environment variables are set
- Verify variable names match exactly
- Redeploy after adding variables

### Issue: "Cannot connect to Supabase"
**Solution:**
- Verify Supabase project URL is correct
- Check anon key is correct
- Ensure Supabase project is active

### Issue: "Build fails"
**Solution:**
- Check build logs in Vercel
- Verify all dependencies are in `package.json`
- Check for TypeScript errors
- Ensure environment variables are set

### Issue: "Pages show empty/no data"
**Solution:**
- This is expected until MLS API is integrated
- You can manually add test data to Supabase tables
- Check Supabase RLS policies allow read access

### Issue: "Cron jobs not running"
**Solution:**
- Verify `vercel.json` has cron configuration
- Check Vercel → Functions → Cron Jobs
- Ensure endpoints exist: `/api/cron/daily-update`, `/api/cron/instagram`

## Vercel Configuration

Your `vercel.json` already includes:
- ✅ Next.js framework configuration
- ✅ Cron jobs configured
- ✅ Headers and security settings

**Cron Jobs:**
- Daily Update: Runs at 6 AM (`/api/cron/daily-update`)
- Instagram: Runs at 9 AM (`/api/cron/instagram`)

These will automatically work once deployed.

## Next Steps

### Immediate (Do Now)
1. ✅ Update code to use Wisconsin environment variables (or set Vercel vars to match code)
2. ✅ Run `supabase-wisconsin-setup.sql` in Wisconsin Supabase
3. ✅ Set Vercel environment variables
4. ✅ Deploy to Vercel
5. ✅ Test production site

### Short-term (This Week)
1. Add Wisconsin team data (agents, office staff) to Supabase
2. Test all functionality
3. Set up custom domain (if desired)
4. Configure Wisconsin MLS API (when credentials available)

### Long-term (This Month)
1. Integrate Wisconsin MLS API
2. Populate property listings
3. Content updates (Wisconsin locations, service areas)
4. SEO optimization
5. Analytics setup

## Quick Commands Reference

```bash
# Local Development
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Test production build
npm run start           # Test production server

# Testing
curl http://localhost:3000/api/properties    # Test properties API
curl http://localhost:3000/api/status        # Test status API

# Database Setup (in Supabase SQL Editor)
# Run: supabase-wisconsin-setup.sql
```

## Summary

✅ **You CAN use Vercel** - It's already configured!
✅ **You CAN test locally** - Use `npm run dev`
✅ **You're ready to deploy** - Just need to:
   1. Update code for Wisconsin variables (or match Vercel vars)
   2. Set environment variables in Vercel
   3. Deploy

**Estimated Time:**
- Code updates: 30 minutes (if I help)
- Environment setup: 15 minutes
- Testing: 30 minutes
- Deployment: 5 minutes (automatic)

**Total: ~1.5 hours to production-ready**

---

Need help updating the code to use Wisconsin environment variables? I can do that for you!

