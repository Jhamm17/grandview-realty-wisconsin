export const WISCONSIN_MLS_CONFIG = {
    // Environment
    IS_STAGING: process.env.NODE_ENV !== 'production',

    // MLS Aligned API Configuration - Metro MLS Wisconsin
    // RESO OData API endpoint: http://aligned.metromls.com/RESO/OData
    API_BASE_URL: process.env.WISCONSIN_MLS_API_URL || process.env.NEXT_PUBLIC_WISCONSIN_MLS_API_URL || 'http://aligned.metromls.com/RESO/OData',
    ACCESS_TOKEN: process.env.WISCONSIN_MLS_ACCESS_TOKEN || 'demo_token',
    
    // Metro MLS RESO OUID (Required for MLS Aligned API)
    OUID: process.env.WISCONSIN_MLS_OUID || 'M00000662', // Metro MLS OUID
    
    // Application name for MLS-Aligned_User-Agent header (Required for MLS Aligned API)
    // Can be set via environment variable MLS-Aligned_User-Agent or WISCONSIN_MLS_APP_NAME
    APP_NAME: (process.env['MLS-Aligned_User-Agent'] || process.env.WISCONSIN_MLS_APP_NAME || 'Jackson Hamm Consultant').trim(),

    // Rate Limiting & Pagination - MLS Aligned has max 25 per request
    MAX_REQUESTS_PER_SECOND: 2.0, // Conservative rate limit
    MAX_REQUESTS_PER_HOUR: 7200, // 7200 requests/hour (2 RPS * 3600 seconds)
    MAX_DATA_PER_HOUR_GB: 1, // 1GB/hour
    RECORDS_PER_PAGE: 25, // ⚠️ MLS Aligned API MAX LIMIT is 25 per request

    // Resource Types (RESO Standard)
    RESOURCES: {
        PROPERTY: 'Property',
        MEMBER: 'Member',
        OFFICE: 'Office',
        MEDIA: 'Media'
    },

    // Searchable Fields (MLS Aligned API - may differ from standard RESO)
    SEARCHABLE_FIELDS: {
        MODIFICATION_TIMESTAMP: 'ModificationTimestamp',
        ORIGINATING_SYSTEM: 'OriginatingSystemName',
        STATUS: 'MlsStatus', // MLS Aligned uses MlsStatus instead of StandardStatus
        LISTING_ID: 'ListingId',
    },

    // Caching - Increased cache times to reduce API calls
    CACHE_TIMES: {
        LISTING_DETAILS: 2 * 60 * 60, // 2 hours
        SEARCH_RESULTS: 60 * 60,   // 1 hour
        MEDIA: 7 * 24 * 60 * 60   // 7 days for media
    }
} as const;

export type WisconsinMLSConfig = typeof WISCONSIN_MLS_CONFIG;

// Log configuration status instead of throwing
if (process.env.NODE_ENV === 'production') {
    if (!process.env.WISCONSIN_MLS_ACCESS_TOKEN) {
        console.warn('Warning: WISCONSIN_MLS_ACCESS_TOKEN not configured. Using demo mode.');
    }
    console.log('Wisconsin MLS API Configuration:', {
        API_BASE_URL: process.env.WISCONSIN_MLS_API_URL || process.env.NEXT_PUBLIC_WISCONSIN_MLS_API_URL || 'NOT_SET',
        ACCESS_TOKEN: process.env.WISCONSIN_MLS_ACCESS_TOKEN ? 'SET' : 'NOT_SET',
        OUID: process.env.WISCONSIN_MLS_OUID || WISCONSIN_MLS_CONFIG.OUID,
        APP_NAME: WISCONSIN_MLS_CONFIG.APP_NAME
    });
}

