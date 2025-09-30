'use client';

import { Property } from '@/lib/mred/types';
import PropertyFilter from '@/components/PropertyFilter';
import { useEffect, useState } from 'react';
import PropertiesLoading from '@/components/PropertiesLoading';

export default function AreaPropertiesPage({ params }: { params: { area: string } }) {
  const area = decodeURIComponent(params.area);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPropertiesByArea() {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[Area Page] Fetching properties for area: ${area}`);
        
        // Use relative URL to avoid environment variable issues
        const response = await fetch('/api/properties', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log(`[Area Page] API response status: ${response.status}`);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(`API returned error: ${data.error}`);
        }

        const allProperties = data.properties || [];
        
        // Filter properties by area (city)
        const areaProperties = allProperties.filter((property: Property) => 
          property.City?.toLowerCase().includes(area.toLowerCase()) ||
          property.UnparsedAddress?.toLowerCase().includes(area.toLowerCase())
        );

        console.log(`[Area Page] Found ${areaProperties.length} properties for area: ${area}`);
        setProperties(areaProperties);
      } catch (err) {
        console.error('Error fetching properties by area:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPropertiesByArea();
  }, [area]);

  if (loading) {
    return (
      <main className="container-padding py-12 min-h-screen">
        <h1 className="text-4xl font-bold mb-2 text-center">Properties in {area}</h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Explore active properties in {area}. Use the filters to narrow your search.
        </p>
        <PropertiesLoading />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container-padding py-12 min-h-screen">
        <h1 className="text-4xl font-bold mb-2 text-center">Properties in {area}</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error Loading Properties</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (properties.length === 0) {
    return (
      <main className="container-padding py-12 min-h-screen">
        <h1 className="text-4xl font-bold mb-2 text-center">Properties in {area}</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-yellow-800 text-lg font-semibold mb-2">No Properties Found</h2>
          <p className="text-yellow-600">
            We couldn&apos;t find any properties in {area}. Please try a different area or check back later.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container-padding py-12 min-h-screen">
      <h1 className="text-4xl font-bold mb-2 text-center">Properties in {area}</h1>
      <p className="text-center text-lg text-gray-600 mb-8">
        Explore active properties in {area}. Use the filters to narrow your search.
      </p>
      <PropertyFilter initialProperties={properties} />
    </main>
  );
} 