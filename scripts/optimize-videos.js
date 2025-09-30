#!/usr/bin/env node

/**
 * Video Optimization Script for Grandview Realty
 * 
 * This script provides guidance for optimizing video files for web delivery.
 * You'll need to install FFmpeg to use the actual optimization commands.
 * 
 * Installation: brew install ffmpeg (macOS) or download from https://ffmpeg.org/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎬 Grandview Realty Video Optimization Guide\n');

// Check if videos exist
const publicDir = path.join(__dirname, '..', 'public');
const desktopVideo = path.join(publicDir, 'GrandviewHome.mp4');
const mobileVideo = path.join(publicDir, 'GrandviewMobile.mp4');

console.log('📁 Checking video files...\n');

if (fs.existsSync(desktopVideo)) {
  const stats = fs.statSync(desktopVideo);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Desktop video found: ${sizeMB}MB`);
} else {
  console.log('❌ Desktop video not found: GrandviewHome.mp4');
}

if (fs.existsSync(mobileVideo)) {
  const stats = fs.statSync(mobileVideo);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Mobile video found: ${sizeMB}MB`);
} else {
  console.log('❌ Mobile video not found: GrandviewMobile.mp4');
}

console.log('\n🚀 Optimization Recommendations:\n');

console.log('1. **Current Setup (Good for most cases):**');
console.log('   - Desktop: GrandviewHome.mp4 (1920x1080 or higher)');
console.log('   - Mobile: GrandviewMobile.mp4 (854x480 or 1280x720)');
console.log('   - Format: MP4 with H.264 codec');
console.log('   - Target size: < 20MB each\n');

console.log('2. **If you want to optimize further with FFmpeg:**\n');

console.log('Desktop optimization (1080p):');
console.log('ffmpeg -i GrandviewHome.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart GrandviewHome-optimized.mp4\n');

console.log('Mobile optimization (720p):');
console.log('ffmpeg -i GrandviewMobile.mp4 -vf scale=1280:720 -c:v libx264 -crf 25 -preset medium -c:a aac -b:a 96k -movflags +faststart GrandviewMobile-optimized.mp4\n');

console.log('3. **Alternative: WebM format (smaller, but less compatible):**');
console.log('ffmpeg -i GrandviewHome.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus GrandviewHome.webm\n');

console.log('4. **Performance Tips:**');
console.log('   - Use "faststart" flag for better streaming');
console.log('   - Keep videos under 20MB for fast loading');
console.log('   - Use appropriate resolution for device type');
console.log('   - Consider WebM as fallback for modern browsers\n');

console.log('5. **Current Implementation Features:**');
console.log('   ✅ Responsive video loading (desktop vs mobile)');
console.log('   ✅ Fallback to static image if video fails');
console.log('   ✅ Respects user\'s reduced motion preference');
console.log('   ✅ Connection speed detection');
console.log('   ✅ SEO optimized with structured data');
console.log('   ✅ Preloading for critical resources');
console.log('   ✅ Proper caching headers\n');

console.log('🎯 Your current setup should work well! The videos will:');
console.log('   - Load the appropriate version for each device');
console.log('   - Fall back gracefully if there are issues');
console.log('   - Respect accessibility preferences');
console.log('   - Be cached efficiently by browsers');

console.log('\n📊 To monitor performance:');
console.log('   - Check Network tab in browser DevTools');
console.log('   - Use Lighthouse for performance audits');
console.log('   - Monitor Core Web Vitals in Google Search Console'); 