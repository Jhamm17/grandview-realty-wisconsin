# Property Caching and Admin System Setup

This guide will help you set up the new property caching system using Supabase and the admin interface for managing properties.

## Overview

The new system includes:
- **Supabase Database Caching**: Properties are cached in Supabase for faster loading
- **Server-Side Rendering**: Individual property pages are now server-side rendered for better performance
- **Admin Dashboard**: Manage properties and admin users
- **Static Generation**: Property pages are pre-generated for optimal performance

## Setup Steps

### 1. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Set up Database Tables

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase-setup.sql`
4. This will create the necessary tables and indexes

### 3. Add Your First Admin User

1. In the Supabase SQL Editor, run:
```sql
INSERT INTO admin_users (email, role) VALUES ('your-email@example.com', 'admin');
```
2. Replace `your-email@example.com` with your actual email address

### 4. Test the System

1. Start your development server: `npm run dev`
2. Visit `/admin` to access the admin dashboard
3. Click "Set Admin Email" and enter your email address
4. Test the "Refresh Properties" button to populate the cache

## Performance Improvements

### Before (5-10 seconds loading):
- Individual property pages fetched ALL properties from MLS API
- Client-side rendering with loading states
- In-memory caching that was lost on server restarts

### After (sub-second loading):
- Individual properties fetched directly from cache
- Server-side rendering with static generation
- Persistent database caching
- Pre-generated property pages

## Admin Features

### Property Management
- View all cached properties
- Refresh property cache from MLS API
- View property statistics (total, active, with images)
- Direct links to property pages

### User Management
- Add new admin users (admin or editor roles)
- Remove admin users
- View all admin users and their roles

## API Endpoints

### Public Endpoints
- `GET /api/properties` - Get all properties (cached)
- `GET /api/properties/[id]` - Get individual property (cached)

### Admin Endpoints
- `POST /api/admin/refresh-cache` - Refresh property cache (admin only)

## Environment Variables

Make sure you have these environment variables set:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MLS Grid (existing)
MLSGRID_ACCESS_TOKEN=your_mls_grid_token
NEXT_PUBLIC_BASE_URL=your_base_url
```

## Database Schema

### property_cache table
- `id`: UUID primary key
- `listing_id`: MLS listing ID (unique)
- `property_data`: JSONB property data
- `last_updated`: Timestamp of last update
- `is_active`: Boolean flag for active properties
- `created_at`: Creation timestamp

### admin_users table
- `id`: UUID primary key
- `email`: Admin email address (unique)
- `role`: 'admin' or 'editor'
- `created_at`: Creation timestamp

## Troubleshooting

### Cache not updating
1. Check that your admin email is in the `admin_users` table
2. Verify Supabase environment variables are correct
3. Check browser console for errors

### Properties not loading
1. Ensure MLS Grid token is valid
2. Check Supabase connection
3. Verify database tables were created correctly

### Admin dashboard not accessible
1. Make sure you've added your email to the `admin_users` table
2. Check that you're using the correct email in the admin interface

## Security Notes

- The current implementation uses simple email-based authentication
- For production, consider implementing proper authentication (OAuth, JWT, etc.)
- Row Level Security (RLS) is enabled but policies allow all access
- Consider restricting RLS policies based on your security requirements

## Next Steps

1. **Authentication**: Implement proper authentication system
2. **Property Editing**: Add ability to edit property details
3. **Image Management**: Add image upload and management
4. **Analytics**: Add property view analytics
5. **Notifications**: Add email notifications for new properties 