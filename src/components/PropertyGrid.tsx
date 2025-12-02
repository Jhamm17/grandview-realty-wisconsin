'use client';

import { useEffect, useState } from 'react';
import { Property } from '@/lib/mred/types';
import { ClientPropertyService } from '@/lib/client-property-service';
// Using regular img tags for Supabase storage URLs
import Link from 'next/link';
import { cleanStatusText } from '@/lib/utils';

interface PropertyGridProps {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
    baths?: number;
    propertyType?: string;
}

export function PropertyGrid({ city, minPrice, maxPrice, beds, baths, propertyType }: PropertyGridProps) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProperties = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Fetching properties with params:', {
                    city, minPrice, maxPrice, beds, baths, propertyType
                });

                const allProperties = await ClientPropertyService.getAllProperties();
                
                // Filter properties based on criteria
                let results = allProperties;
                
                if (city) {
                    results = results.filter(p => 
                        p.City?.toLowerCase().includes(city.toLowerCase())
                    );
                }
                
                if (minPrice) {
                    results = results.filter(p => p.ListPrice && p.ListPrice >= minPrice);
                }
                
                if (maxPrice) {
                    results = results.filter(p => p.ListPrice && p.ListPrice <= maxPrice);
                }
                
                if (beds) {
                    results = results.filter(p => p.BedroomsTotal && p.BedroomsTotal >= beds);
                }
                
                if (baths) {
                    results = results.filter(p => p.BathroomsTotalInteger && p.BathroomsTotalInteger >= baths);
                }
                
                if (propertyType) {
                    results = results.filter(p => 
                        p.PropertyType?.toLowerCase().includes(propertyType.toLowerCase())
                    );
                }
                
                // Limit to 12 results and sort by price
                results = results
                    .sort((a, b) => (b.ListPrice || 0) - (a.ListPrice || 0))
                    .slice(0, 12);

                console.log('Fetched properties:', results);
                setProperties(results);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                console.error('Error loading properties:', err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadProperties();
    }, [city, minPrice, maxPrice, beds, baths, propertyType]);

    if (loading) {
        return <div className="p-4 text-center">Loading properties...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded">
                <h3 className="font-bold mb-2">Error Loading Properties</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                No properties found matching your criteria.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
                <Link 
                    key={property.ListingId} 
                    href={`/property/${property.ListingId}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                    {/* Property Image */}
                    <div className="relative h-48 bg-gray-200">
                        {property.Media && property.Media.length > 0 ? (
                            <>
                                {(() => {
                                    // Sort media by Order to ensure proper sequence, then get the first image
                                    const sortedMedia = property.Media.sort((a, b) => (a.Order || 0) - (b.Order || 0));
                                    const firstImage = sortedMedia[0];
                                    
                                    // Preload the first image for better performance
                                    if (firstImage?.MediaURL && typeof window !== 'undefined') {
                                        const preloadImg = new (window as any).Image();
                                        preloadImg.src = firstImage.MediaURL;
                                    }
                                    
                                    return (
                                        <img
                                            src={firstImage.MediaURL}
                                            alt={property.UnparsedAddress || 'Property'}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    );
                                })()}
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-gray-400 text-center">
                                    <p className="text-sm">No Image</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Price Badge */}
                        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                            ${property.ListPrice?.toLocaleString()}
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-sm">
                            {cleanStatusText(property.StandardStatus)}
                        </div>
                    </div>
                    
                    {/* Property Details */}
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                            {property.UnparsedAddress}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                            {property.City}, {property.StateOrProvince}
                        </p>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{property.BedroomsTotal} beds</span>
                            <span>{property.BathroomsTotalInteger} baths</span>
                            <span>{property.LivingArea?.toLocaleString()} sqft</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
} 