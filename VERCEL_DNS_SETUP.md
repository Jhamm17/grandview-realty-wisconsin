# Vercel DNS Configuration Guide

When you add your domain in Vercel, it will show you specific DNS records to configure. Here's how to implement them in Squarespace.

## Step 1: Check What Vercel Recommends

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Click on your domain (e.g., `grandviewwisconsin.com`)
3. Vercel will show you **"DNS Configuration"** with specific records

## Common Vercel DNS Recommendations

Vercel typically recommends one of these configurations:

### Option A: A Record (IP Address)
If Vercel shows an **A record** with an IP address:
- **Type:** `A`
- **Host:** `@` (or blank)
- **Value:** The IP address Vercel provides (e.g., `76.76.21.21`)

### Option B: CNAME Record
If Vercel shows a **CNAME record**:
- **Type:** `CNAME`
- **Host:** `@` (for root) or `www` (for subdomain)
- **Value:** `cname.vercel-dns.com` or similar

### Option C: ALIAS Record
Some DNS providers support ALIAS records for root domains:
- **Type:** `ALIAS` or `ANAME`
- **Host:** `@`
- **Value:** `cname.vercel-dns.com`

## Step 2: Configure in Squarespace

### For Root Domain (grandviewwisconsin.com)

**If Vercel recommends A Record:**
1. In Squarespace → **Settings** → **Domains** → Your Domain → **DNS Settings**
2. Click **Add Record**
3. **Type:** Select `A`
4. **Host:** Enter `@` or leave blank
5. **Points to:** Enter the IP address Vercel provided
6. **TTL:** 3600 (or default)
7. Click **Save**

**If Vercel recommends CNAME:**
1. In Squarespace → **Settings** → **Domains** → Your Domain → **DNS Settings**
2. Click **Add Record**
3. **Type:** Select `CNAME`
4. **Host:** Enter `@` or leave blank
5. **Points to:** Enter `cname.vercel-dns.com` (or what Vercel specified)
6. **TTL:** 3600 (or default)
7. Click **Save**

**Note:** Some DNS providers (including Squarespace) may not allow CNAME on root domain. If that's the case, use the A record option.

### For www Subdomain (www.grandviewwisconsin.com)

1. In Squarespace → **Settings** → **Domains** → Your Domain → **DNS Settings**
2. Click **Add Record**
3. **Type:** Select `CNAME`
4. **Host:** Enter `www`
5. **Points to:** Enter `cname.vercel-dns.com` (or what Vercel specified)
6. **TTL:** 3600 (or default)
7. Click **Save**

## Step 3: Remove Conflicting Records

**Important:** Before adding Vercel's records, check for and remove:

1. **Existing A records** pointing to Squarespace IPs (like `198.185.159.144` or similar)
2. **Existing CNAME records** pointing to Squarespace
3. Any other records that might conflict

**How to check:**
- Look through your DNS records in Squarespace
- Remove any that point to Squarespace servers (unless you're still using Squarespace for email, etc.)

## Step 4: Verify in Vercel

After adding the DNS records:

1. Go back to **Vercel Dashboard** → **Settings** → **Domains**
2. Your domain should show:
   - ⏳ **"Pending"** or **"Validating"** (waiting for DNS propagation)
   - ✅ **"Valid Configuration"** (once DNS has propagated)
   - ❌ **"Invalid Configuration"** (if there's an issue - click to see details)

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - This happens automatically once DNS is valid
   - You'll see a green checkmark when SSL is active

## Common Issues & Solutions

### Issue: "Invalid Configuration" in Vercel

**Possible causes:**
- DNS records not matching exactly what Vercel specified
- DNS hasn't propagated yet (wait 1-4 hours)
- Conflicting records still present

**Solution:**
- Double-check that your DNS records match **exactly** what Vercel shows
- Remove any conflicting records
- Wait for DNS propagation (check at https://www.whatsmydns.net/)

### Issue: Squarespace won't let you add CNAME for root domain

**Solution:**
- Use the A record option instead
- Vercel should provide an IP address for the A record
- If not, contact Vercel support or use the IP: `76.76.21.21`

### Issue: Domain still points to Squarespace site

**Solution:**
- Make sure you removed all Squarespace-specific DNS records
- Wait longer for DNS propagation (can take up to 48 hours)
- Clear your browser cache and try again

## Quick Checklist

- [ ] Added domain in Vercel Dashboard
- [ ] Noted the exact DNS records Vercel recommends
- [ ] Removed conflicting DNS records in Squarespace
- [ ] Added A record (or CNAME) for root domain as Vercel specified
- [ ] Added CNAME record for www subdomain
- [ ] Waited for DNS propagation (1-4 hours)
- [ ] Verified domain shows "Valid Configuration" in Vercel
- [ ] SSL certificate is active (green checkmark)
- [ ] Site accessible at your custom domain

## Need Help?

If Vercel is showing specific DNS records that don't match the examples above:
1. **Screenshot** what Vercel shows you
2. **Copy the exact values** Vercel provides
3. Use those exact values in Squarespace

The most important thing is to **match exactly** what Vercel recommends in your dashboard!

