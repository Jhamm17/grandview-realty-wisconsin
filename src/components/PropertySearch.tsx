'use client';

import { useState } from 'react';
import { PropertyGrid } from './PropertyGrid';
import { ErrorBoundary } from './ErrorBoundary';

function ErrorFallback({ error }: { error: Error }) {
    return (
        <div className="p-4 bg-red-100 text-red-700 rounded">
            <h3 className="font-bold mb-2">Error in Property Search:</h3>
            <pre className="text-sm whitespace-pre-wrap">{error.message}</pre>
        </div>
    );
}

export default function PropertySearch() {
    const [filters, setFilters] = useState({
        city: '',
        minPrice: undefined as number | undefined,
        maxPrice: undefined as number | undefined,
        beds: undefined as number | undefined,
        baths: undefined as number | undefined,
        propertyType: undefined as string | undefined
    });

    console.log('PropertySearch rendering with filters:', filters);

    return (
        <div className="container-padding py-8">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <input
                        type="text"
                        placeholder="City"
                        className="p-2 border rounded"
                        value={filters.city}
                        onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    />
                    <input
                        type="number"
                        placeholder="Min Price"
                        className="p-2 border rounded"
                        value={filters.minPrice || ''}
                        onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            minPrice: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                    />
                    <input
                        type="number"
                        placeholder="Max Price"
                        className="p-2 border rounded"
                        value={filters.maxPrice || ''}
                        onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            maxPrice: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                    />
                    <select
                        className="p-2 border rounded"
                        value={filters.beds || ''}
                        onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            beds: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                    >
                        <option value="">Beds</option>
                        {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}+ beds</option>
                        ))}
                    </select>
                    <select
                        className="p-2 border rounded"
                        value={filters.baths || ''}
                        onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            baths: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                    >
                        <option value="">Baths</option>
                        {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}+ baths</option>
                        ))}
                    </select>
                    <select
                        className="p-2 border rounded"
                        value={filters.propertyType || ''}
                        onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            propertyType: e.target.value || undefined 
                        }))}
                    >
                        <option value="">Property Type</option>
                        <option value="Residential">Residential</option>
                        <option value="Condo">Condo</option>
                        <option value="MultiFamily">Multi-Family</option>
                        <option value="Land">Land</option>
                    </select>
                </div>
            </div>

            {/* Property Grid with Error Boundary */}
            <ErrorBoundary fallback={ErrorFallback}>
                <PropertyGrid {...filters} />
            </ErrorBoundary>

            {/* Debug Info */}
            <div className="mt-8 p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">Debug Info:</h3>
                <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(filters, null, 2)}
                </pre>
            </div>
        </div>
    );
} 