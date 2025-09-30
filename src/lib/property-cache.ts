import { createClient } from '@supabase/supabase-js';
import { Property } from './mred/types';
import { MRED_CONFIG } from './mred/config';

export class PropertyCacheService {
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours - much longer cache
  private static lastApiCall = 0; // Track last API call time for rate limiting

  // Format image URL to use the existing Cloudflare Worker proxy
  private static formatImageUrl(mediaUrl: string): string {
    // If it's already a proxy URL, return as is
    if (mediaUrl.startsWith('https://grandview-realty.jphamm2001.workers.dev/proxy')) {
      return mediaUrl;
    }
    
    // Otherwise, construct the proxy URL
    const proxyBaseUrl = 'https://grandview-realty.jphamm2001.workers.dev/proxy';
    const encodedUrl = encodeURIComponent(mediaUrl);
    return `${proxyBaseUrl}?url=${encodedUrl}`;
  }

  // Process property media to use proxy URLs
  private static processPropertyMedia(property: Property): Property {
    if (!property.Media || !Array.isArray(property.Media)) {
      return property;
    }

    const processedMedia = property.Media.map(media => ({
      ...media,
      MediaURL: media.MediaURL ? this.formatImageUrl(media.MediaURL) : media.MediaURL
    }));

    return {
      ...property,
      Media: processedMedia
    };
  }
  
