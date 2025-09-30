# 🔒 Supabase Security Lockdown Guide

This guide will help you lock down your Supabase API to prevent unauthorized access and REST API abuse.

## 🚨 CRITICAL: Apply These Security Measures Immediately

### Step 1: Run the Security Lockdown Script

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Create a new query

3. **Run the Security Script**
   - Copy the entire contents of `scripts/lockdown-supabase.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Verify the Changes**
   - Check that all policies were created successfully
   - Verify RLS is enabled on all tables

### Step 2: Update Supabase Project Settings

1. **Authentication Settings**
   - Go to Authentication → Settings
   - **Disable "Enable sign up"** (CRITICAL!)
   - Enable "Enable email confirmations"
   - Set minimum password length to 8
   - Enable all password requirements

2. **API Settings**
   - Go to Settings → API
   - **Copy your `service_role` key** (keep this secret!)
   - Note your `anon` key (this is public but restricted)

3. **Database Settings**
   - Go to Settings → Database
   - Enable "Row Level Security (RLS)"
   - Enable "Connection pooling"

### Step 3: Environment Variables

Update your environment variables to use the service role for admin operations:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Add this!
```

### Step 4: Update Your Application Code

The security lockdown will require some code changes:

1. **Use Service Role for Admin Operations**
   ```typescript
   // In your admin API routes, use service role
   const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );
   ```

2. **Update Property Cache Service**
   ```typescript
   // Use service role for cache operations
   export class PropertyCacheService {
     private static supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!
     );
   }
   ```

## 🔐 Security Features Implemented

### Row Level Security (RLS) Policies

1. **Property Cache Table**:
   - ✅ Public can read ALL properties (website visitors)
   - ✅ Only admins/service role can write/modify
   - ✅ Admin portal remains secure

2. **Admin Users Table**:
   - ✅ Users can only read their own record
   - ✅ Admins can read all admin users
   - ✅ Only admins/service role can create/delete users
   - ✅ Users can update their own record

### API Restrictions

1. **Authentication Required**:
   - ✅ All API calls require authentication
   - ✅ Public signup disabled
   - ✅ Rate limiting enabled

2. **CORS Restrictions**:
   - ✅ Only your domains allowed
   - ✅ Secure headers enabled
   - ✅ XSS protection enabled

3. **Rate Limiting**:
   - ✅ 60 requests per minute globally
   - ✅ 30 requests per minute per user
   - ✅ IP blocking for failed auth attempts

### Audit Logging

1. **Admin Actions Logged**:
   - ✅ All admin user changes tracked
   - ✅ Property cache operations logged
   - ✅ Only admins can view audit logs

## 🛡️ What This Prevents

### REST API Abuse
- ❌ No unauthorized property cache modifications
- ❌ No unauthorized admin user creation
- ❌ No brute force attacks (rate limited)
- ✅ Public can still view properties (website works)

### Data Breaches
- ❌ No public access to admin user data
- ❌ No unauthorized property data modifications
- ❌ No SQL injection (parameterized queries only)
- ✅ Public can still view property listings

### Account Takeover
- ❌ No public signup
- ❌ Strong password requirements
- ❌ IP blocking for failed attempts
- ❌ Session timeout enforcement

## 🔍 Monitoring & Alerts

### Check Security Status

Run this query in Supabase SQL Editor to verify security:

```sql
-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public';

-- Check recent audit logs
SELECT 
  action,
  table_name,
  created_at,
  user_id
FROM audit_log 
ORDER BY created_at DESC 
LIMIT 10;
```

### Set Up Alerts

1. **Failed Authentication Alerts**:
   - Monitor for multiple failed login attempts
   - Set up email alerts for suspicious activity

2. **Admin Action Alerts**:
   - Monitor audit logs for unusual admin actions
   - Alert on new admin user creation

3. **API Usage Alerts**:
   - Monitor for unusual API usage patterns
   - Alert on rate limit violations

## 🚨 Emergency Procedures

### If You Suspect a Breach

1. **Immediate Actions**:
   ```sql
   -- Disable all user accounts
   UPDATE admin_users SET is_active = false;
   
   -- Check audit logs for suspicious activity
   SELECT * FROM audit_log WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

2. **Reset Admin Access**:
   ```sql
   -- Create emergency admin account
   INSERT INTO admin_users (id, email, role, created_at)
   VALUES (gen_random_uuid(), 'emergency@yourdomain.com', 'admin', NOW());
   ```

3. **Contact Support**:
   - Supabase Support: https://supabase.com/support
   - Your hosting provider (Vercel)

## 📋 Security Checklist

- [ ] Run security lockdown script
- [ ] Disable public signup in Supabase dashboard
- [ ] Update environment variables
- [ ] Test admin functionality
- [ ] Verify RLS policies are working
- [ ] Set up monitoring alerts
- [ ] Document emergency procedures
- [ ] Train team on security protocols

## 🔄 Regular Security Maintenance

### Monthly Tasks
- [ ] Review audit logs
- [ ] Check for failed authentication attempts
- [ ] Update admin user permissions
- [ ] Review API usage patterns

### Quarterly Tasks
- [ ] Rotate service role keys
- [ ] Review and update security policies
- [ ] Conduct security audit
- [ ] Update security documentation

## 📞 Support

If you encounter issues implementing these security measures:

1. **Check Supabase Documentation**: https://supabase.com/docs/guides/auth/row-level-security
2. **Supabase Community**: https://github.com/supabase/supabase/discussions
3. **Emergency Contact**: Your project's security team

---

**⚠️ IMPORTANT**: This security lockdown is essential for protecting your data. Apply these measures immediately to prevent unauthorized access to your Supabase API. 