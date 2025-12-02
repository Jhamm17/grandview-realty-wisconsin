# Wisconsin Integration Guide - Action Plan

## Current Status ✅

You already have:
- ✅ Wisconsin Supabase project created
- ✅ Wisconsin Vercel project created
- ✅ Database schema ready (`supabase-wisconsin-setup.sql`)

## What Needs to be Done

### Step 1: Update Code to Use Wisconsin Environment Variables

The codebase currently uses generic environment variable names. We need to update them to use Wisconsin-specific variables.

**Files to Update:**
1. `src/lib/supabase.ts` - Main Supabase client
2. `src/lib/property-cache.ts` - Property cache service
3. `src/lib/agent-cache.ts` - Agent cache service
4. `src/lib/agent-service.ts` - Agent service
5. `src/lib/agent-listings.ts` - Agent listings
6. All API routes that use Supabase

**Current Variables → Wisconsin Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` → `NEXT_PUBLIC_WISCONSIN_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` → `WISCONSIN_SUPABASE_SERVICE_ROLE_KEY`
- `MLSGRID_ACCESS_TOKEN` → `WISCONSIN_MLS_ACCESS_TOKEN` (when API is ready)

### Step 2: Set Up Local Environment

1. **Create `.env.local` file** (if not exists):
   ```bash
   cp env.wisconsin.example .env.local
   ```

2. **Get Wisconsin Supabase Credentials**:
   - Go to your Wisconsin Supabase project
   - Settings → API
   - Copy:
     - Project URL → `NEXT_PUBLIC_WISCONSIN_SUPABASE_URL`
     - `anon` `public` key → `NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY`
     - `service_role` `secret` key → `WISCONSIN_SUPABASE_SERVICE_ROLE_KEY`

3. **Fill in `.env.local`**:
   ```env
   # Wisconsin Supabase (fill these in)
   NEXT_PUBLIC_WISCONSIN_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY=your-anon-key
   WISCONSIN_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Wisconsin MLS API (leave empty until you have credentials)
   NEXT_PUBLIC_WISCONSIN_MLS_API_URL=
   WISCONSIN_MLS_ACCESS_TOKEN=

   # Other variables as needed
   RESEND_API_KEY=your-resend-key
   INSTAGRAM_ACCESS_TOKEN=your-instagram-token
   ```

### Step 3: Run Database Setup

1. **Go to Wisconsin Supabase Project**
2. **SQL Editor** → New Query
3. **Copy and run** `supabase-wisconsin-setup.sql`
4. **Verify tables created**:
   - Check Table Editor for: `property_cache`, `agents`, `office_staff`, `admin_users`, etc.

### Step 4: Test Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Test pages**:
   - Visit `http://localhost:3000`
   - Visit `http://localhost:3000/properties`
   - Visit `http://localhost:3000/admin`
   - Visit `http://localhost:3000/team/agents`

4. **Check for errors**:
   - Terminal logs
   - Browser console
   - Network tab for API calls

### Step 5: Configure Vercel Project

1. **Go to your Wisconsin Vercel project**
2. **Settings → Environment Variables**
3. **Add all Wisconsin variables**:
   - Copy from your `.env.local`
   - Add each variable
   - Set for: Production, Preview, Development

4. **Required Variables**:
   ```
   NEXT_PUBLIC_WISCONSIN_SUPABASE_URL
   NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY
   WISCONSIN_SUPABASE_SERVICE_ROLE_KEY
   WISCONSIN_MLS_ACCESS_TOKEN (when ready)
   RESEND_API_KEY
   INSTAGRAM_ACCESS_TOKEN
   VERCEL_TOKEN
   VERCEL_PROJECT_ID
   ```

### Step 6: Deploy to Vercel

1. **Connect Repository** (if not connected):
   - Vercel project → Settings → Git
   - Connect your GitHub repository

2. **Deploy**:
   - Push to main branch (auto-deploys)
   - Or manually deploy from Vercel dashboard

3. **Check Deployment**:
   - View deployment logs
   - Verify build succeeds
   - Test production URL

## Testing Checklist

### Local Testing
- [ ] Dev server starts without errors
- [ ] Home page loads
- [ ] Properties page loads (may be empty without MLS API)
- [ ] Admin dashboard accessible
- [ ] Supabase connection works (check browser console)
- [ ] Build succeeds: `npm run build`

### Supabase Testing
- [ ] Can connect to Wisconsin Supabase
- [ ] All tables exist
- [ ] Can read from `agents` table
- [ ] Can read from `office_staff` table
- [ ] Admin user can be created

### Vercel Testing
- [ ] Build succeeds on Vercel
- [ ] Production site loads
- [ ] Environment variables are set
- [ ] API routes work (check Network tab)
- [ ] Cron jobs configured (check Functions tab)

## Next Steps After Integration

### When Wisconsin MLS API is Ready:
1. Get API credentials from Wisconsin MLS provider
2. Update `src/lib/mred/config.ts` or create Wisconsin MLS service
3. Add `WISCONSIN_MLS_ACCESS_TOKEN` to environment variables
4. Test API integration
5. Populate property cache

### Content Updates:
1. Update agent profiles in Supabase
2. Update office staff information
3. Update service areas to Wisconsin locations
4. Update contact information

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` has Wisconsin variables
- Restart dev server after adding variables
- Verify variable names match exactly

### "Cannot connect to Supabase"
- Verify Supabase project URL is correct
- Check anon key is correct
- Verify Supabase project is active

### "Build fails on Vercel"
- Check Vercel environment variables are set
- Verify all required variables are present
- Check build logs for specific errors

### "Properties page shows no data"
- This is expected until MLS API is integrated
- You can test by manually adding properties to `property_cache` table

## Quick Reference

### Environment Variables Map

| Current Code Uses | Should Be (Wisconsin) |
|------------------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_WISCONSIN_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | `WISCONSIN_SUPABASE_SERVICE_ROLE_KEY` |
| `MLSGRID_ACCESS_TOKEN` | `WISCONSIN_MLS_ACCESS_TOKEN` |

### Key Files to Update

1. `src/lib/supabase.ts` - Main Supabase client
2. `src/lib/property-cache.ts` - Property caching
3. `src/lib/agent-cache.ts` - Agent caching
4. `src/lib/agent-service.ts` - Agent service
5. `src/lib/agent-listings.ts` - Agent listings
6. All files in `src/app/api/` that use Supabase

### Supabase Tables Needed

- `property_cache` - Property listings cache
- `agents` - Real estate agents
- `office_staff` - Office personnel
- `admin_users` - Admin authentication
- `agent_cache` - Agent listings cache
- `instagram_posts` - Instagram feed
- `careers` - Job postings
- `cached_images` - Image cache

---

**Ready to proceed?** Let me know if you'd like me to update the code files to use Wisconsin environment variables!

