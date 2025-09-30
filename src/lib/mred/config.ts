export const MRED_CONFIG = {
    // Environment
    IS_STAGING: process.env.NODE_ENV !== 'production',

    // MLS Grid API Configuration - Using server-side environment variables
    API_BASE_URL: process.env.MRED_API_URL || process.env.NEXT_PUBLIC_MRED_API_URL || 'https://api.mlsgrid.com/v2',
    ACCESS_TOKEN: process.env.MLSGRID_ACCESS_TOKEN || 'demo_token',

    // Rate Limiting & Pagination - Set to 2 requests per second (MLS Grid limit)
    MAX_REQUESTS_PER_SECOND: 2.0, // 2 requests per second (MLS Grid limit)
    MAX_REQUESTS_PER_HOUR: 7200, // 7200 requests/hour (2 RPS * 3600 seconds)
    MAX_DATA_PER_HOUR_GB: 1, // 1GB/hour
    RECORDS_PER_PAGE: 100, // Increased to 100 records per page to reduce total requests

    // Resource Types
    RESOURCES: {
        PROPERTY: 'Property',
        MEMBER: 'Member',
        OFFICE: 'Office',
        MEDIA: 'Media'
    },

    // Searchable Fields (MLS Grid standard)
    SEARCHABLE_FIELDS: {
        MODIFICATION_TIMESTAMP: 'ModificationTimestamp',
        ORIGINATING_SYSTEM: 'OriginatingSystemName',
        STATUS: 'StandardStatus',
        LISTING_ID: 'ListingId',
        CAN_VIEW: 'MlgCanView'
    },

    // Caching - Increased cache times to reduce API calls
    CACHE_TIMES: {
        LISTING_DETAILS: 2 * 60 * 60, // Increased to 2 hours
        SEARCH_RESULTS: 60 * 60,   // Increased to 1 hour
        MEDIA: 7 * 24 * 60 * 60   // 7 days for media
    }
} as const;

export type MREDConfig = typeof MRED_CONFIG;

// Log configuration status instead of throwing
if (process.env.NODE_ENV === 'production') {
    if (!process.env.MLSGRID_ACCESS_TOKEN) {
        console.warn('Warning: MLSGRID_ACCESS_TOKEN not configured. Using demo mode.');
    }
    console.log('MLS API Configuration:', {
        API_BASE_URL: process.env.MRED_API_URL || process.env.NEXT_PUBLIC_MRED_API_URL || 'NOT_SET',
        ACCESS_TOKEN: process.env.MLSGRID_ACCESS_TOKEN ? 'SET' : 'NOT_SET',
        'MRED_API_URL': process.env.MRED_API_URL || 'NOT_SET',
        'NEXT_PUBLIC_MRED_API_URL': process.env.NEXT_PUBLIC_MRED_API_URL || 'NOT_SET'
    });
} 