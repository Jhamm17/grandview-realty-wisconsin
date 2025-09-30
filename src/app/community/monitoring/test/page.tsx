'use client';

import { useState, useEffect } from 'react';
import { mlsGridService } from '@/lib/mred/api';
import { Property } from '@/lib/mred/types';

export default function APITestPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        const fetchTestData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Only fetch 5 properties from Geneva
                const results = await mlsGridService.searchProperties({
                    city: 'Geneva',
                    top: 5,
                    // Only select essential fields to minimize data transfer
                    select: [
                        'ListingKey',
                        'ListPrice',
                        'BedroomsTotal',
                        'BathroomsTotalInteger',
                        'City',
                        'StateOrProvince',
                        'StandardStatus'
                    ]
                });

                setProperties(results);
                setRequestCount(prev => prev + 1);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch properties');
            } finally {
                setLoading(false);
            }
        };

        fetchTestData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold">API Integration Test</h1>
                <div className="text-sm text-gray-600">
                    API Requests Made: {requestCount}
                </div>
            </div>

            {/* Test Status */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Test Configuration</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Location: Geneva only</li>
                    <li>Limit: 5 properties</li>
                    <li>Fields: Basic information only</li>
                    <li>Cache Duration: 5 minutes</li>
                </ul>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8">
                    <h3 className="font-bold">Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Properties Display */}
            {!loading && !error && (
                <div className="grid gap-6">
                    {properties.map(property => (
                        <div key={property.ListingKey} className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-2xl font-bold">${property.ListPrice.toLocaleString()}</p>
                                    <p className="text-gray-600">{property.City}, {property.StateOrProvince}</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {property.StandardStatus}
                                </span>
                            </div>
                            <div className="flex gap-4 text-gray-600">
                                <p>{property.BedroomsTotal} beds</p>
                                <p>{property.BathroomsTotalInteger} baths</p>
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                                Listing ID: {property.ListingKey}
                            </div>
                        </div>
                    ))}

                    {properties.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            No properties found
                        </div>
                    )}
                </div>
            )}

            {/* Request Information */}
            <div className="mt-8 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                <h3 className="font-semibold mb-2">API Request Details:</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                    {JSON.stringify({
                        endpoint: 'searchProperties',
                        parameters: {
                            city: 'Geneva',
                            top: 5,
                            select: [
                                'ListingKey',
                                'ListPrice',
                                'BedroomsTotal',
                                'BathroomsTotalInteger',
                                'City',
                                'StateOrProvince',
                                'StandardStatus'
                            ]
                        }
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
} 