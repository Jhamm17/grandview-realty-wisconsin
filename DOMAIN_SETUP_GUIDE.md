# Connecting Squarespace Domain to Vercel

This guide will help you connect your Squarespace domain to your Vercel deployment.

## Prerequisites

- ✅ Your site is deployed on Vercel
- ✅ You have a domain registered with Squarespace
- ✅ You have access to your Squarespace account

## Step-by-Step Instructions

### Step 1: Add Domain to Vercel

1. **Go to your Vercel project:**
   - Visit https://vercel.com/dashboard
   - Click on your `grandview-realty-wisconsin` project

2. **Navigate to Settings:**
   - Click on **Settings** in the top navigation
   - Click on **Domains** in the left sidebar

3. **Add your domain:**
   - Enter your domain (e.g., `grandviewwisconsin.com` or `www.grandviewwisconsin.com`)
   - Click **Add**
   - Vercel will show you the DNS records you need to configure

### Step 2: Get DNS Records from Vercel

After adding your domain, Vercel will display DNS configuration instructions. You'll typically see:

**For the root domain (grandviewwisconsin.com):**
- **Type:** `A` or `CNAME`
- **Name:** `@` or leave blank
- **Value:** Vercel will provide an IP address or CNAME target

**For www subdomain (www.grandviewwisconsin.com):**
- **Type:** `CNAME`
- **Name:** `www`
- **Value:** `cname.vercel-dns.com` or similar (Vercel will provide the exact value)

**Important:** Write down or screenshot these values - you'll need them in the next step!

### Step 3: Configure DNS in Squarespace

1. **Log into Squarespace:**
   - Go to https://www.squarespace.com/login
   - Log in to your account

2. **Navigate to Domain Settings:**
   - Click on **Settings** (gear icon)
   - Click on **Domains**
   - Find your domain and click on it

3. **Access DNS Settings:**
   - Click on **DNS Settings** or **Advanced DNS Settings**
   - If you see "Managed by Squarespace", you may need to:
     - Click **Use Squarespace Nameservers** (if you want Squarespace to manage DNS)
     - OR click **Connect External Domain** (if you want to use external DNS)

4. **Add DNS Records:**
   
   **For Root Domain (grandviewwisconsin.com):**
   - Click **Add Record**
   - **Type:** Select `A` or `CNAME` (as specified by Vercel)
   - **Host:** Enter `@` or leave blank
   - **Points to:** Enter the value Vercel provided
   - **TTL:** Leave default or set to 3600
   - Click **Save**

   **For www Subdomain:**
   - Click **Add Record**
   - **Type:** Select `CNAME`
   - **Host:** Enter `www`
   - **Points to:** Enter `cname.vercel-dns.com` (or what Vercel specified)
   - **TTL:** Leave default or set to 3600
   - Click **Save**

5. **Remove Conflicting Records:**
   - If there are any existing `A` or `CNAME` records pointing to Squarespace, you may need to remove or update them
   - Look for records pointing to Squarespace IPs (like `198.185.159.144` or similar)

### Step 4: Wait for DNS Propagation

- DNS changes can take **15 minutes to 48 hours** to propagate
- Typically takes **1-4 hours** for most changes
- You can check propagation status at: https://www.whatsmydns.net/

### Step 5: Verify Domain in Vercel

1. **Check Domain Status:**
   - Go back to Vercel → Settings → Domains
   - Your domain should show as **Valid Configuration** once DNS propagates
   - If it shows an error, click on it to see what's wrong

2. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates (HTTPS)
   - This usually happens automatically within a few minutes of DNS propagation
   - You'll see a green checkmark when SSL is active

### Step 6: Test Your Domain

Once DNS has propagated:

1. **Visit your domain:**
   - Go to `https://grandviewwisconsin.com` (or your domain)
   - You should see your Vercel-deployed site

2. **Test both versions:**
   - `https://grandviewwisconsin.com` (root)
   - `https://www.grandviewwisconsin.com` (www)
   - Both should work and redirect appropriately

## Common Issues & Solutions

### Issue: Domain shows "Invalid Configuration" in Vercel

**Solution:**
- Double-check that DNS records match exactly what Vercel specified
- Ensure there are no conflicting records
- Wait a bit longer for DNS propagation (can take up to 48 hours)

### Issue: Domain points to Squarespace site instead of Vercel

**Solution:**
- Make sure you've removed or updated any Squarespace-specific DNS records
- Check that your `A` or `CNAME` records point to Vercel, not Squarespace

### Issue: SSL certificate not provisioning

**Solution:**
- Wait 10-15 minutes after DNS propagation
- Check that your domain is properly configured in Vercel
- Try removing and re-adding the domain in Vercel

### Issue: www subdomain not working

**Solution:**
- Ensure you've added the `CNAME` record for `www`
- Check that it points to the correct Vercel CNAME target
- Wait for DNS propagation

## Alternative: Using Squarespace Nameservers

If you prefer to keep using Squarespace's DNS management:

1. **In Squarespace:**
   - Go to Domain Settings
   - Use Squarespace Nameservers (if not already)

2. **In Vercel:**
   - Add your domain
   - Follow the DNS record instructions
   - Add the records in Squarespace DNS settings

## Redirecting www to root (or vice versa)

Vercel automatically handles redirects, but you can configure this in `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "www.grandviewwisconsin.com"
        }
      ],
      "destination": "https://grandviewwisconsin.com/:path*",
      "permanent": true
    }
  ]
}
```

Or configure it in Vercel Dashboard → Settings → Domains → select domain → configure redirects.

## Need Help?

- **Vercel Support:** https://vercel.com/support
- **Squarespace Support:** https://support.squarespace.com
- **Check DNS propagation:** https://www.whatsmydns.net/

## Quick Checklist

- [ ] Domain added to Vercel project
- [ ] DNS records added in Squarespace
- [ ] Conflicting records removed
- [ ] Waited for DNS propagation (1-4 hours)
- [ ] Domain shows "Valid Configuration" in Vercel
- [ ] SSL certificate active (green checkmark)
- [ ] Site accessible at your domain
- [ ] Both www and root domain work

---

**Note:** If you're using a subdomain (like `app.grandviewwisconsin.com`), the process is the same but use a `CNAME` record pointing the subdomain to Vercel.