  // Use service role for admin operations (cache management)
  private static supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-key'
  );
  
  // Use regular client for public read operations
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key'
  );

  // Rate limiting helper - 2 requests per second
  private static async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    const minInterval = 1000 / MRED_CONFIG.MAX_REQUESTS_PER_SECOND; // 500ms between requests
    
    if (timeSinceLastCall < minInterval) {
      const waitTime = minInterval - timeSinceLastCall;
      console.log(`[Rate Limit] Waiting ${waitTime}ms before next API call...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastApiCall = Date.now();
  }

  // Get a single property from cache or fetch from API
  static async getProperty(listingId: string): Promise<Property | null> {
    try {
      // Use service role client to bypass RLS during build process
      const { data: cachedProperty, error } = await this.supabaseAdmin
        .from('property_cache')
        .select('*')
        .eq('listing_id', listingId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching from cache:', error);
      }

      if (cachedProperty) {
        const lastUpdated = new Date(cachedProperty.last_updated).getTime();
        const now = Date.now();
        
        // Check if cache is still fresh
        if (now - lastUpdated < this.CACHE_DURATION) {
          console.log(`[Cache] Serving cached property: ${listingId}`);
          // Process the cached property to use proxy URLs
          return this.processPropertyMedia(cachedProperty.property_data);
        }
      }

      // Cache miss or stale, fetch from API
      console.log(`[Cache] Fetching property from API: ${listingId}`);
      const property = await this.fetchPropertyFromAPI(listingId);
      
      if (property) {
        // Process property to use proxy URLs
        const processedProperty = this.processPropertyMedia(property);
        
        // Store processed property in cache
        await this.cacheProperty(processedProperty);
        
        return processedProperty;
      }

      return property;
    } catch (error) {
      console.error('Error in getProperty:', error);
      return null;
    }
  }

  // Get all active properties from cache or fetch from API
  static async getAllProperties(): Promise<Property[]> {
    try {
      // Check if we have valid Supabase configuration
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('PropertyCacheService: Missing Supabase configuration, returning empty array');
        return [];
      }

      // Use service role client to bypass RLS during build process
      const { data: cachedProperties, error } = await this.supabaseAdmin
        .from('property_cache')
        .select('*')
        .eq('is_active', true)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error fetching from cache:', error);
      }

      if (cachedProperties && cachedProperties.length > 0) {
        const oldestCache = Math.min(...cachedProperties.map(p => new Date(p.last_updated).getTime()));
        const now = Date.now();
        
        // Check if cache is still fresh
        if (now - oldestCache < this.CACHE_DURATION) {
          console.log(`[Cache] Serving ${cachedProperties.length} cached properties`);
          const allCachedProperties = cachedProperties.map(p => p.property_data);
          
          // Filter for only active properties (exclude under contract)
          const activeProperties = allCachedProperties.filter(property => 
            property.StandardStatus === 'Active'
          );
          
          console.log(`[Cache] Filtered to ${activeProperties.length} active properties`);
          
          // Process cached properties to use proxy URLs
          const processedProperties = activeProperties.map(property => 
            this.processPropertyMedia(property)
          );
          
          return processedProperties;
        }
      }

      // Cache miss or stale, fetch from API (like during deployment)
      console.log('[Cache] Fetching all properties from API');
      const properties = await this.fetchAllPropertiesFromAPI();
      
      if (properties.length > 0) {
        // Store all properties in cache
        await this.cacheAllProperties(properties);
      }

      // Filter for only active properties (exclude under contract)
      const activeProperties = properties.filter(property => 
        property.StandardStatus === 'Active'
      );
      
      console.log(`[Cache] Filtered to ${activeProperties.length} active properties`);
      return activeProperties;
    } catch (error) {
      console.error('Error in getAllProperties:', error);
      return [];
    }
  }

  // Get under contract properties
  static async getUnderContractProperties(): Promise<Property[]> {
    try {
      // Check if we have valid Supabase configuration
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('PropertyCacheService: Missing Supabase configuration, returning empty array');
        return [];
      }

      // Get all cached properties (including under contract)
      const { data: cachedProperties, error } = await this.supabaseAdmin
        .from('property_cache')
        .select('*')
        .eq('is_active', true)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error fetching from cache:', error);
        return [];
      }

      if (!cachedProperties || cachedProperties.length === 0) {
        console.log('[Cache] No cached properties found');
        return [];
      }

      const allCachedProperties = cachedProperties.map(p => p.property_data);
      
      // Filter for properties under contract using StandardStatus
      const underContractProperties = allCachedProperties.filter(property => 
        property.StandardStatus === 'ActiveUnderContract' || 
        property.StandardStatus === 'UnderContract' ||
        property.StandardStatus === 'Pending' ||
        property.StandardStatus === 'Contingent' ||
        property.StandardStatus === 'PendingContinueToShow' ||
        property.StandardStatus === 'PendingDoNotShow' ||
        property.StandardStatus === 'PendingTakingBackups' ||
        property.StandardStatus === 'PendingWithdrawn' ||
        property.StandardStatus === 'ContingentContinueToShow' ||
        property.StandardStatus === 'ContingentDoNotShow' ||
        property.StandardStatus === 'ContingentNoShow' ||
        property.StandardStatus === 'ContingentWithdrawn' ||
        property.StandardStatus?.includes('Contract') ||
        property.StandardStatus?.includes('Pending') ||
        property.StandardStatus?.includes('Contingent') ||
        property.StandardStatus?.includes('Under')
      );

      console.log(`[Cache] Found ${underContractProperties.length} under contract properties`);
      
      // If no under contract properties in cache, try to fetch them directly from API
      if (underContractProperties.length === 0) {
        console.log('[Cache] No under contract properties in cache, fetching from API...');
        const apiUnderContractProperties = await this.fetchUnderContractPropertiesFromAPI();
        return apiUnderContractProperties;
      }
      
      // Process cached properties to use proxy URLs
      const processedProperties = underContractProperties.map(property => 
        this.processPropertyMedia(property)
      );
      
      return processedProperties;
    } catch (error) {
      console.error('Error in getUnderContractProperties:', error);
      return [];
    }
  }

  // Fetch a single property from the MLS API
  private static async fetchPropertyFromAPI(listingId: string): Promise<Property | null> {
    try {
      console.log(`[API] 🚀 Fetching individual property: ${listingId}`);
      
      // Apply rate limiting
      await this.rateLimit();

      // Use the same working approach as bulk property calls
      const queryParams = new URLSearchParams({
        '$top': '1000',
        '$filter': 'MlgCanView eq true', // Simple filter that works
        '$orderby': 'ModificationTimestamp desc',
        '$expand': 'Media' // Include media/images
      });

      const url = `${MRED_CONFIG.API_BASE_URL}/Property?${queryParams.toString()}`;
      
      if (!MRED_CONFIG.ACCESS_TOKEN) {
        throw new Error('Access token not configured');
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${MRED_CONFIG.ACCESS_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.error('🚨 Rate limit exceeded for individual property fetch');
          throw new Error('Rate limit exceeded - please try again later');
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const allProperties = data.value || [];
      
      // Find the specific property by ListingId
      const property = allProperties.find((p: Property) => p.ListingId === listingId);
      
      if (property) {
        console.log(`[API] ✅ Found property ${listingId} with media data`);
      } else {
        console.log(`[API] ❌ Property ${listingId} not found in API response`);
      }
      
      return property || null;
    } catch (error) {
      console.error('Error fetching property from API:', error);
      return null;
    }
  }

  // Fetch under contract properties from the MLS API
  private static async fetchUnderContractPropertiesFromAPI(): Promise<Property[]> {
    try {
      console.log('[API] 🚀 Fetching under contract properties from MLS API...');
      console.log(`[API] 🔑 Using token: ${MRED_CONFIG.ACCESS_TOKEN ? 'SET' : 'NOT SET'}`);
      console.log(`[API] 📡 API URL: ${MRED_CONFIG.API_BASE_URL}`);
      
      // Apply rate limiting
      await this.rateLimit();

      const queryParams = new URLSearchParams({
        '$top': '100',
        '$filter': 'MlgCanView eq true and StandardStatus eq \'ActiveUnderContract\'',
        '$orderby': 'ModificationTimestamp desc',
        '$count': 'true',
        '$expand': 'Media'
      });

      const url = `${MRED_CONFIG.API_BASE_URL}/Property?${queryParams.toString()}`;
      
      if (!MRED_CONFIG.ACCESS_TOKEN) {
        throw new Error('Access token not configured');
      }

      console.log(`[API] 🌐 Making request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${MRED_CONFIG.ACCESS_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.error('🚨 Rate limit exceeded for under contract properties fetch');
          throw new Error('Rate limit exceeded - please try again later');
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      let allProperties = [...data.value];
      let nextLink = data['@odata.nextLink'];
      let pageCount = 1;

      console.log(`[API] Initial fetch: ${data.value.length} under contract properties, total count: ${data['@odata.count']}`);

      // Handle pagination with rate limiting
      while (nextLink && pageCount < 10) {
        pageCount++;
        console.log(`[API] Fetching page ${pageCount}...`);
        
        // Apply rate limiting before each pagination request
        await this.rateLimit();
        
        const nextResponse = await fetch(nextLink, {
          headers: {
            'Authorization': `Bearer ${MRED_CONFIG.ACCESS_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip'
          }
        });
        
        if (!nextResponse.ok) {
          if (nextResponse.status === 429) {
            console.error(`🚨 Rate limit exceeded on page ${pageCount}`);
            break;
          }
          console.error(`[API] Pagination request failed on page ${pageCount}:`, nextResponse.status);
          break;
        }
        
        const nextData = await nextResponse.json();
        allProperties = [...allProperties, ...nextData.value];
        nextLink = nextData['@odata.nextLink'];
        
        console.log(`[API] Page ${pageCount}: ${nextData.value.length} properties, total so far: ${allProperties.length}`);
      }

      console.log(`[API] ✅ Under contract fetch completed! Total properties: ${allProperties.length}`);
      return allProperties;
    } catch (error) {
      console.error('Error fetching under contract properties from API:', error);
      return [];
    }
  }

  // Public method for cron job to fetch fresh Active properties
  static async fetchFreshActiveProperties(): Promise<Property[]> {
    try {
      console.log('[API] 🚀 Fetching fresh Active properties from MLS API...');
      
      // Apply rate limiting
      await this.rateLimit();

      const queryParams = new URLSearchParams({
        '$top': '1000',
        '$filter': 'MlgCanView eq true', // Simple filter that works
        '$orderby': 'ModificationTimestamp desc',
        '$expand': 'Media' // Include media/images
      });

      const url = `${MRED_CONFIG.API_BASE_URL}/Property?${queryParams.toString()}`;
      
      if (!MRED_CONFIG.ACCESS_TOKEN) {
        throw new Error('Access token not configured');
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${MRED_CONFIG.ACCESS_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const allProperties = data.value || [];
      
      // Filter for Active properties in code
      const activeProperties = allProperties.filter((property: Property) => 
        property.StandardStatus === 'Active'
      );

      console.log(`[API] ✅ Fetched ${allProperties.length} total properties, filtered to ${activeProperties.length} Active properties from MLS API`);
      return activeProperties;

    } catch (error) {
      console.error('Error fetching fresh Active properties from API:', error);
      return [];
    }
  }

  // Public method for cron job to fetch fresh Under Contract properties
  static async fetchFreshUnderContractProperties(): Promise<Property[]> {
    try {
      console.log('[API] 🚀 Fetching fresh Under Contract properties from MLS API...');
      
      // Apply rate limiting
      await this.rateLimit();

      const queryParams = new URLSearchParams({
        '$top': '1000',
        '$filter': 'MlgCanView eq true', // Simple filter that works
        '$orderby': 'ModificationTimestamp desc',
        '$expand': 'Media' // Include media/images
      });

      const url = `${MRED_CONFIG.API_BASE_URL}/Property?${queryParams.toString()}`;
      
      if (!MRED_CONFIG.ACCESS_TOKEN) {
        throw new Error('Access token not configured');
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${MRED_CONFIG.ACCESS_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const allProperties = data.value || [];
      
      // Filter for Under Contract properties in code
      const underContractProperties = allProperties.filter((property: Property) => 
        property.StandardStatus === 'Active Under Contract'
      );

      console.log(`[API] ✅ Fetched ${allProperties.length} total properties, filtered to ${underContractProperties.length} Under Contract properties from MLS API`);
      return underContractProperties;

    } catch (error) {
      console.error('Error fetching fresh Under Contract properties from API:', error);
      return [];
    }
  }

  // Fetch all properties from the MLS API
  private static async fetchAllPropertiesFromAPI(): Promise<Property[]> {
    try {
      console.log('[API] 🚀 Starting fresh MLS data fetch...');
      console.log(`[API] 🔑 Using token: ${MRED_CONFIG.ACCESS_TOKEN ? 'SET' : 'NOT SET'}`);
      console.log(`[API] 📡 API URL: ${MRED_CONFIG.API_BASE_URL}`);
      
      // Apply rate limiting
      await this.rateLimit();

      const queryParams = new URLSearchParams({
        '$top': '100', // Reduced to 100 per page for better rate limiting
        '$filter': 'MlgCanView eq true',
        '$orderby': 'ModificationTimestamp desc',
        '$count': 'true',
        '$expand': 'Media'
      });

      const url = `${MRED_CONFIG.API_BASE_URL}/Property?${queryParams.toString()}`;
      
      if (!MRED_CONFIG.ACCESS_TOKEN) {
        throw new Error('Access token not configured');
      }

      console.log(`[API] 🌐 Making request to: ${url}`);
      console.log(`[API] 🔑 Authorization: Bearer ${MRED_CONFIG.ACCESS_TOKEN.substring(0, 10)}...`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${MRED_CONFIG.ACCESS_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.error('🚨 Rate limit exceeded for bulk property fetch');
          throw new Error('Rate limit exceeded - please try again later');
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      let allProperties = [...data.value];
      let nextLink = data['@odata.nextLink'];
      let pageCount = 1;

      console.log(`[API] Initial fetch: ${data.value.length} properties, total count: ${data['@odata.count']}`);

      // Handle pagination with rate limiting
      while (nextLink && pageCount < 20) { // Increased max pages
        pageCount++;
        console.log(`[API] Fetching page ${pageCount}...`);
        
        // Apply rate limiting before each pagination request
        await this.rateLimit();
        
        const nextResponse = await fetch(nextLink, {
          headers: {
            'Authorization': `Bearer ${MRED_CONFIG.ACCESS_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip'
          }
        });
        
        if (!nextResponse.ok) {
          if (nextResponse.status === 429) {
            console.error(`🚨 Rate limit exceeded on page ${pageCount}`);
            break; // Stop pagination if rate limited
          }
          console.error(`[API] Pagination request failed on page ${pageCount}:`, nextResponse.status);
          break;
        }
        
        const nextData = await nextResponse.json();
        allProperties = [...allProperties, ...nextData.value];
        nextLink = nextData['@odata.nextLink'];
        
        console.log(`[API] Page ${pageCount}: ${nextData.value.length} properties, total so far: ${allProperties.length}`);
      }

      // Filter for active and under contract properties (exclude sold)
      const availableProperties = allProperties.filter((property: Property) => 
        (property.StandardStatus === 'Active' || 
         property.StandardStatus === 'ActiveUnderContract' ||
         property.StandardStatus === 'UnderContract' ||
         property.StandardStatus === 'Pending' ||
         property.StandardStatus === 'Contingent') &&
        !property.StandardStatus.includes('Sold')
      );

      console.log(`[API] ✅ Fetch completed! Total properties: ${allProperties.length}, Available: ${availableProperties.length}`);
      return availableProperties;
    } catch (error) {
      console.error('Error fetching all properties from API:', error);
      return [];
    }
  }

  // Cache a single property
  private static async cacheProperty(property: Property): Promise<void> {
    try {
      const { error } = await this.supabaseAdmin
        .from('property_cache')
        .upsert({
          listing_id: property.ListingId,
          property_data: property,
          last_updated: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'listing_id'
        });

      if (error) {
        console.error('Error caching property:', error);
      } else {
        console.log(`[Cache] Cached property: ${property.ListingId}`);
      }
    } catch (error) {
      console.error('Error in cacheProperty:', error);
    }
  }

  // Cache all properties
  static async cacheAllProperties(properties: Property[]): Promise<void> {
    try {
      console.log(`[Cache] 🗄️ Caching ${properties.length} properties...`);
      
      // First, mark all existing properties as inactive
      const { error: deactivateError } = await this.supabaseAdmin
        .from('property_cache')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) {
        console.error('Error deactivating old properties:', deactivateError);
      } else {
        console.log('[Cache] Deactivated old properties');
      }

      // Then insert all new properties in batches
      const batchSize = 50;
      for (let i = 0; i < properties.length; i += batchSize) {
        const batch = properties.slice(i, i + batchSize);
        
        // Process properties to use proxy URLs
        const processedBatch = batch.map(property => 
          this.processPropertyMedia(property)
        );
        
        const cacheData = processedBatch.map(property => ({
          listing_id: property.ListingId,
          property_data: property,
          last_updated: new Date().toISOString(),
          is_active: true
        }));

        const { error } = await this.supabaseAdmin
          .from('property_cache')
          .upsert(cacheData, {
            onConflict: 'listing_id'
          });

        if (error) {
          console.error(`Error caching batch ${Math.floor(i/batchSize) + 1}:`, error);
        } else {
          console.log(`[Cache] ✅ Cached batch ${Math.floor(i/batchSize) + 1}: ${batch.length} properties`);
        }
      }

      console.log(`[Cache] 🎯 Successfully cached all ${properties.length} properties!`);
    } catch (error) {
      console.error('Error in cacheAllProperties:', error);
    }
  }

  // Clear all cache
  static async clearCache(): Promise<void> {
    try {
      console.log('[Cache] 🗑️ Clearing entire property cache...');
      
      const { error } = await this.supabaseAdmin
        .from('property_cache')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        console.error('Error clearing cache:', error);
      } else {
        console.log('[Cache] ✅ Cache completely cleared!');
      }
    } catch (error) {
      console.error('Error in clearCache:', error);
    }
  }
} 