const axios = require('axios');

async function testInstagramScraper() {
  console.log('🧪 Testing Instagram Scraper...\n');

  try {
    // Test 1: Get the actual HTML and look for post data
    console.log('📡 Testing Instagram HTML extraction...');
    const username = 'grandviewrealtygeneva';
    const url = `https://www.instagram.com/${username}/`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });

    const html = response.data;
    console.log(`📄 Got HTML response, length: ${html.length}`);

    // Look for post URLs in the HTML
    const postUrlRegex = /https:\/\/www\.instagram\.com\/p\/[A-Za-z0-9_-]+\//g;
    const postUrls = html.match(postUrlRegex);
    
    if (postUrls) {
      console.log(`🔗 Found ${postUrls.length} post URLs in HTML`);
      const uniqueUrls = [...new Set(postUrls)].slice(0, 5);
      console.log('📸 First 5 post URLs:');
      uniqueUrls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    } else {
      console.log('❌ No post URLs found in HTML');
    }

    // Look for script tags with data
    const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/g);
    if (scriptTags) {
      console.log(`📜 Found ${scriptTags.length} script tags`);
      
      // Look for script tags that might contain post data
      const dataScripts = scriptTags.filter(script => 
        script.includes('window._sharedData') || 
        script.includes('window.__INITIAL_STATE__') ||
        script.includes('window.__APOLLO_STATE__') ||
        script.includes('window.__NEXT_DATA__') ||
        script.includes('window.__PRELOADED_STATE__') ||
        script.includes('window.__REACT_QUERY__') ||
        script.includes('window.__SWR__') ||
        script.includes('edge_owner_to_timeline_media') ||
        script.includes('shortcode') ||
        script.includes('display_url')
      );
      
      console.log(`📊 Found ${dataScripts.length} data script tags`);
      
      dataScripts.forEach((script, index) => {
        console.log(`\n📜 Data script ${index + 1}:`);
        console.log(script.substring(0, 1000) + '...');
      });
    }

    // Look for JSON-LD structured data
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    if (jsonLdMatches) {
      console.log(`\n📊 Found ${jsonLdMatches.length} JSON-LD script tags`);
      jsonLdMatches.forEach((match, index) => {
        console.log(`\n📜 JSON-LD ${index + 1}:`);
        console.log(match.substring(0, 500) + '...');
      });
    }

    // Look for meta tags that might contain post data
    const metaTags = html.match(/<meta[^>]*>/g);
    if (metaTags) {
      console.log(`\n🏷️ Found ${metaTags.length} meta tags`);
      
      const relevantMetaTags = metaTags.filter(meta => 
        meta.includes('og:image') || 
        meta.includes('og:description') ||
        meta.includes('twitter:image') ||
        meta.includes('twitter:description')
      );
      
      console.log(`📸 Found ${relevantMetaTags.length} relevant meta tags`);
      relevantMetaTags.forEach((meta, index) => {
        console.log(`\n🏷️ Meta tag ${index + 1}:`);
        console.log(meta);
      });
    }

    // Look for any image URLs that might be posts
    const imageUrlRegex = /https:\/\/[^"]*\.(?:jpg|jpeg|png|webp)[^"]*/g;
    const imageUrls = html.match(imageUrlRegex);
    if (imageUrls) {
      console.log(`\n🖼️ Found ${imageUrls.length} image URLs`);
      const uniqueImageUrls = [...new Set(imageUrls)].slice(0, 5);
      console.log('📸 First 5 image URLs:');
      uniqueImageUrls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    }

    // Look for Instagram's new data structure in 2025
    console.log('\n🔍 Looking for Instagram data structures...');
    
    // Look for shared_data
    const sharedDataMatch = html.match(/<script type="text\/javascript">window\._sharedData = (.*?);<\/script>/);
    if (sharedDataMatch) {
      console.log('📊 Found shared_data script tag');
      try {
        const sharedData = JSON.parse(sharedDataMatch[1]);
        console.log('✅ Successfully parsed shared_data JSON');
        
        if (sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user?.edge_owner_to_timeline_media?.edges) {
          const edges = sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
          console.log(`📸 Found ${edges.length} posts in shared_data!`);
          
          edges.slice(0, 3).forEach((edge, index) => {
            console.log(`  ${index + 1}. https://www.instagram.com/p/${edge.node.shortcode}/`);
            console.log(`     Caption: ${edge.node.edge_media_to_caption?.edges?.[0]?.node?.text?.substring(0, 100) || 'No caption'}...`);
          });
        } else {
          console.log('❌ No posts found in shared_data structure');
        }
      } catch (error) {
        console.log('❌ Could not parse shared_data JSON:', error.message);
      }
    } else {
      console.log('❌ No shared_data script tag found');
    }

    // Look for additional data
    const additionalDataMatch = html.match(/<script type="text\/javascript">window\.__additionalDataLoaded\('\/[^']*',(.*?)\);<\/script>/);
    if (additionalDataMatch) {
      console.log('📊 Found additional data script tag');
      try {
        const additionalData = JSON.parse(additionalDataMatch[1]);
        console.log('✅ Successfully parsed additional data JSON');
        
        if (additionalData?.graphql?.user?.edge_owner_to_timeline_media?.edges) {
          const edges = additionalData.graphql.user.edge_owner_to_timeline_media.edges;
          console.log(`📸 Found ${edges.length} posts in additional data!`);
          
          edges.slice(0, 3).forEach((edge, index) => {
            console.log(`  ${index + 1}. https://www.instagram.com/p/${edge.node.shortcode}/`);
            console.log(`     Caption: ${edge.node.edge_media_to_caption?.edges?.[0]?.node?.text?.substring(0, 100) || 'No caption'}...`);
          });
        } else {
          console.log('❌ No posts found in additional data structure');
        }
      } catch (error) {
        console.log('❌ Could not parse additional data JSON:', error.message);
      }
    } else {
      console.log('❌ No additional data script tag found');
    }

    // Look for any script tags that contain post data
    const postDataScripts = scriptTags.filter(script => 
      script.includes('shortcode') && 
      script.includes('display_url') &&
      script.includes('edge_media_to_caption')
    );
    
    if (postDataScripts.length > 0) {
      console.log(`\n📸 Found ${postDataScripts.length} script tags with post data`);
      postDataScripts.forEach((script, index) => {
        console.log(`\n📜 Post data script ${index + 1}:`);
        console.log(script.substring(0, 1000) + '...');
      });
    } else {
      console.log('\n❌ No script tags with post data found');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testInstagramScraper(); 