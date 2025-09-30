import axios from 'axios';

export interface InstagramPost {
  url: string;
  caption: string;
  mediaUrl: string;
  timestamp: string;
  postId: string;
}

export class InstagramScraper {
  private static readonly USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  /**
   * Fetch latest Instagram posts from a public account
   */
  static async fetchLatestPosts(username: string, maxPosts: number = 8): Promise<InstagramPost[]> {
    try {
      console.log(`🔍 Fetching Instagram posts for @${username}...`);

      // Get the profile page HTML
      const url = `https://www.instagram.com/${username}/`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
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

      // Try to extract posts from the HTML
      const posts = await this.extractPostsFromHTML(html, maxPosts);
      
      if (posts.length > 0) {
        console.log(`✅ Found ${posts.length} Instagram posts`);
        return posts.slice(0, maxPosts);
      }

      console.log('❌ No posts found');
      return [];

    } catch (error) {
      console.log('❌ Error fetching Instagram posts:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Extract posts from Instagram HTML
   */
  private static async extractPostsFromHTML(html: string, maxPosts: number): Promise<InstagramPost[]> {
    const posts: InstagramPost[] = [];

    try {
      // Method 1: Look for Instagram's new ScheduledServerJS data structure
      const scheduledServerJSMatches = html.match(/<script type="application\/json"[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g);
      if (scheduledServerJSMatches) {
        console.log(`📊 Found ${scheduledServerJSMatches.length} ScheduledServerJS script tags`);
        
        for (const match of scheduledServerJSMatches) {
          try {
            const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
            const data = JSON.parse(jsonContent);
            
            // Debug: Log the structure of the data
            console.log('🔍 ScheduledServerJS data structure:', Object.keys(data));
            
            // Look for posts in the require array
            if (data.require && Array.isArray(data.require)) {
              console.log(`📊 Found require array with ${data.require.length} items`);
              
              for (let i = 0; i < data.require.length; i++) {
                const item = data.require[i];
                if (Array.isArray(item) && item.length >= 4) {
                  const [moduleName, functionName, , moduleData] = item;
                  
                  console.log(`🔍 Module ${i}: ${moduleName} (${functionName})`);
                  
                  // Look for Instagram's new profile page modules that contain post data
                  if (moduleName && typeof moduleName === 'string' && 
                      (moduleName.includes('ProfilePage') || 
                       moduleName.includes('Timeline') || 
                       moduleName.includes('Media') ||
                       moduleName.includes('Post') ||
                       moduleName.includes('Feed') ||
                       moduleName.includes('Grid') ||
                       moduleName.includes('Gallery') ||
                       moduleName.includes('Profile') ||
                       moduleName.includes('User') ||
                       moduleName.includes('Content'))) {
                    
                    console.log(`📸 Found potential post module: ${moduleName}`);
                    console.log('🔍 Module data structure:', moduleData ? Object.keys(moduleData) : 'null');
                    
                    // Extract posts from module data
                    const modulePosts = this.extractPostsFromModuleData(moduleData);
                    if (modulePosts.length > 0) {
                      posts.push(...modulePosts);
                      console.log(`📸 Found ${modulePosts.length} posts in module ${moduleName}`);
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.log('⚠️ Could not parse ScheduledServerJS JSON:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
      }

      // Method 2: Look for Instagram's new data structure in script tags
      const scriptMatches = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/g);
      if (scriptMatches) {
        console.log(`📊 Found ${scriptMatches.length} script tags, looking for post data...`);
        
        for (const scriptMatch of scriptMatches) {
          try {
            const scriptContent = scriptMatch.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
            
            // Look for Instagram's new data structure patterns
            const patterns = [
              /window\._sharedData\s*=\s*({.*?});/,
              /window\.__INITIAL_STATE__\s*=\s*({.*?});/,
              /window\.__APOLLO_STATE__\s*=\s*({.*?});/,
              /window\.__NEXT_DATA__\s*=\s*({.*?});/,
              /window\.__PRELOADED_STATE__\s*=\s*({.*?});/,
              /"entry_data":\s*({.*?})/,
              /"graphql":\s*({.*?})/,
              /"user":\s*({.*?})/,
              /"edge_owner_to_timeline_media":\s*({.*?})/
            ];
            
            for (const pattern of patterns) {
              const match = scriptContent.match(pattern);
              if (match) {
                try {
                  const data = JSON.parse(match[1]);
                  console.log('🔍 Found data structure with pattern:', pattern.toString());
                  
                  // Look for posts in various data structures
                  const foundPosts = this.extractPostsFromDataStructure(data);
                  if (foundPosts.length > 0) {
                    posts.push(...foundPosts);
                    console.log(`📸 Found ${foundPosts.length} posts in data structure`);
                  }
                } catch {
                  // Continue to next pattern
                }
              }
            }
          } catch {
            // Continue to next script
          }
        }
      }

      // Method 3: Look for post URLs in HTML and extract them directly
      if (posts.length === 0) {
        console.log('🔍 Looking for post URLs in HTML...');
        
        const postUrlRegex = /https:\/\/www\.instagram\.com\/p\/[A-Za-z0-9_-]+\//g;
        const postUrls = html.match(postUrlRegex);
        
        if (postUrls) {
          console.log(`🔗 Found ${postUrls.length} post URLs in HTML`);
          const uniqueUrls = [...new Set(postUrls)].slice(0, maxPosts);
          
          for (const postUrl of uniqueUrls) {
            try {
              const postDetails = await this.getPostDetails(postUrl);
              if (postDetails) {
                posts.push(postDetails);
              }
            } catch {
              // Continue to next URL
            }
          }
        }
      }

      console.log(`📸 Total posts found: ${posts.length}`);
      return posts;

    } catch (error) {
      console.log('❌ Error extracting posts from HTML:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  /**
   * Extract posts from module data
   */
  private static extractPostsFromModuleData(moduleData: any): InstagramPost[] {
    const posts: InstagramPost[] = [];
    
    try {
      // Look for posts in various possible structures
      if (moduleData?.user?.edge_owner_to_timeline_media?.edges) {
        const edges = moduleData.user.edge_owner_to_timeline_media.edges;
        for (const edge of edges) {
          posts.push({
            url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
            caption: edge.node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
            mediaUrl: edge.node.display_url || edge.node.thumbnail_src || '',
            timestamp: new Date(edge.node.taken_at_timestamp * 1000).toISOString(),
            postId: edge.node.shortcode
          });
        }
      }
      
      // Look for posts in the new Instagram structure
      if (moduleData?.items) {
        for (const item of moduleData.items) {
          if (item.code) {
            posts.push({
              url: `https://www.instagram.com/p/${item.code}/`,
              caption: item.caption?.text || '',
              mediaUrl: item.image_versions2?.candidates?.[0]?.url || item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url || '',
              timestamp: new Date(item.taken_at * 1000).toISOString(),
              postId: item.code
            });
          }
        }
      }
      
      // Look for posts in the new Instagram structure
      if (moduleData?.media) {
        for (const media of moduleData.media) {
          if (media.shortcode) {
            posts.push({
              url: `https://www.instagram.com/p/${media.shortcode}/`,
              caption: media.edge_media_to_caption?.edges?.[0]?.node?.text || '',
              mediaUrl: media.display_url || media.thumbnail_src || '',
              timestamp: new Date(media.taken_at_timestamp * 1000).toISOString(),
              postId: media.shortcode
            });
          }
        }
      }
      
    } catch (error) {
      console.log('❌ Error extracting posts from module data:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    return posts;
  }

  /**
   * Extract posts from various data structures
   */
  private static extractPostsFromDataStructure(data: any): InstagramPost[] {
    const posts: InstagramPost[] = [];
    
    try {
      // Look for posts in the traditional Instagram structure
      if (data?.entry_data?.ProfilePage?.[0]?.graphql?.user?.edge_owner_to_timeline_media?.edges) {
        const edges = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
        for (const edge of edges) {
          posts.push({
            url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
            caption: edge.node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
            mediaUrl: edge.node.display_url || edge.node.thumbnail_src || '',
            timestamp: new Date(edge.node.taken_at_timestamp * 1000).toISOString(),
            postId: edge.node.shortcode
          });
        }
      }
      
      // Look for posts in the new Instagram structure
      if (data?.user?.edge_owner_to_timeline_media?.edges) {
        const edges = data.user.edge_owner_to_timeline_media.edges;
        for (const edge of edges) {
          posts.push({
            url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
            caption: edge.node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
            mediaUrl: edge.node.display_url || edge.node.thumbnail_src || '',
            timestamp: new Date(edge.node.taken_at_timestamp * 1000).toISOString(),
            postId: edge.node.shortcode
          });
        }
      }
      
      // Look for posts in the new Instagram structure
      if (data?.edge_owner_to_timeline_media?.edges) {
        const edges = data.edge_owner_to_timeline_media.edges;
        for (const edge of edges) {
          posts.push({
            url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
            caption: edge.node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
            mediaUrl: edge.node.display_url || edge.node.thumbnail_src || '',
            timestamp: new Date(edge.node.taken_at_timestamp * 1000).toISOString(),
            postId: edge.node.shortcode
          });
        }
      }
      
      // Look for posts in the new Instagram structure
      if (data?.items) {
        for (const item of data.items) {
          if (item.code) {
            posts.push({
              url: `https://www.instagram.com/p/${item.code}/`,
              caption: item.caption?.text || '',
              mediaUrl: item.image_versions2?.candidates?.[0]?.url || item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url || '',
              timestamp: new Date(item.taken_at * 1000).toISOString(),
              postId: item.code
            });
          }
        }
      }
      
      // Look for posts in the new Instagram structure
      if (data?.media) {
        for (const media of data.media) {
          if (media.shortcode) {
            posts.push({
              url: `https://www.instagram.com/p/${media.shortcode}/`,
              caption: media.edge_media_to_caption?.edges?.[0]?.node?.text || '',
              mediaUrl: media.display_url || media.thumbnail_src || '',
              timestamp: new Date(media.taken_at_timestamp * 1000).toISOString(),
              postId: media.shortcode
            });
          }
        }
      }
      
    } catch (error) {
      console.log('❌ Error extracting posts from data structure:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    return posts;
  }

  /**
   * Get details for a specific Instagram post
   */
  private static async getPostDetails(postUrl: string): Promise<InstagramPost | null> {
    try {
      const response = await axios.get(postUrl, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 10000
      });

      const html = response.data;
      const postId = postUrl.split('/p/')[1]?.split('/')[0];
      
      if (!postId) return null;

      // Extract image URL from meta tags
      const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      const mediaUrl = imageMatch ? imageMatch[1] : '';

      // Extract caption from meta tags
      const captionMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
      const caption = captionMatch ? captionMatch[1] : '';

      return {
        url: postUrl,
        caption,
        mediaUrl,
        timestamp: new Date().toISOString(),
        postId
      };
    } catch (error) {
      console.log('❌ Post details failed:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
} 