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

const https = require('https');
const http = require('http');

const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_WISCONSIN_BASE_URL || 'https://grandviewwisconsin.com';
const cronSecret = process.env.CRON_SECRET;

async function refreshCache() {
  console.log('🚀 Starting cache refresh via API...');
  console.log(`📡 Calling: ${vercelUrl}/api/admin/refresh-cache`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

  const url = new URL(`${vercelUrl}/api/admin/refresh-cache`);
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  // Add cron secret if provided
  if (cronSecret) {
    options.headers['x-cron-secret'] = cronSecret;
  }

  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
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
        } catch (e) {
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
      console.error('❌ Request error:', error);
      reject(error);
    });
    
    req.end();
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
    process.exit(1);
  });
