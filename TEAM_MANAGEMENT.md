# Team Management System

This document describes the team management system that allows admins to add, edit, and remove agents and office staff from the Grandview Realty website.

## Overview

The team management system consists of:

1. **Database Tables**: `agents` and `office_staff` tables in Supabase
2. **API Endpoints**: RESTful APIs for CRUD operations
3. **Admin Interface**: Web-based management interface in the admin dashboard
4. **Public Pages**: Updated team pages that display data from the database

## Database Schema

### Agents Table

```sql
CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  logo_url VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(255),
  specialties TEXT[],
  experience VARCHAR(100),
  service_area VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Office Staff Table

```sql
CREATE TABLE office_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(255),
  responsibilities TEXT[],
  experience VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Admin Endpoints (Protected)

#### Agents
- `GET /api/admin/agents` - Get all agents
- `POST /api/admin/agents` - Create new agent
- `PUT /api/admin/agents/[id]` - Update agent
- `DELETE /api/admin/agents/[id]` - Delete agent

#### Office Staff
- `GET /api/admin/office-staff` - Get all office staff
- `POST /api/admin/office-staff` - Create new office staff member
- `PUT /api/admin/office-staff/[id]` - Update office staff member
- `DELETE /api/admin/office-staff/[id]` - Delete office staff member

### Public Endpoints

- `GET /api/agents` - Get active agents (for public display)
- `GET /api/office-staff` - Get active office staff (for public display)

## Admin Interface

### Accessing the Team Management

1. Navigate to `/admin`
2. Log in with admin credentials
3. Click "Manage Agents" or "Manage Office Staff" buttons

### Features

#### Agent Management
- **Add Agent**: Create new agents with all required information
- **Edit Agent**: Modify existing agent details
- **Delete Agent**: Remove agents from the system
- **Toggle Active Status**: Show/hide agents on the public site
- **Sort Order**: Control the display order of agents

#### Office Staff Management
- **Add Staff Member**: Create new office staff members
- **Edit Staff Member**: Modify existing staff details
- **Delete Staff Member**: Remove staff from the system
- **Toggle Active Status**: Show/hide staff on the public site
- **Sort Order**: Control the display order of staff

### Form Fields

#### Agent Fields
- **Slug** (required): URL-friendly identifier (e.g., "christopher-lobrillo")
- **Name** (required): Full name
- **Title** (required): Job title
- **Image URL**: Profile photo URL
- **Logo URL**: Professional logo URL
- **Phone**: Contact phone number
- **Email**: Contact email address
- **Specialties**: Array of specialties (Buyers, Sellers, Investors, etc.)
- **Experience**: Years of experience
- **Service Area**: Geographic service area
- **Description**: Detailed bio/description
- **Sort Order**: Display order (lower numbers appear first)
- **Active**: Whether to show on public site

#### Office Staff Fields
- **Name** (required): Full name
- **Title** (required): Job title
- **Image URL**: Profile photo URL
- **Phone**: Contact phone number
- **Email**: Contact email address
- **Responsibilities**: Array of job responsibilities
- **Experience**: Years of experience
- **Description**: Detailed bio/description
- **Sort Order**: Display order (lower numbers appear first)
- **Active**: Whether to show on public site

## Setup Instructions

### 1. Database Setup

Run the database setup script:

```bash
node scripts/setup-team-database.js
```

This will:
- Create the necessary database tables
- Add indexes for performance
- Insert sample data for existing agents and staff
- Set up triggers for automatic timestamp updates

### 2. Environment Variables

Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_BASE_URL=your_base_url
```

### 3. Admin Access

Make sure you have admin credentials set up in the `admin_users` table.

## Usage

### Adding a New Agent

1. Go to Admin Dashboard → Manage Agents
2. Click "Add Agent"
3. Fill in the required fields:
   - Slug: URL-friendly name (e.g., "john-doe")
   - Name: Full name
   - Title: Job title
4. Add optional information:
   - Contact details
   - Specialties
   - Experience
   - Service area
   - Description
   - Image/logo URLs
5. Set sort order and active status
6. Click "Add Agent"

### Adding a New Office Staff Member

1. Go to Admin Dashboard → Manage Office Staff
2. Click "Add Staff Member"
3. Fill in the required fields:
   - Name: Full name
   - Title: Job title
4. Add optional information:
   - Contact details
   - Responsibilities
   - Experience
   - Description
   - Image URL
5. Set sort order and active status
6. Click "Add Staff Member"

### Editing Existing Team Members

1. Go to the appropriate management page
2. Click "Edit" next to the team member
3. Modify the desired fields
4. Click "Update Agent" or "Update Staff Member"

### Removing Team Members

1. Go to the appropriate management page
2. Click "Delete" next to the team member
3. Confirm the deletion

**Note**: Deleted team members are permanently removed from the database.

## Public Display

The team management system automatically updates the public pages:

- `/team/agents` - Displays all active agents
- `/team/office-staff` - Displays all active office staff
- `/team/agents/[slug]` - Individual agent pages (if implemented)

## Security

- All admin endpoints require authentication
- Admin authentication is handled by the existing admin auth system
- Public endpoints only return active team members
- Input validation is performed on all form submissions

## Troubleshooting

### Common Issues

1. **"Agent with this slug already exists"**
   - Each agent must have a unique slug
   - Use a different slug or edit the existing agent

2. **"Failed to fetch agents/office staff"**
   - Check database connection
   - Verify environment variables
   - Check Supabase permissions

3. **Images not displaying**
   - Ensure image URLs are correct and accessible
   - Check that images are uploaded to the public directory

### Database Issues

If you need to reset the database:

```sql
-- Drop existing tables (WARNING: This will delete all data)
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS office_staff CASCADE;

-- Re-run the setup script
node scripts/setup-team-database.js
```

## Future Enhancements

Potential improvements to consider:

1. **Image Upload**: Direct image upload functionality
2. **Bulk Operations**: Import/export team data
3. **Advanced Filtering**: Search and filter team members
4. **Individual Pages**: Detailed individual agent/staff pages
5. **Contact Forms**: Direct contact forms for each team member
6. **Analytics**: Track team member page views and interactions 