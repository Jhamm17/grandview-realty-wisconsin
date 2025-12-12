'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/lib/mred/types';
// Using regular img tags for Supabase storage URLs
import Link from 'next/link';
import { cleanStatusText } from '@/lib/utils';

interface FilterProps {
  initialProperties: Property[];
}

// Loading skeleton component for property cards
function PropertyCardSkeleton() {
  return (
    <div className="bg-white shadow-md overflow-hidden" style={{ borderRadius: '0' }}>
      <div className="relative h-64 bg-gray-200 animate-pulse">
        <div className="absolute bottom-0 left-0 bg-gray-300 h-8 w-20 animate-pulse"></div>
      </div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/2"></div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
      </div>
    </div>
  );
}

export interface FilterState {
  city: string;
  minPrice: string;
  maxPrice: string;
  beds: string;
  baths: string;
  propertyType: string;
}

function filterProperties(properties: Property[], filters: FilterState): Property[] {
  return properties.filter(property => {
    // City filter
    if (filters.city && !property.City?.toLowerCase().includes(filters.city.toLowerCase())) {
      return false;
    }

    // Price filters
    if (filters.minPrice && (!property.ListPrice || property.ListPrice < parseInt(filters.minPrice))) {
      return false;
    }
    if (filters.maxPrice && (!property.ListPrice || property.ListPrice > parseInt(filters.maxPrice))) {
      return false;
    }

    // Bedrooms filter
    if (filters.beds && (property.BedroomsTotal ?? 0) < parseInt(filters.beds)) {
      return false;
    }

    // Bathrooms filter
    if (filters.baths && (property.BathroomsTotalInteger ?? 0) < parseInt(filters.baths)) {
      return false;
    }

    // Property type filter (if we have this data)
    // Map filter values to property types:
    // - "Residential" matches "Single-Family"
    // - "Condo" matches "Condominium"
    // - "Multi-Family" matches "Two-Family"
    if (filters.propertyType) {
      const propertyType = property.PropertyType || '';
      const filterValue = filters.propertyType;
      
      // Check exact match first
      if (propertyType === filterValue) {
        // Exact match, continue
      } else {
        // Check mapped values
        const matches = 
          (filterValue === 'Residential' && propertyType === 'Single-Family') ||
          (filterValue === 'Condo' && propertyType === 'Condominium') ||
          (filterValue === 'Multi-Family' && propertyType === 'Two-Family');
        
        if (!matches) {
          return false;
        }
      }
    }

    return true;
  });
}

// Helper function to get status badge style
function getStatusBadgeStyle(status?: string | null): string {
  if (!status) return 'bg-gray-500';
  if (status === 'Active') {
    return 'bg-blue-400';
  } else if (status === 'ActiveUnderContract' || status === 'Under Contract' || status === 'Pending' || status === 'Contingent') {
    return 'bg-orange-500';
  } else if (status === 'Sold') {
    return 'bg-green-600';
  } else {
    return 'bg-gray-500';
  }
}

// Helper function to get status badge text
function getStatusBadgeText(status?: string | null): string {
  if (!status) return 'N/A';
  const cleanedStatus = cleanStatusText(status);
  
  if (cleanedStatus === 'Active') {
    return 'LISTED';
  } else if (cleanedStatus === 'Under Contract') {
    return 'UNDER CONTRACT';
  } else if (cleanedStatus === 'Sold') {
    return 'SOLD';
  } else {
    return cleanedStatus.toUpperCase();
  }
}

