export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle image proxy requests
    if (url.pathname === '/proxy' && url.searchParams.has('url')) {
      const targetUrl = url.searchParams.get('url');
      
      if (!targetUrl) {
        return new Response('Missing url parameter', { status: 400 });
      }
      
      try {
        // Decode the URL
        const decodedUrl = decodeURIComponent(targetUrl);
        
        // Fetch the image from the target URL
        // Note: S3 URLs don't need authentication, they're public
        const response = await fetch(decodedUrl, {
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Grandview-Realty/1.0'
          }
        });
        
        if (!response.ok) {
          console.log(`Proxy error: ${response.status} ${response.statusText} for ${decodedUrl}`);
          return new Response(`Failed to fetch image: ${response.status}`, { status: response.status });
        }
        
        // Create a new response with optimized caching headers
        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers),
            'Cache-Control': 'public, max-age=2592000, s-maxage=2592000', // Cache for 30 days
            'CDN-Cache-Control': 'public, max-age=2592000',
            'Vary': 'Accept-Encoding',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
          }
        });
        
        return newResponse;
      } catch (error) {
        console.log(`Proxy error: ${error.message}`);
        return new Response(`Proxy error: ${error.message}`, { status: 500 });
      }
    }
    
    // Forward other requests to Vercel deployment
    const vercelUrl = 'https://grandviewsells.com';
    
    // Create new request to Vercel with additional headers
    const modifiedRequest = new Request(
      `${vercelUrl}${url.pathname}${url.search}`,
      {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          'User-Agent': 'Mozilla/5.0 (compatible; GrandViewRealty/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        body: request.body,
        redirect: 'follow',
      }
    );

    return fetch(modifiedRequest);
  }
} 