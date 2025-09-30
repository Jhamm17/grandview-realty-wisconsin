# Wisconsin Website Setup Guide

This guide will help you set up the Wisconsin version of the Grandview Realty website.

## Overview

This is a separate website specifically for Wisconsin real estate operations, featuring:
- Wisconsin MLS API integration
- Separate Supabase database
- Wisconsin-specific content and branding
- Independent deployment pipeline

## Setup Steps

### 1. Wisconsin MLS API Setup

Research and configure the appropriate Wisconsin MLS system:

**Common Wisconsin MLS Providers:**
- **Metro MLS** (Milwaukee area)
- **South Central Wisconsin MLS**
- **Northwest Wisconsin MLS**
- **Wisconsin REALTORS® Association (WRA)**

**Required Information:**
- API endpoint URL
- Authentication credentials
- Data field mappings
- Rate limiting specifications

### 2. Supabase Database Setup

1. Create a new Supabase project for Wisconsin
2. Run the database setup script:
   ```sql
   -- Use the same supabase-setup.sql but with Wisconsin-specific data
   ```
3. Configure Wisconsin-specific CORS settings
4. Set up separate admin users

### 3. Environment Variables

Copy `env.wisconsin.example` to `.env.local` and fill in your Wisconsin-specific values:

```env
# Wisconsin MLS API
NEXT_PUBLIC_WISCONSIN_MLS_API_URL=your_wisconsin_mls_api_url
WISCONSIN_MLS_ACCESS_TOKEN=your_wisconsin_mls_access_token

# Wisconsin Supabase
NEXT_PUBLIC_WISCONSIN_SUPABASE_URL=your_wisconsin_supabase_url
NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY=your_wisconsin_supabase_anon_key

# Wisconsin Domain
NEXT_PUBLIC_WISCONSIN_BASE_URL=https://grandviewwisconsin.com
```

### 4. Content Updates

**Location-Specific Changes:**
- Update all "Chicagoland" references to Wisconsin areas
- Modify service areas in agent profiles
- Update property search filters for Wisconsin cities
- Change contact information and office locations

**Team Information:**
- Replace agent profiles with Wisconsin team members
- Update office staff information
- Modify specialties for Wisconsin market focus

### 5. Vercel Deployment

1. Create new Vercel project for Wisconsin
2. Connect to this GitHub repository
3. Set up custom domain (e.g., `grandviewwisconsin.com`)
4. Configure environment variables in Vercel dashboard
5. Set up cron jobs for Wisconsin data updates

### 6. Testing & Validation

- Test Wisconsin MLS API integration
- Validate property data accuracy
- Test admin dashboard functionality
- Verify cron jobs are working
- Test all forms and contact functionality

## Key Differences from Illinois Version

1. **MLS System**: Different API provider and data structure
2. **Database**: Separate Supabase project
3. **Content**: Wisconsin-specific locations and team
4. **Domain**: Separate domain and deployment
5. **Environment**: Wisconsin-specific configuration

## Next Steps

1. Research Wisconsin MLS providers
2. Set up Wisconsin Supabase project
3. Configure Wisconsin MLS API access
4. Update content and branding
5. Deploy to Vercel with Wisconsin domain
6. Test all functionality

## Support

For questions about Wisconsin-specific setup, refer to:
- Wisconsin MLS provider documentation
- Supabase documentation for multi-project setup
- Vercel documentation for custom domains
