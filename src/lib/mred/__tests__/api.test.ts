import { mredService } from '../api';
import { RateLimitError, APIError } from '../errors';
import { Property } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('MRED API Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProperty', () => {
        const mockProperty: Property = {
            ListingKey: '123',
            ListPrice: 500000,
            BedroomsTotal: 3,
            BathroomsTotalInteger: 2,
            LivingArea: 2000,
            City: 'Geneva',
            StateOrProvince: 'IL',
            PostalCode: '60134',
            StandardStatus: 'Active',
            PublicRemarks: 'Beautiful home',
            Photos: ['photo1.jpg']
        };

        it('should fetch and cache a property', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProperty),
                headers: new Headers({ 'content-length': '500' })
            });

            const result = await mredService.getProperty('123');
            expect(result).toEqual(mockProperty);

            // Should be cached now
            const cachedResult = await mredService.getProperty('123');
            expect(cachedResult).toEqual(mockProperty);
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('should handle API errors', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                headers: new Headers()
            });

            await expect(mredService.getProperty('456')).rejects.toThrow(APIError);
        });

        it('should handle rate limits', async () => {
            // Make multiple rapid requests
            const promises = Array(5).fill(0).map(() => mredService.getProperty('123'));
            await expect(Promise.all(promises)).rejects.toThrow(RateLimitError);
        });
    });

    describe('searchProperties', () => {
        const mockProperties: Property[] = [
            {
                ListingKey: '123',
                ListPrice: 500000,
                BedroomsTotal: 3,
                BathroomsTotalInteger: 2,
                LivingArea: 2000,
                City: 'Geneva',
                StateOrProvince: 'IL',
                PostalCode: '60134',
                StandardStatus: 'Active',
                PublicRemarks: 'Beautiful home',
                Photos: ['photo1.jpg']
            },
            {
                ListingKey: '456',
                ListPrice: 600000,
                BedroomsTotal: 4,
                BathroomsTotalInteger: 3,
                LivingArea: 2500,
                City: 'Geneva',
                StateOrProvince: 'IL',
                PostalCode: '60134',
                StandardStatus: 'Active',
                PublicRemarks: 'Spacious home',
                Photos: ['photo2.jpg']
            }
        ];

        it('should search and cache properties', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProperties),
                headers: new Headers({ 'content-length': '1000' })
            });

            const searchParams = { city: 'Geneva', minPrice: 400000, maxPrice: 700000 };
            const results = await mredService.searchProperties(searchParams);
            expect(results).toEqual(mockProperties);

            // Should be cached now
            const cachedResults = await mredService.searchProperties(searchParams);
            expect(cachedResults).toEqual(mockProperties);
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('should handle empty results', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([]),
                headers: new Headers({ 'content-length': '2' })
            });

            const results = await mredService.searchProperties({ city: 'NonExistent' });
            expect(results).toEqual([]);
        });

        it('should pre-fetch related properties', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([mockProperties[0]]),
                headers: new Headers({ 'content-length': '500' })
            });

            await mredService.prefetchRelatedProperties(mockProperties[0]);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/properties/search'),
                expect.objectContaining({
                    body: expect.stringContaining(mockProperties[0].City)
                })
            );
        });
    });
}); 