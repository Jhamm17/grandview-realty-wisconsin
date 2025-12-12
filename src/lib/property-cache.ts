import { createClient } from '@supabase/supabase-js';
import { Property } from './mred/types';
import { WISCONSIN_MLS_CONFIG } from './wisconsin-mls/config';
import { wisconsinMLSService } from './wisconsin-mls/api';
import { wisconsinMLSAuth } from './wisconsin-mls/auth';

export class PropertyCacheService {
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours - much longer cache
  private static lastApiCall = 0; // Track last API call time for rate limiting

  // Process property media - now using direct URLs from API (no proxy needed)
  // The API provides direct URLs from cdn.photos.sparkplatform.com
  private static processPropertyMedia(property: Property): Property {
    // No transformation needed - API URLs are used directly
    // This function is kept for consistency but doesn't modify URLs anymore
    return property;
  }
  
  // Use service role for admin operations (cache management)
  private static getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL;
    const key = process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      console.warn('[Cache] Missing Supabase configuration (NEXT_PUBLIC_WISCONSIN_SUPABASE_URL or WISCONSIN_SUPABASE_SERVICE_ROLE_KEY)');
      return null;
    }
    
    return createClient(url, key);
  }
  
  // Use regular client for public read operations
  private static getSupabase() {
    const url = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.warn('[Cache] Missing Supabase configuration (NEXT_PUBLIC_WISCONSIN_SUPABASE_URL or NEXT_PUBLIC_WISCONSIN_SUPABASE_ANON_KEY)');
      return null;
    }
    
    return createClient(url, key);
  }

  // Rate limiting helper - 2 requests per second
  private static async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    const minInterval = 1000 / WISCONSIN_MLS_CONFIG.MAX_REQUESTS_PER_SECOND; // 500ms between requests
    
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
      // Try to fetch from cache first
      const supabaseAdmin = this.getSupabaseAdmin();
      if (supabaseAdmin) {
        try {
          const { data: cachedProperty, error } = await supabaseAdmin
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
        } catch (cacheError) {
          console.warn('[Cache] Error accessing cache, falling back to API:', cacheError);
          // Continue to API fetch if cache fails
        }
      }

      // Cache miss or stale, fetch from API
      console.log(`[Cache] Fetching property from API: ${listingId}`);
      const property = await this.fetchPropertyFromAPI(listingId);
      
      if (property) {
        // Process property to use proxy URLs
        const processedProperty = this.processPropertyMedia(property);
        
        // Try to store in cache (don't fail if this doesn't work)
        if (supabaseAdmin) {
          try {
            await this.cacheProperty(processedProperty);
          } catch (cacheError) {
            console.warn('[Cache] Failed to cache property, but returning it anyway:', cacheError);
          }
        }
        
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
      if (!process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL || !process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('PropertyCacheService: Missing Supabase configuration, returning empty array');
        return [];
      }

      // Use service role client to bypass RLS during build process
      let cachedProperties;
      let cacheError;
      
      const supabaseAdmin = this.getSupabaseAdmin();
      if (supabaseAdmin) {
        try {
          const result = await supabaseAdmin
            .from('property_cache')
            .select('*')
            .eq('is_active', true)
            .order('last_updated', { ascending: false });
          
          cachedProperties = result.data;
          cacheError = result.error;
        } catch (fetchError: any) {
          console.error('Error fetching from cache (fetch failed):', fetchError.message || fetchError);
          // If Supabase fetch fails, continue to API fetch instead
          cacheError = fetchError;
          cachedProperties = null;
        }
      } else {
        console.warn('[Cache] Supabase not configured, skipping cache lookup');
        cachedProperties = null;
      }

      if (cacheError) {
        console.error('Error fetching from cache:', {
          message: cacheError.message || 'Unknown error',
          details: cacheError.details || cacheError.toString(),
          code: cacheError.code || 'unknown'
        });
        // Continue to API fetch instead of returning empty
      }

      if (cachedProperties && cachedProperties.length > 0) {
        const oldestCache = Math.min(...cachedProperties.map(p => new Date(p.last_updated).getTime()));
        const now = Date.now();
        
        // Check if cache is still fresh
        if (now - oldestCache < this.CACHE_DURATION) {
          console.log(`[Cache] Serving ${cachedProperties.length} cached properties`);
          const allCachedProperties = cachedProperties.map(p => p.property_data);
          
          // Filter for only active properties (exclude under contract)
          // Note: Cache should only contain Grandview Realty properties
          // Use MlsStatus as primary, fallback to StandardStatus
          const activeProperties = allCachedProperties.filter(property => {
            const status = property.MlsStatus || property.StandardStatus || '';
            return status === 'Active';
          });
          
          console.log(`[Cache] Filtered to ${activeProperties.length} active properties from Grandview Realty`);
          
          // Process cached properties to use proxy URLs
          const processedProperties = activeProperties.map(property => 
            this.processPropertyMedia(property)
          );
          
          return processedProperties;
        }
      }

      // Cache miss or stale - don't fetch during page render (takes too long)
      // Return empty array and let the cron job populate the cache
      console.log('[Cache] Cache miss or stale - returning empty array');
      console.log('[Cache] Cache will be populated by the scheduled cron job');
      return [];
      
      // Note: Removed automatic API fetch during page render because it takes ~20 minutes
      // The cron job will populate the cache automatically
      // const properties = await this.fetchAllPropertiesFromAPI();
      
      console.log(`[Cache] Fetched ${properties.length} properties from API`);
      
      if (properties.length > 0) {
        // Store all properties in cache
        console.log('[Cache] Attempting to cache properties to Supabase...');
        try {
          await this.cacheAllProperties(properties);
          console.log('[Cache] ✅ Successfully cached properties to Supabase');
        } catch (cacheError: any) {
          console.error('[Cache] ❌ Failed to cache properties to Supabase:', cacheError.message || cacheError);
          // Continue anyway - return properties even if caching fails
          console.log('[Cache] ⚠️  Returning properties without caching (cache write failed)');
        }
      } else {
        console.warn('[Cache] ⚠️  No properties fetched from API - nothing to cache');
      }

      // Filter for only active properties (exclude under contract)
      // Note: API already filters for Grandview Realty, so these are all from that office
      // Use MlsStatus as primary, fallback to StandardStatus
      const activeProperties = properties.filter(property => {
        const status = property.MlsStatus || property.StandardStatus || '';
        return status === 'Active';
      });
      
      console.log(`[Cache] Filtered to ${activeProperties.length} active properties from Grandview Realty`);
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
      if (!process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL || !process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('PropertyCacheService: Missing Supabase configuration, returning empty array');
        return [];
      }

      // Get all cached properties (including under contract)
      const supabaseAdmin = this.getSupabaseAdmin();
      if (!supabaseAdmin) {
        console.warn('[Cache] Supabase not configured, returning empty array');
        return [];
      }
      
      const { data: cachedProperties, error } = await supabaseAdmin
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
      
      // Filter for properties under contract using StandardStatus and MlsStatus
      const underContractProperties = allCachedProperties.filter(property => {
        const mlsStatus = property.MlsStatus || '';
        const standardStatus = property.StandardStatus || '';
        
        return mlsStatus === 'UnderContract' ||
          mlsStatus === 'Pending' ||
          standardStatus === 'ActiveUnderContract' || 
          standardStatus === 'UnderContract' ||
          standardStatus === 'Pending' ||
          standardStatus === 'Contingent' ||
          standardStatus === 'PendingContinueToShow' ||
          standardStatus === 'PendingDoNotShow' ||
          standardStatus === 'PendingTakingBackups' ||
          standardStatus === 'PendingWithdrawn' ||
          standardStatus === 'ContingentContinueToShow' ||
          standardStatus === 'ContingentDoNotShow' ||
          standardStatus === 'ContingentNoShow' ||
          standardStatus === 'ContingentWithdrawn' ||
          standardStatus?.includes('Contract') ||
          standardStatus?.includes('Pending') ||
          standardStatus?.includes('Contingent') ||
          standardStatus?.includes('Under');
      });

      console.log(`[Cache] Found ${underContractProperties.length} under contract properties`);
      console.log(`[Cache] Total cached properties: ${allCachedProperties.length}`);
      console.log(`[Cache] Sample property statuses:`, allCachedProperties.slice(0, 3).map(p => ({ 
        ListingId: p.ListingId, 
        MlsStatus: p.MlsStatus, 
        StandardStatus: p.StandardStatus 
      })));
      
      // If no under contract properties in cache, try to fetch them directly from API
      if (underContractProperties.length === 0) {
        console.log('[Cache] No under contract properties in cache, fetching from API...');
        // Don't fetch from API if we have cached properties - they should be there
        // The issue is likely with the filter logic
        console.log('[Cache] ⚠️  Skipping API fetch - properties should be in cache. Check filter logic.');
        return [];
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

  // Fetch a single property from the Wisconsin MLS API
  private static async fetchPropertyFromAPI(listingId: string): Promise<Property | null> {
    try {
      console.log(`[API] 🚀 Fetching individual property from Wisconsin MLS: ${listingId}`);
      
      // Apply rate limiting
      await this.rateLimit();

      // Use Wisconsin MLS service to get property
      const property = await wisconsinMLSService.getProperty(listingId);
      
      if (property) {
        console.log(`[API] ✅ Found property ${listingId} with media data`);
      } else {
        console.log(`[API] ❌ Property ${listingId} not found in API response`);
      }
      
      return property || null;
    } catch (error) {
      console.error('Error fetching property from Wisconsin MLS API:', error);
      return null;
    }
  }

  // Fetch under contract properties from the Wisconsin MLS API
  private static async fetchUnderContractPropertiesFromAPI(): Promise<Property[]> {
    try {
      console.log('[API] 🚀 Fetching under contract properties from Wisconsin MLS API...');
      console.log(`[API] 🔑 Using token: ${WISCONSIN_MLS_CONFIG.ACCESS_TOKEN ? 'SET' : 'NOT SET'}`);
      console.log(`[API] 📡 API URL: ${WISCONSIN_MLS_CONFIG.API_BASE_URL}`);
      
      // Apply rate limiting
      await this.rateLimit();

      // Use Wisconsin MLS service to search for under contract properties
      const properties = await wisconsinMLSService.searchProperties({
        status: 'ActiveUnderContract',
        top: 25, // MLS Aligned max
        count: true
      });

      console.log(`[API] ✅ Fetched ${properties.length} under contract properties from Wisconsin MLS API`);
      return properties;
    } catch (error) {
      console.error('Error fetching under contract properties from Wisconsin MLS API:', error);
      return [];
    }
  }

  // Public method for cron job to fetch fresh Active properties
  static async fetchFreshActiveProperties(): Promise<Property[]> {
    try {
      console.log('[API] 🚀 Fetching fresh Active properties from Wisconsin MLS API...');
      
      // Apply rate limiting
      await this.rateLimit();

      // Use Wisconsin MLS service to get all properties
      // Note: getAllProperties() already filters for Active/UnderContract and Grandview Realty
      const allProperties = await wisconsinMLSService.getAllProperties();
      
      // Filter for Active properties only (API returns both Active and UnderContract)
      // Use MlsStatus as primary, fallback to StandardStatus
      const activeProperties = allProperties.filter((property: Property) => {
        const status = property.MlsStatus || property.StandardStatus || '';
        return status === 'Active';
      });

      console.log(`[API] ✅ Fetched ${allProperties.length} total properties from Grandview Realty, filtered to ${activeProperties.length} Active properties from Wisconsin MLS API`);
      return activeProperties;

    } catch (error) {
      console.error('Error fetching fresh Active properties from Wisconsin MLS API:', error);
      return [];
    }
  }

  // Public method for cron job to fetch fresh Under Contract properties
  static async fetchFreshUnderContractProperties(): Promise<Property[]> {
    try {
      console.log('[API] 🚀 Fetching fresh Under Contract properties from Wisconsin MLS API...');
      
      // Apply rate limiting
      await this.rateLimit();

      // Use Wisconsin MLS service to get all properties
      // Note: getAllProperties() already filters for Active/UnderContract and Grandview Realty
      const allProperties = await wisconsinMLSService.getAllProperties();
      
      // Filter for Under Contract properties only (API returns both Active and UnderContract)
      // Check both MlsStatus and StandardStatus
      const underContractProperties = allProperties.filter((property: Property) => {
        const mlsStatus = property.MlsStatus || '';
        const standardStatus = property.StandardStatus || '';
        
        return mlsStatus === 'UnderContract' ||
          mlsStatus === 'Pending' ||
          standardStatus === 'ActiveUnderContract' ||
          standardStatus === 'UnderContract' ||
          standardStatus === 'Pending' ||
          standardStatus === 'Contingent' ||
          standardStatus.includes('Contract') ||
          standardStatus.includes('Pending') ||
          standardStatus.includes('Contingent');
      });

      console.log(`[API] ✅ Fetched ${allProperties.length} total properties from Grandview Realty, filtered to ${underContractProperties.length} Under Contract properties from Wisconsin MLS API`);
      return underContractProperties;

    } catch (error) {
      console.error('Error fetching fresh Under Contract properties from Wisconsin MLS API:', error);
      return [];
    }
  }

  // Fetch all properties from the Wisconsin MLS API
  private static async fetchAllPropertiesFromAPI(): Promise<Property[]> {
    try {
      console.log('[API] 🚀 Starting fresh Wisconsin MLS data fetch...');
      console.log(`[API] 🔑 Using token: ${WISCONSIN_MLS_CONFIG.ACCESS_TOKEN ? 'SET' : 'NOT SET'}`);
      console.log(`[API] 📡 API URL: ${WISCONSIN_MLS_CONFIG.API_BASE_URL}`);
      console.log(`[API] 🏷️  OUID: ${WISCONSIN_MLS_CONFIG.OUID}`);
      
      // Use Wisconsin MLS service which handles pagination (25 per page)
      // getAllProperties() already filters for Active/UnderContract and Grandview Realty
      const allProperties = await wisconsinMLSService.getAllProperties();

      // getAllProperties() already returns only Active/UnderContract properties from Grandview Realty
      // No additional filtering needed - just return what we got
      console.log(`[API] ✅ Fetch completed! Total properties: ${allProperties.length}`);
      return allProperties;
    } catch (error) {
      console.error('Error fetching all properties from Wisconsin MLS API:', error);
      return [];
    }
  }

  // Cache a single property
  private static async cacheProperty(property: Property): Promise<void> {
    try {
      const supabaseAdmin = this.getSupabaseAdmin();
      if (!supabaseAdmin) {
        console.warn('[Cache] Supabase not configured, skipping cache write');
        return;
      }
      
      const { error } = await supabaseAdmin
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
      console.log(`[Cache] 🗄️ Caching ${properties.length} properties to Wisconsin Supabase...`);
      
      // Verify Supabase connection
      const supabaseUrl = process.env.NEXT_PUBLIC_WISCONSIN_SUPABASE_URL;
      const supabaseKey = process.env.WISCONSIN_SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Wisconsin Supabase credentials - cannot cache properties');
      }
      
      console.log(`[Cache] Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
      
      // First, mark all existing properties as inactive
      console.log('[Cache] Deactivating old properties...');
      const supabaseAdmin = this.getSupabaseAdmin();
      if (!supabaseAdmin) {
        throw new Error('Supabase not configured - cannot cache properties');
      }
      
      const { error: deactivateError } = await supabaseAdmin
        .from('property_cache')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) {
        console.error('[Cache] Error deactivating old properties:', deactivateError);
        throw new Error(`Failed to deactivate old properties: ${deactivateError.message}`);
      } else {
        console.log('[Cache] ✅ Deactivated old properties');
      }

      // Then insert all new properties in batches
      const batchSize = 50;
      let totalCached = 0;
      
      for (let i = 0; i < properties.length; i += batchSize) {
        const batch = properties.slice(i, i + batchSize);
        const batchNumber = Math.floor(i/batchSize) + 1;
        
        console.log(`[Cache] Processing batch ${batchNumber}/${Math.ceil(properties.length/batchSize)} (${batch.length} properties)...`);
        
        // Process properties (no URL transformation needed - API URLs are used directly)
        const processedBatch = batch.map(property => 
          this.processPropertyMedia(property)
        );
        
        const cacheData = processedBatch.map(property => ({
          listing_id: property.ListingId,
          property_data: property,
          last_updated: new Date().toISOString(),
          is_active: true
        }));

        try {
          const { error, data } = await supabaseAdmin
            .from('property_cache')
            .upsert(cacheData, {
              onConflict: 'listing_id'
            });

          if (error) {
            console.error(`[Cache] ❌ Error caching batch ${batchNumber}:`, error);
            throw new Error(`Failed to cache batch ${batchNumber}: ${error.message}`);
          } else {
            totalCached += batch.length;
            console.log(`[Cache] ✅ Cached batch ${batchNumber}: ${batch.length} properties (${totalCached}/${properties.length} total)`);
          }
        } catch (batchError: any) {
          console.error(`[Cache] ❌ Failed to cache batch ${batchNumber}:`, batchError.message || batchError);
          // Continue with next batch instead of failing completely
          if (i === 0) {
            // If first batch fails, throw error
            throw batchError;
          }
        }
      }

      console.log(`[Cache] 🎯 Successfully cached ${totalCached}/${properties.length} properties to Wisconsin Supabase!`);
      
      if (totalCached < properties.length) {
        console.warn(`[Cache] ⚠️  Only cached ${totalCached} out of ${properties.length} properties`);
      }
    } catch (error: any) {
      console.error('[Cache] ❌ Error in cacheAllProperties:', error.message || error);
      throw error; // Re-throw so caller knows caching failed
    }
  }

  // Clear all cache
  static async clearCache(): Promise<void> {
    try {
      console.log('[Cache] 🗑️ Clearing entire property cache...');
      
      const supabaseAdmin = this.getSupabaseAdmin();
      if (!supabaseAdmin) {
        console.warn('[Cache] Supabase not configured, skipping cache clear');
        return;
      }
      
      const { error } = await supabaseAdmin
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