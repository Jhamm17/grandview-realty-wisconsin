import { WISCONSIN_MLS_CONFIG } from './config';
import { wisconsinMLSAuth } from './auth';
import { Property, SearchParams, Media } from '../mred/types';

const MOCK_PROPERTIES: Property[] = [
    {
        ListingId: 'MOCK1',
        ListingKey: 'MOCK1',
        ModificationTimestamp: new Date().toISOString(),
        OriginatingSystemName: 'MOCK',
        StandardStatus: 'Active',
        MlgCanView: true,
        ListPrice: 499000,
        City: 'Milwaukee',
        StateOrProvince: 'WI',
        PostalCode: '53201',
        BedroomsTotal: 3,
        BathroomsTotalInteger: 2,
        LivingArea: 2000,
        PublicRemarks: 'Beautiful mock property in Wisconsin',
        ListAgentFullName: 'Chris Clark',
        ListAgentEmail: 'chris.clark@grandviewsells.com',
        ListOfficeName: 'Grandview Realty'
    }
];

class WisconsinMLSService {
    // No longer using Cloudflare proxy - API provides direct URLs from cdn.photos.sparkplatform.com
    // Images are used directly from the API response

    /**
     * Transform API response to Property type, handling field mappings
     */
    private transformProperty(apiProperty: any): Property {
        // Map BuildingAreaTotal to LivingArea if LivingArea is null/undefined
        let livingArea = apiProperty.LivingArea ?? apiProperty.BuildingAreaTotal ?? 0;
        
        // Map MlsStatus to StandardStatus if StandardStatus is null/undefined
        const standardStatus = apiProperty.StandardStatus ?? apiProperty.MlsStatus ?? 'Unknown';
        
        // For two-family properties, use fallback fields if main fields are null
        const isTwoFamily = apiProperty.PropertyType === 'Two-Family';
        let bedroomsTotal = apiProperty.BedroomsTotal;
        let bathroomsTotalInteger = apiProperty.BathroomsTotalInteger;
        
        if (isTwoFamily) {
            // Use fallback fields for two-family properties when main fields are null
            if (!bedroomsTotal && apiProperty['Property_sp_Information_co_Bedrooms_sp_U2']) {
                bedroomsTotal = apiProperty['Property_sp_Information_co_Bedrooms_sp_U2'];
            }
            if (!bathroomsTotalInteger && apiProperty['Property_sp_Information_co_Full_sp_Baths_sp_U2']) {
                bathroomsTotalInteger = apiProperty['Property_sp_Information_co_Full_sp_Baths_sp_U2'];
            }
            if (!livingArea && apiProperty['Property_sp_Information_co_Est_sp_Total_sp_Sq_sp_Ft']) {
                livingArea = apiProperty['Property_sp_Information_co_Est_sp_Total_sp_Sq_sp_Ft'];
            }
        }
        
        // Transform Media array if present
        const media = apiProperty.Media?.map((m: any) => ({
            MediaKey: m.MediaKey || m.OriginatingSystemMediaKey || '',
            MediaURL: m.MediaURL || '',
            Order: m.Order || 0,
            ModificationTimestamp: m.ModificationTimestamp,
            MediaCategory: m.MediaCategory,
            Permission: m.Permission,
            LongDescription: m.LongDescription,
            ShortDescription: m.ShortDescription,
            PreferredPhotoYN: m.PreferredPhotoYN,
            MediaHTML: m.MediaHTML,
            OriginatingSystemMediaKey: m.OriginatingSystemMediaKey,
            ResourceRecordID: m.ResourceRecordID,
            ResourceRecordKey: m.ResourceRecordKey,
        })) || [];

        // Ensure required fields have defaults
        return {
            ...apiProperty,
            LivingArea: livingArea,
            BuildingAreaTotal: apiProperty.BuildingAreaTotal,
            StandardStatus: standardStatus,
            MlsStatus: apiProperty.MlsStatus,
            Media: media,
            // Ensure required fields
            ListingId: apiProperty.ListingId || apiProperty.ListingKey || '',
            ListingKey: apiProperty.ListingKey || apiProperty.ListingId || '',
            ModificationTimestamp: apiProperty.ModificationTimestamp || new Date().toISOString(),
            OriginatingSystemName: apiProperty.OriginatingSystemName || 'Metro MLS',
            City: apiProperty.City || '',
            PostalCode: apiProperty.PostalCode || '',
            ListPrice: apiProperty.ListPrice || 0,
            PublicRemarks: apiProperty.PublicRemarks || '',
            BedroomsTotal: bedroomsTotal ?? 0,
            BathroomsTotalInteger: bathroomsTotalInteger ?? 0,
            // Store fallback fields for reference
            Property_sp_Information_co_Bedrooms_sp_U2: apiProperty['Property_sp_Information_co_Bedrooms_sp_U2'],
            Property_sp_Information_co_Full_sp_Baths_sp_U2: apiProperty['Property_sp_Information_co_Full_sp_Baths_sp_U2'],
            Property_sp_Information_co_Est_sp_Total_sp_Sq_sp_Ft: apiProperty['Property_sp_Information_co_Est_sp_Total_sp_Sq_sp_Ft'],
        };
    }

