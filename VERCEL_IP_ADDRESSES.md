# Vercel IP Addresses for A Records

If Squarespace requires an IP address for the A record (root domain), use these Vercel IP addresses:

## Vercel A Record IP Addresses

**Primary IP Addresses:**
- `76.76.21.21`
- `76.76.21.22`

**Alternative (if above don't work):**
- `76.76.19.19`
- `76.76.19.20`

## How to Set Up in Squarespace

1. **For Root Domain (grandviewwisconsin.com):**
   - **Type:** `A`
   - **Host:** `@` (or leave blank)
   - **Points to:** `76.76.21.21`
   - **TTL:** 3600 (or default)
   - Click **Save**

   Then add a second A record:
   - **Type:** `A`
   - **Host:** `@` (or leave blank)
   - **Points to:** `76.76.21.22`
   - **TTL:** 3600 (or default)
   - Click **Save**

2. **For www Subdomain:**
   - **Type:** `CNAME`
   - **Host:** `www`
   - **Points to:** `cname.vercel-dns.com`
   - **TTL:** 3600 (or default)
   - Click **Save**

## Important Notes

⚠️ **Vercel IP addresses can change!** The recommended approach is:

1. **Use Vercel's DNS records** (shown in Vercel Dashboard → Settings → Domains)
2. If Squarespace absolutely requires IP addresses, use the ones above
3. **Check Vercel Dashboard** - when you add your domain, Vercel will show you the exact DNS records needed

## Better Alternative: Use CNAME Flattening

If Squarespace supports it, you can use a CNAME record for the root domain pointing to:
- `cname.vercel-dns.com`

This is called "CNAME flattening" and is supported by many modern DNS providers.

## Verify in Vercel

After adding the DNS records:
1. Go to Vercel Dashboard → Settings → Domains
2. Your domain should show as "Valid Configuration" once DNS propagates
3. SSL certificate will be automatically provisioned

## Check Current Vercel IPs

To get the most up-to-date IP addresses:
1. Add your domain in Vercel Dashboard
2. Click on your domain in the Domains list
3. Vercel will show you the exact DNS records needed
4. If it shows A records, use those IP addresses

---

**Note:** Vercel's IP addresses are stable but can change. Always check what Vercel shows in your dashboard for the most current values.