export default function PropertyFilter({ initialProperties }: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    city: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
    propertyType: ''
  });
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(initialProperties);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(initialProperties.length > 0);

  useEffect(() => {
    const filtered = filterProperties(initialProperties, filters);
    setFilteredProperties(filtered);
    // If we have properties, stop loading immediately
    if (initialProperties.length > 0) {
      setIsLoading(false);
    }
  }, [initialProperties, filters]);

  // Handle loading state - show loading for a brief moment to allow images to load
  // But only if we actually have properties to show
  useEffect(() => {
    if (initialProperties.length === 0) {
      // No properties, don't show loading state
      setIsLoading(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Show loading for 1 second to allow images to start loading

    return () => clearTimeout(timer);
  }, [initialProperties.length]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      city: '',
      minPrice: '',
      maxPrice: '',
      beds: '',
      baths: '',
      propertyType: ''
    };
    setFilters(clearedFilters);
  };

  return (
    <div>
      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Filter Properties</h2>
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            <span>{isFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Collapsible Filter Content */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isFiltersOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Enter city name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Min Price */}
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Min Price
            </label>
            <input
              type="number"
              id="minPrice"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="Min price"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Price */}
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Max Price
            </label>
            <input
              type="number"
              id="maxPrice"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="Max price"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Beds */}
          <div>
            <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <select
              id="beds"
              value={filters.beds}
              onChange={(e) => handleFilterChange('beds', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          {/* Baths */}
          <div>
            <label htmlFor="baths" className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <select
              id="baths"
              value={filters.baths}
              onChange={(e) => handleFilterChange('baths', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              id="propertyType"
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="Residential">Residential</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Multi-Family">Multi-Family</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>
      </div>

      {/* Results Count */}
      {initialProperties.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProperties.length} of {initialProperties.length} properties
          </p>
        </div>
      )}

      {/* Filtered Properties Grid */}
      {initialProperties.length === 0 ? (
        // No properties at all - this is handled by the parent page component
        null
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-yellow-800 text-lg font-semibold mb-2">No Properties Found</h2>
          <p className="text-yellow-600">
            We couldn&apos;t find any properties matching your criteria. Please try adjusting your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <Link key={property.ListingId} href={`/property/${property.ListingId}`} className="block">
              <div className="bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200" style={{ borderRadius: '0' }}>
              {/* Property Image */}
              <div className="relative h-64">
                {(() => {
                  // Sort media by Order to ensure proper sequence, then get the first image
                  const sortedMedia = property.Media?.sort((a, b) => (a.Order || 0) - (b.Order || 0));
                  const firstImage = sortedMedia?.[0];
                  
                  // Preload the first image for better performance
                  if (firstImage?.MediaURL && typeof window !== 'undefined') {
                    const preloadImg = new (window as any).Image();
                    preloadImg.src = firstImage.MediaURL;
                  }
                  
                  if (firstImage?.MediaURL) {
                    return (
                      <>
                          <img
                            src={firstImage.MediaURL}
                            alt={`${property.UnparsedAddress || 'Property'} in ${property.City}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                              if (placeholder) { placeholder.style.display = 'flex'; }
                            }}
                          />
                        <div className="image-placeholder absolute inset-0 bg-gray-200 flex items-center justify-center" style={{ display: 'none' }}>
                          <span className="text-gray-400">Image unavailable</span>
                        </div>
                        {/* Status Badge */}
                        <div className={`absolute bottom-0 left-0 text-white px-2 py-1 text-lg font-black tracking-wider ${getStatusBadgeStyle(property.StandardStatus || property.MlsStatus)}`} style={{ borderRadius: '0' }}>
                          {getStatusBadgeText(property.StandardStatus || property.MlsStatus)}
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Property Details */}
              <div className="p-6 text-center">
                <h3 className="text-2xl font-semibold mb-3">
                  {property.StreetNumber && property.StreetName 
                    ? `${property.StreetNumber} ${property.StreetName} ${property.StreetSuffix || ''}`.trim()
                    : property.UnparsedAddress || 'Address not available'
                  }
                </h3>
                <p className="text-gray-600 mb-4 text-lg">{property.City}</p>
                <p className="text-black font-bold text-2xl mb-4">
                  ${property.ListPrice ? property.ListPrice.toLocaleString() : 'Price not available'}
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-gray-500 text-sm">
                    <div className="flex flex-col items-center">
                      <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 640 640" style={{ color: '#3D9BE9' }}>
                        <path d="M64 96C81.7 96 96 110.3 96 128L96 352L320 352L320 224C320 206.3 334.3 192 352 192L512 192C565 192 608 235 608 288L608 512C608 529.7 593.7 544 576 544C558.3 544 544 529.7 544 512L544 448L96 448L96 512C96 529.7 81.7 544 64 544C46.3 544 32 529.7 32 512L32 128C32 110.3 46.3 96 64 96zM144 256C144 220.7 172.7 192 208 192C243.3 192 272 220.7 272 256C272 291.3 243.3 320 208 320C172.7 320 144 291.3 144 256z"/>
                      </svg>
                      <span>{property.BedroomsTotal} Beds</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 640 640" style={{ color: '#3D9BE9' }}>
                        <path d="M128 195.9C128 176.1 144.1 160 163.9 160C173.4 160 182.5 163.8 189.3 170.5L205.5 186.7C184.5 225.6 188.1 274.2 216.4 309.7L215 311C205.6 320.4 205.6 335.6 215 344.9C224.4 354.2 239.6 354.3 248.9 344.9L409 185C418.4 175.6 418.4 160.4 409 151.1C399.6 141.8 384.4 141.7 375.1 151.1L373.8 152.4C338.3 124.1 289.7 120.5 250.8 141.5L234.5 125.3C215.8 106.5 190.4 96 163.9 96C108.7 96 64 140.7 64 195.9L64 512C64 529.7 78.3 544 96 544C113.7 544 128 529.7 128 512L128 195.9zM320 416C337.7 416 352 401.7 352 384C352 366.3 337.7 352 320 352C302.3 352 288 366.3 288 384C288 401.7 302.3 416 320 416zM384 480C384 462.3 369.7 448 352 448C334.3 448 320 462.3 320 480C320 497.7 334.3 512 352 512C369.7 512 384 497.7 384 480zM384 352C401.7 352 416 337.7 416 320C416 302.3 401.7 288 384 288C366.3 288 352 302.3 352 320C352 337.7 366.3 352 384 352zM448 416C448 398.3 433.7 384 416 384C398.3 384 384 398.3 384 416C384 433.7 398.3 448 416 448C433.7 448 448 433.7 448 416zM448 288C465.7 288 480 273.7 480 256C480 238.3 465.7 224 448 224C430.3 224 416 238.3 416 256C416 273.7 430.3 288 448 288zM512 352C512 334.3 497.7 320 480 320C462.3 320 448 334.3 448 352C448 369.7 462.3 384 480 384C497.7 384 512 369.7 512 352zM544 320C561.7 320 576 305.7 576 288C576 270.3 561.7 256 544 256C526.3 256 512 270.3 512 288C512 305.7 526.3 320 544 320z"/>
                      </svg>
                      <span>{property.BathroomsTotalInteger} Baths</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3D9BE9' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{property.LivingArea?.toLocaleString()} Sq Ft</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 