    /**
     * Fetch from MLS Aligned API with all required headers
     */
    private async fetchFromAPI<T>(endpoint: string, params?: URLSearchParams): Promise<T> {
        // If no token, return mock data
        if (!WISCONSIN_MLS_CONFIG.ACCESS_TOKEN || WISCONSIN_MLS_CONFIG.ACCESS_TOKEN === 'demo_token') {
            console.log('Using mock data (no API token configured)');
            return { value: MOCK_PROPERTIES } as T;
        }

        // Construct URL - RESO OData format: http://aligned.metromls.com/RESO/OData/Property/?$filter=...
        // Ensure base URL doesn't have trailing slash, then add endpoint
        const baseUrl = WISCONSIN_MLS_CONFIG.API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash if present
        
        // For OData queries, if endpoint already contains query params, append to it
        // Otherwise, construct standard OData URL
        let url: string;
        if (endpoint.includes('?')) {
            // Endpoint already has query params, append additional params
            url = params ? `${baseUrl}/${endpoint}&${params.toString()}` : `${baseUrl}/${endpoint}`;
        } else {
            // Standard OData endpoint construction
            url = params ? 
                `${baseUrl}/${endpoint}?${params.toString()}` :
            `${baseUrl}/${endpoint}`;
        }

        // Get all required headers for MLS Aligned API
        const headers = await wisconsinMLSAuth.getAuthHeaders();

        console.log(`[Wisconsin MLS] Making API request to: ${url}`);
        const headersObj = headers as Record<string, string>;
        console.log(`[Wisconsin MLS] Headers being sent:`, {
            'Authorization': headersObj['Authorization'] ? `Bearer ${headersObj['Authorization'].substring(7, 17)}...` : 'MISSING',
            'Accept': headersObj['Accept'],
            'OUID': headersObj['OUID'],
            'MLS-Aligned_User-Agent': headersObj['MLS-Aligned_User-Agent']
        });
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            // Create explicit headers object matching MLS Aligned API documentation exactly
            // Order: MLS-Aligned_User-Agent, Authorization, OUID, Accept (no Content-Type)
            // Handle token that may or may not already include "Bearer "
            const token = WISCONSIN_MLS_CONFIG.ACCESS_TOKEN.startsWith('Bearer ')
              ? WISCONSIN_MLS_CONFIG.ACCESS_TOKEN
              : `Bearer ${WISCONSIN_MLS_CONFIG.ACCESS_TOKEN}`;
            
            const requestHeaders: Record<string, string> = {
                'MLS-Aligned_User-Agent': WISCONSIN_MLS_CONFIG.APP_NAME,
                'Authorization': token,
                'OUID': WISCONSIN_MLS_CONFIG.OUID,
                'Accept': 'application/json',
            };

            console.log(`[Wisconsin MLS] Request headers (exact values being sent):`, {
                'MLS-Aligned_User-Agent': requestHeaders['MLS-Aligned_User-Agent'],
                'Authorization': token.substring(0, 20) + '...',
                'OUID': requestHeaders['OUID'],
                'Accept': requestHeaders['Accept'],
            });
            console.log(`[Wisconsin MLS] Header value checks:`, {
                'MLS-Aligned_User-Agent length': requestHeaders['MLS-Aligned_User-Agent'].length,
                'MLS-Aligned_User-Agent (raw)': JSON.stringify(requestHeaders['MLS-Aligned_User-Agent']),
                'OUID matches': requestHeaders['OUID'] === 'M00000662',
                'Token length': WISCONSIN_MLS_CONFIG.ACCESS_TOKEN.length,
            });

            const response = await fetch(url, {
                headers: requestHeaders,
                signal: controller.signal,
                cache: 'no-store' // Disable Next.js caching - we cache in Supabase instead (prevents 2MB limit errors)
            });
            
            clearTimeout(timeoutId);

            console.log(`[Wisconsin MLS] Response status: ${response.status} ${response.statusText}`);
            
            // Log response headers to see what server sent back
            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });
            console.log(`[Wisconsin MLS] Response headers:`, responseHeaders);

            if (!response.ok) {
                // Get raw response first
                let rawResponseText = '';
                let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
                
                try {
                    // Read the response as text first to see exact format
                    rawResponseText = await response.text();
                    console.error(`[Wisconsin MLS] Raw error response (first 500 chars):`, rawResponseText.substring(0, 500));
                    
                    // Try to parse as JSON
                    try {
                        const errorData = JSON.parse(rawResponseText);
                        console.error(`[Wisconsin MLS] Parsed error response:`, errorData);
                        
                        // Check for documented MLS Aligned error format: { "status": "error", "msg": "..." }
                        if (errorData.status === 'error' && errorData.msg) {
                            errorMessage = `MLS Aligned API Error: ${errorData.msg}`;
                            console.error(`[Wisconsin MLS] ✅ Matches documented format: ${errorData.msg}`);
                        } 
                        // Check for alternative format: { "response_code": 401, "message": "..." }
                        else if (errorData.response_code && errorData.message) {
                            errorMessage = `API Error (${errorData.response_code}): ${errorData.message}`;
                            console.error(`[Wisconsin MLS] ⚠️  Non-standard error format: ${errorData.message}`);
                            console.error(`[Wisconsin MLS] This suggests headers may not be reaching the MLS Aligned API correctly`);
                        }
                        else if (errorData.message) {
                            errorMessage = `API Error: ${errorData.message}`;
                        }
                        else if (errorData.msg) {
                            errorMessage = `MLS Aligned API Error: ${errorData.msg}`;
                        }
                    } catch (parseError) {
                        console.error(`[Wisconsin MLS] Failed to parse error as JSON:`, parseError);
                        errorMessage = `API Error (non-JSON): ${rawResponseText.substring(0, 200)}`;
                    }
                } catch (textError) {
                    console.error(`[Wisconsin MLS] Failed to read error response:`, textError);
                }
                
                console.error(`[Wisconsin MLS] Final error message: ${errorMessage}`);
                throw new Error(errorMessage);
            }

            // Read response as text first to see what we're getting
            const responseText = await response.text();
            console.log(`[Wisconsin MLS] Response body (first 500 chars):`, responseText.substring(0, 500));
            
            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error(`[Wisconsin MLS] Failed to parse response as JSON:`, parseError);
                console.error(`[Wisconsin MLS] Response was HTML or invalid JSON`);
                throw new Error(`API returned invalid response (expected JSON, got HTML or other format)`);
            }
            
            // Check for MLS Aligned error format in response
            if (data.status === 'error') {
                console.error(`[Wisconsin MLS] API Error in response: ${data.msg}`);
                throw new Error(`MLS Aligned API Error: ${data.msg}`);
            }
            
            // Check for alternative error format
            if (data.response_code && data.message) {
                console.error(`[Wisconsin MLS] API Error (non-standard format): ${data.message}`);
                throw new Error(`MLS Aligned API Error: ${data.message}`);
            }

            console.log(`[Wisconsin MLS] API request successful, received ${data.value?.length || 0} items`);
            return data;
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error('[Wisconsin MLS] Request timeout after 30 seconds');
                throw new Error('API request timeout - the request took too long to complete');
            }
            throw error;
        }
    }

    /**
     * Get a single property by listing ID or ListingKey
     * Uses $filter query since direct lookup format may not work
     */
    public async getProperty(listingId: string): Promise<Property> {
        // Try using $filter query instead of direct lookup
        // First try ListingKey, then ListingId
        const params = new URLSearchParams({
            '$filter': `ListingKey eq '${listingId}' or ListingId eq '${listingId}'`,
            '$expand': 'Media',
            '$top': '1'
        });
        
        const data = await this.fetchFromAPI<{ value: Property[] }>('Property', params);
        
        if (!data.value || data.value.length === 0) {
            throw new Error(`Property not found: ${listingId}`);
        }
        
        return this.transformProperty(data.value[0]);
    }

    /**
     * Get media for a property by ListingKey
     * Uses OData format: Property('[ListingKey]')/Media
     */
    public async getPropertyMedia(listingKey: string): Promise<Media[]> {
        // If no token, return empty array
        if (!WISCONSIN_MLS_CONFIG.ACCESS_TOKEN || WISCONSIN_MLS_CONFIG.ACCESS_TOKEN === 'demo_token') {
            console.log('Using mock data (no API token configured)');
            return [];
        }

        // OData format: Property('[ListingKey]')/Media
        const endpoint = `Property('${listingKey}')/Media`;
        
        try {
            const data = await this.fetchFromAPI<{ value: Media[] }>(endpoint);
            return data.value || [];
        } catch (error) {
            console.error(`[Wisconsin MLS] Error fetching media for ${listingKey}:`, error);
            return [];
        }
    }

    /**
     * Search properties with filters
     * Note: MLS Aligned API has max $top of 25 per request
     */
    public async searchProperties(params: SearchParams): Promise<Property[]> {
        // If using mock data, apply filters client-side
        if (!WISCONSIN_MLS_CONFIG.ACCESS_TOKEN || WISCONSIN_MLS_CONFIG.ACCESS_TOKEN === 'demo_token') {
            let results = [...MOCK_PROPERTIES];
            
            if (params.city) {
                results = results.filter(p => p.City.toLowerCase().includes(params.city!.toLowerCase()));
            }
            if (params.minPrice) {
                results = results.filter(p => p.ListPrice >= params.minPrice!);
            }
            if (params.maxPrice) {
                results = results.filter(p => p.ListPrice <= params.maxPrice!);
            }
            if (params.beds) {
                results = results.filter(p => (p.BedroomsTotal ?? 0) >= params.beds!);
            }
            if (params.baths) {
                results = results.filter(p => (p.BathroomsTotalInteger ?? 0) >= params.baths!);
            }

            console.log('Returning filtered mock data:', results);
            return results;
        }

        const queryParams = new URLSearchParams();

        // Add pagination - MLS Aligned MAX is 25
        const top = params.top ? Math.min(params.top, 25) : 25; // Enforce max 25
        queryParams.append('$top', top.toString());
        
        if (params.skip) {
            queryParams.append('$skip', params.skip.toString());
        }
        if (params.count) {
            queryParams.append('$count', 'true');
        }

        // Build filter string
        // Note: MlgCanView may not be available in RESO standard - making it optional
        const filters: string[] = [];
        
        // Only add MlgCanView if it exists in the response (may need to test)
        // For now, we'll skip it and rely on StandardStatus filtering
        
        if (params.status) {
            filters.push(`MlsStatus eq '${params.status}'`);
        } else {
            // Default to Active listings if no status specified
            filters.push(`MlsStatus eq 'Active'`);
        }

        if (params.city) {
            filters.push(`City eq '${params.city}'`);
        }
        if (params.minPrice) {
            filters.push(`ListPrice ge ${params.minPrice}`);
        }
        if (params.maxPrice) {
            filters.push(`ListPrice le ${params.maxPrice}`);
        }
        if (params.beds) {
            filters.push(`BedroomsTotal eq ${params.beds}`);
        }
        if (params.baths) {
            filters.push(`BathroomsTotalInteger eq ${params.baths}`);
        }
        if (params.propertyType) {
            filters.push(`PropertyType eq '${params.propertyType}'`);
        }

        // Handle date-based filtering using OData date functions
        // Example: year(ModificationTimestamp) eq 2018 and month(ModificationTimestamp) eq 8
        if (params.modifiedSince) {
            const date = params.modifiedSince;
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // JavaScript months are 0-indexed
            const day = date.getDate();
            const hour = date.getHours();
            
            // Build date filter: year(ModificationTimestamp) eq YYYY and month(ModificationTimestamp) eq MM and day(ModificationTimestamp) eq DD and hour(ModificationTimestamp) eq HH
            filters.push(`year(ModificationTimestamp) eq ${year}`);
            filters.push(`month(ModificationTimestamp) eq ${month}`);
            filters.push(`day(ModificationTimestamp) eq ${day}`);
            if (hour > 0) {
                filters.push(`hour(ModificationTimestamp) eq ${hour}`);
            }
        }

        if (filters.length > 0) {
            queryParams.append('$filter', filters.join(' and '));
        }

        // Add ordering
        if (params.orderby) {
            queryParams.append('$orderby', params.orderby);
        } else {
            // Default ordering
            queryParams.append('$orderby', 'ModificationTimestamp desc');
        }

        // Add field selection
        // Note: Don't include 'Media' in $select when using $expand=Media
        const defaultFields = [
            'ListingId',
            'ListingKey',
            'ListPrice',
            'City',
            'StateOrProvince',
            'BedroomsTotal',
            'BathroomsTotalInteger',
            'LivingArea',
            'StandardStatus',
            'ModificationTimestamp',
            'MlsStatus' // Add MlsStatus to default fields
        ];

        // Remove 'Media' from select if it's present (since we use $expand)
        const selectFields = params.select?.length 
            ? params.select.filter(f => f !== 'Media')
            : defaultFields;

        queryParams.append('$select', selectFields.join(','));
        queryParams.append('$expand', 'Media');

        console.log('Wisconsin MLS API Request URL:', `${WISCONSIN_MLS_CONFIG.API_BASE_URL}/Property?${queryParams.toString()}`);

        interface MLSAlignedResponse {
            value: Property[];
            '@odata.count'?: number;
            '@odata.nextLink'?: string;
        }

        const data = await this.fetchFromAPI<MLSAlignedResponse>('Property', queryParams);
        console.log('Wisconsin MLS API Response:', {
            count: data['@odata.count'],
            returned: data.value.length,
            hasNextLink: !!data['@odata.nextLink']
        });
        // Transform each property to ensure correct field mappings
        return data.value.map(prop => this.transformProperty(prop));
    }

    /**
     * Get all properties with pagination
     * Requests 50 records per request
     */
    public async getAllProperties(): Promise<Property[]> {
        const allProperties: Property[] = [];
        let skip = 0;
        const top = 50; // Request 50 properties per page
        let hasMore = true;
        let pageCount = 0;
        const maxPages = 500; // Safety limit to prevent infinite loops

        console.log('[Wisconsin MLS] Starting to fetch all properties...');

        while (hasMore && pageCount < maxPages) {
            pageCount++;
            console.log(`[Wisconsin MLS] Fetching page ${pageCount} (skip: ${skip}, top: ${top})...`);
            
            try {
                // Filter for Active or Under Contract properties modified in the last 6 months
                // NOTE: ListOfficeName is NOT filterable in this API, so we filter client-side
                // Calculate date 6 months ago
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                const currentDate = new Date();
                
                const targetYear = sixMonthsAgo.getFullYear();
                const targetMonth = sixMonthsAgo.getMonth() + 1; // JavaScript months are 0-indexed
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth() + 1;
                
                if (pageCount === 1) {
                    console.log(`[Wisconsin MLS] Filtering for properties modified in last 6 months (since ${targetYear}-${targetMonth.toString().padStart(2, '0')})`);
                }
                
                // Build date filter using year/month functions
                // For last 6 months: year >= targetYear AND (year > targetYear OR month >= targetMonth)
                // Simplified: year >= targetYear (this will include all of this year and future)
                // For more precision, we could add month checks, but this should work for 6 months
                const dateFilter = `year(ModificationTimestamp) ge ${targetYear}`;
                
                // If we're filtering within the same year, add month filter
                let dateFilterPart = dateFilter;
                if (currentYear === targetYear) {
                    // Same year: month must be >= target month
                    dateFilterPart = `year(ModificationTimestamp) eq ${targetYear} and month(ModificationTimestamp) ge ${targetMonth}`;
                } else {
                    // Different years: year >= targetYear (covers all months in target year and current year)
                    dateFilterPart = `year(ModificationTimestamp) ge ${targetYear}`;
                }
                
                // Build complete filter: status filter AND date filter
                // Include Active, UnderContract, and Pending statuses
                const filter = `(MlsStatus eq 'Active' or MlsStatus eq 'UnderContract' or MlsStatus eq 'Pending') and ${dateFilterPart}`;
                
                const queryParams = new URLSearchParams({
                    '$top': top.toString(),
                    '$skip': skip.toString(),
                    '$count': 'true',
                    '$filter': filter,
                    '$orderby': 'ModificationTimestamp desc',
                    '$expand': 'Media'
                });
                // Note: Not using $select initially - let's see what fields actually have data

                const data = await this.fetchFromAPI<{ value: any[]; '@odata.count'?: number; '@odata.nextLink'?: string }>('Property', queryParams);
                
                console.log(`[Wisconsin MLS] Page ${pageCount}: Received ${data.value.length} properties, total count: ${data['@odata.count'] || 'unknown'}`);
                
                if (!data.value || data.value.length === 0) {
                    console.log('[Wisconsin MLS] No more properties returned, stopping pagination');
                    hasMore = false;
                    break;
                }
                
                // Transform properties to ensure correct field mappings
                const transformedProperties = data.value.map(prop => this.transformProperty(prop));
                
                // Filter for Grandview Realty client-side (ListOfficeName is not filterable in API)
                const grandviewProperties = transformedProperties.filter(property => 
                    property.ListOfficeName && 
                    property.ListOfficeName.toLowerCase().includes('grandview')
                );
                
                if (grandviewProperties.length > 0) {
                    console.log(`[Wisconsin MLS] Found ${grandviewProperties.length} Grandview Realty properties on this page`);
                    allProperties.push(...grandviewProperties);
                } else {
                    console.log(`[Wisconsin MLS] No Grandview Realty properties on this page, continuing...`);
                }
                
                // Check if there are more results
                const totalCount = data['@odata.count'] || 0;
                const receivedCount = data.value.length;
                
                // Stop if we got fewer than requested (last page)
                if (receivedCount < top) {
                    console.log(`[Wisconsin MLS] Received ${receivedCount} < ${top} properties, this is the last page`);
                    hasMore = false;
                    break;
                }
                
                // Check if we've fetched all properties
                const nextSkip = skip + receivedCount;
                if (totalCount > 0 && nextSkip >= totalCount) {
                    console.log(`[Wisconsin MLS] Reached total count (fetched ${nextSkip} >= ${totalCount}), stopping`);
                    hasMore = false;
                    break;
                }
                
                // More pages to fetch - increment skip for next page
                skip = nextSkip;
                    hasMore = true;
                    
                    // Rate limiting - wait between requests
                    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms between requests
            } catch (error) {
                console.error(`[Wisconsin MLS] Error on page ${pageCount}:`, error);
                // If we have some properties, return what we have
                if (allProperties.length > 0) {
                    console.log(`[Wisconsin MLS] Returning ${allProperties.length} properties despite error`);
                    return allProperties;
                }
                throw error;
            }
        }

        if (pageCount >= maxPages) {
            console.warn(`[Wisconsin MLS] Reached max pages limit (${maxPages}), stopping pagination`);
        }

        console.log(`[Wisconsin MLS] Completed fetching all properties: ${allProperties.length} total`);
        return allProperties;
    }
}

export const wisconsinMLSService = new WisconsinMLSService();

