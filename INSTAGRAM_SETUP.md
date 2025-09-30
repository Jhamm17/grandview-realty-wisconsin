# Modern Instagram Integration Guide

## 🚨 Important: Instagram API Changes

**Instagram has significantly changed their API access policies.** The old Facebook Graph API approach is largely deprecated for most use cases. Here are the current modern approaches:

## 🎯 Current Instagram Integration Options

### **Option 1: Instagram oEmbed (Recommended)**
- **No API keys required**
- **Works with public Instagram posts**
- **Simple to implement**
- **Limited to specific post URLs you know**

### **Option 2: Instagram Basic Display API**
- **Requires Facebook Developer App**
- **Limited access to your own content**
- **Complex setup process**
- **May require app review**

### **Option 3: Third-Party Services**
- **Services like EmbedSocial, POWR, etc.**
- **Easy to implement**
- **Monthly fees**
- **Reliable and feature-rich**

### **Option 4: Manual Curation**
- **Manually add Instagram posts**
- **Full control over content**
- **No API dependencies**
- **Requires manual updates**

## 🚀 Quick Setup: Instagram oEmbed (Easiest)

### Step 1: Get Instagram Post URLs
1. Go to your Instagram profile
2. Copy URLs of posts you want to display
3. Example: `https://www.instagram.com/p/ABC123/`

### Step 2: Update Environment Variables
```env
# Instagram Configuration
INSTAGRAM_USERNAME=grandviewrealtygeneva
# Optional: Add specific post URLs
INSTAGRAM_POST_URLS=https://www.instagram.com/p/post1/,https://www.instagram.com/p/post2/
```

### Step 3: Test the Integration
1. Restart your development server
2. Visit `/community/social-media`
3. You should see your Instagram posts!

## 🔧 Advanced Setup: Instagram Basic Display API

### Step 1: Create Facebook Developer App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app (Consumer or Business type)
3. Add "Instagram Basic Display" product

### Step 2: Configure Your App
- **App Name**: "Grandview Realty Instagram Feed"
- **Privacy Policy URL**: `https://yourdomain.com/about/legal/privacy`
- **Terms of Service URL**: `https://yourdomain.com/terms`

### Step 3: Set Up OAuth
Add these redirect URIs:
```
http://localhost:3000/api/instagram/auth/callback
https://yourdomain.com/api/instagram/auth/callback
```

### Step 4: Generate Access Token
1. Go to "Instagram Basic Display" in your app
2. Click "Generate Token"
3. Follow the OAuth flow
4. Copy the access token

### Step 5: Add Environment Variables
```env
INSTAGRAM_ACCESS_TOKEN=your_access_token_here
```

## 🎯 Recommended Approach: Hybrid Solution

Our current implementation uses a **hybrid approach**:

1. **Try Instagram Basic Display API** (if access token available)
2. **Fall back to oEmbed** (for specific posts)
3. **Use mock data** (if all APIs fail)

This ensures your website always shows content, even if Instagram APIs are unavailable.

## 🆘 Troubleshooting

### "No Instagram products available"
- Instagram Basic Display is only available for certain app types
- Try creating a new app with "Consumer" or "Business" type
- Some accounts may be restricted

### "Access token expired"
- Instagram tokens expire frequently
- Generate a new token in Facebook app dashboard
- Consider using oEmbed approach instead

### "Posts not showing"
- Ensure Instagram posts are public
- Check that post URLs are correct
- Verify your Instagram account permissions

## 💡 Alternative Solutions

### **Third-Party Instagram Feed Services**
- **EmbedSocial**: `https://embedsocial.com/`
- **POWR**: `https://www.powr.io/`
- **Elfsight**: `https://elfsight.com/`

### **Manual Instagram Integration**
```javascript
// Add Instagram posts manually
const instagramPosts = [
  {
    id: '1',
    mediaUrl: '/path/to/image.jpg',
    permalink: 'https://www.instagram.com/p/post1/',
    caption: 'Beautiful property in Geneva!',
    timestamp: '2024-01-01T00:00:00Z'
  }
];
```

## 🎉 Success!

Your Instagram integration will:
- ✅ Work with current Instagram API policies
- ✅ Display beautiful Instagram content
- ✅ Handle API failures gracefully
- ✅ Provide fallback content
- ✅ Work across all devices

## 📞 Support

If you need help:
1. Check [Instagram's current API documentation](https://developers.facebook.com/docs/instagram-basic-display-api)
2. Consider third-party services for easier setup
3. Use the oEmbed approach for simple integration
4. Contact us for custom solutions 