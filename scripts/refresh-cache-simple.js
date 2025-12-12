#!/usr/bin/env node

/**
 * Simple script to refresh property cache by calling the Vercel API endpoint
 * This is the easiest approach - just calls your existing API
 * 
 * Usage:
 *   node scripts/refresh-cache-simple.js
 * 
 * Environment variables:
 *   - VERCEL_URL (or your domain)
 *   - CRON_SECRET (optional, for security)
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');
const http = require('http');

const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_WISCONSIN_BASE_URL || 'https://grandviewwisconsin.com';
const cronSecret = process.env.CRON_SECRET;

async function refreshCache() {
  console.log('🚀 Starting cache refresh via API...');
  
  // Ensure URL has https:// and no trailing slash
  let baseUrl = vercelUrl.trim();
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }
  // Remove trailing slash
  baseUrl = baseUrl.replace(/\/$/, '');
  
  const apiUrl = `${baseUrl}/api/admin/refresh-cache`;
  console.log(`📡 Calling: ${apiUrl}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

  return new Promise((resolve, reject) => {
    const makeRequest = (requestUrl, redirectCount = 0) => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      const urlObj = new URL(requestUrl);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      // Build request options
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GitHub-Actions-Cache-Refresh/1.0',
        }
      };
      
      // Add cron secret if provided
      if (cronSecret) {
        requestOptions.headers['x-cron-secret'] = cronSecret;
      }
      
      console.log(`📡 Making request to: ${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`);
      
      const req = client.request(requestOptions, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`🔄 Redirect ${res.statusCode} to: ${res.headers.location}`);
          const redirectUrl = res.headers.location.startsWith('http') 
            ? res.headers.location 
            : `${urlObj.protocol}//${urlObj.host}${res.headers.location}`;
          return makeRequest(redirectUrl, redirectCount + 1);
        }
        
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`📊 Response Status: ${res.statusCode} ${res.statusMessage}`);
          
          try {
            const response = JSON.parse(data);
            console.log('📦 Response:', JSON.stringify(response, null, 2));
            
            if (res.statusCode === 202 || res.statusCode === 200) {
              console.log('\n✅ Cache refresh initiated successfully!');
              console.log('⏳ Processing in background (this may take 20+ minutes)');
              console.log('📊 Check your Vercel function logs to monitor progress');
              resolve(response);
            } else {
              console.error('\n❌ Failed to trigger cache refresh');
              reject(new Error(`HTTP ${res.statusCode}: ${response.message || data}`));
            }
          } catch {
            console.log('📦 Response (raw):', data);
            if (res.statusCode === 202 || res.statusCode === 200) {
              console.log('\n✅ Cache refresh initiated successfully!');
              resolve({ success: true, message: 'Cache refresh initiated' });
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Request error:', error.message || error);
        console.error('❌ Error details:', {
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          hostname: urlObj.hostname
        });
        reject(error);
      });
      
      // Set a timeout for the request (30 seconds)
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout after 30 seconds'));
      });
      
      req.end();
    };
    
    makeRequest(apiUrl);
  });
}

// Run the refresh
refreshCache()
  .then(() => {
    console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('\n💡 Troubleshooting tips:');
    console.error('  1. Check that VERCEL_URL is set correctly');
    console.error('  2. Verify the URL is accessible');
    console.error('  3. Check that CRON_SECRET matches in both GitHub and Vercel');
    console.error('  4. Verify the API endpoint exists: /api/admin/refresh-cache');
    process.exit(1);
  });
