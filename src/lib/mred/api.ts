import { MRED_CONFIG } from './config';
import { Property, SearchParams } from './types';

const MOCK_PROPERTIES: Property[] = [
    {
        ListingId: 'MOCK1',
        ListingKey: 'MOCK1',
        ModificationTimestamp: new Date().toISOString(),
        OriginatingSystemName: 'MOCK',
        StandardStatus: 'Active',
        MlgCanView: true,
        ListPrice: 499000,
        City: 'Geneva',
        StateOrProvince: 'IL',
        PostalCode: '60134',
        BedroomsTotal: 3,
        BathroomsTotalInteger: 2,
        LivingArea: 2000,
        PublicRemarks: 'Beautiful mock property',
        ListAgentFullName: 'Christopher Lobrillo',
        ListAgentEmail: 'chris@grandviewsells.com',
        ListOfficeName: 'Grandview Realty'
    },
    {
        ListingId: 'MOCK2',
        ListingKey: 'MOCK2',
        ModificationTimestamp: new Date().toISOString(),
        OriginatingSystemName: 'MOCK',
        StandardStatus: 'Active',
        MlgCanView: true,
        ListPrice: 699000,
        City: 'St. Charles',
        StateOrProvince: 'IL',
        PostalCode: '60174',
        BedroomsTotal: 4,
        BathroomsTotalInteger: 3,
        LivingArea: 2500,
        PublicRemarks: 'Spacious mock property',
        ListAgentFullName: 'Lynda Werner',
        ListAgentEmail: 'lynda@grandviewsells.com',
        ListOfficeName: 'Grandview Realty'
    },
    {
        ListingId: 'MOCK3',
        ListingKey: 'MOCK3',
        ModificationTimestamp: new Date().toISOString(),
        OriginatingSystemName: 'MOCK',
        StandardStatus: 'Active',
        MlgCanView: true,
        ListPrice: 599000,
        City: 'Batavia',
        StateOrProvince: 'IL',
        PostalCode: '60510',
        BedroomsTotal: 3,
        BathroomsTotalInteger: 2,
        LivingArea: 2200,
        PublicRemarks: 'Charming family home',
        ListAgentFullName: 'Chris Clark',
        ListAgentEmail: 'chris.clark@grandviewsells.com',
        ListOfficeName: 'Grandview Realty'
    }
];

class MLSGridService {
    private formatImageUrl(mediaUrl: string): string {
        // If it's already a proxy URL, return as is
        if (mediaUrl.startsWith('https://grandview-realty.jphamm2001.workers.dev/proxy')) {
            return mediaUrl;
        }
        
        // Otherwise, construct the proxy URL
        const proxyBaseUrl = 'https://grandview-realty.jphamm2001.workers.dev/proxy';
        const encodedUrl = encodeURIComponent(mediaUrl);
        return `${proxyBaseUrl}?url=${encodedUrl}`;
    }

    private async fetchFromAPI<T>(endpoint: string, params?: URLSearchParams): Promise<T> {
        // If no token, return mock data
        if (!MRED_CONFIG.ACCESS_TOKEN || MRED_CONFIG.ACCESS_TOKEN === 'demo_token') {
            console.log('Using mock data (no API token configured)');
            return { value: MOCK_PROPERTIES } as T;
        }

        const url = params ? 
            `${MRED_CONFIG.API_BASE_URL}/${endpoint}?${params.toString()}` :
            `${MRED_CONFIG.API_BASE_URL}/${endpoint}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${MRED_CONFIG.ACCESS_TOKEN}`,
                'Accept': 'application/json',
            },
            next: { revalidate: MRED_CONFIG.CACHE_TIMES.SEARCH_RESULTS }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return response.json();
    }

    public async getProperty(listingId: string): Promise<Property> {
        const data = await this.fetchFromAPI<Property>(`Property('${listingId}')`);
        return data;
    }

    public async searchProperties(params: SearchParams): Promise<Property[]> {
        // If using mock data, apply filters client-side
        if (!MRED_CONFIG.ACCESS_TOKEN || MRED_CONFIG.ACCESS_TOKEN === 'demo_token') {
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

        // Add pagination
        if (params.top) {
            queryParams.append('$top', params.top.toString());
        }
        if (params.skip) {
            queryParams.append('$skip', params.skip.toString());
        }
        if (params.count) {
            queryParams.append('$count', 'true');
        }

        // Build filter string
        const filters: string[] = ['MlgCanView eq true'];

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
        if (params.status) {
            filters.push(`StandardStatus eq '${params.status}'`);
        }
        if (params.propertyType) {
            filters.push(`PropertyType eq '${params.propertyType}'`);
        }

        if (filters.length > 0) {
            queryParams.append('$filter', filters.join(' and '));
        }

        // Add ordering
        if (params.orderby) {
            queryParams.append('$orderby', params.orderby);
        }

        // Add field selection
        const defaultFields = [
            'ListingId',
            'ListPrice',
            'City',
            'StateOrProvince',
            'BedroomsTotal',
            'BathroomsTotalInteger',
            'LivingArea',
            'StandardStatus',
            'Media'
        ];

        queryParams.append('$select', params.select?.length ? params.select.join(',') : defaultFields.join(','));
        queryParams.append('$expand', 'Media');

        console.log('API Request URL:', `${MRED_CONFIG.API_BASE_URL}/Property?${queryParams.toString()}`);

        interface MLSGridResponse {
            value: Property[];
            '@odata.count'?: number;
            '@odata.nextLink'?: string;
        }

        const data = await this.fetchFromAPI<MLSGridResponse>('Property', queryParams);
        console.log('API Response:', data);
        return data.value;
    }
}

export const mlsGridService = new MLSGridService(); 