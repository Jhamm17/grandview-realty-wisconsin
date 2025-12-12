import { PropertyCacheService } from '@/lib/property-cache';
import PropertyFilter from '@/components/PropertyFilter';
import { Metadata } from 'next';

// Preload component for property images
function PreloadPropertyImages({ properties }: { properties: any[] }) {
  if (typeof window !== 'undefined' && properties && properties.length > 0) {
    // Preload the first image of the first 6 properties for better performance
    const propertiesToPreload = Math.min(6, properties.length);
    for (let i = 0; i < propertiesToPreload; i++) {
      const property = properties[i];
      if (property.Media && property.Media.length > 0) {
        const sortedMedia = property.Media.sort((a: any, b: any) => (a.Order || 0) - (b.Order || 0));
        const firstImage = sortedMedia[0];
        if (firstImage?.MediaURL) {
          const img = new (window as any).Image();
          img.src = firstImage.MediaURL;
        }
      }
    }
  }
  return null;
}

export const metadata: Metadata = {
  title: 'Active Listings - Grandview Realty',
  description: 'Explore all active properties currently listed for sale. Use the filters to narrow your search.',
  openGraph: {
    title: 'Active Listings - Grandview Realty',
    description: 'Explore all active properties currently listed for sale.',
  },
};

// Cache for 15 minutes (same as PropertyCacheService)
export const revalidate = 900; // 15 minutes in seconds

export default async function PropertiesPage() {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<Property[]>((_, reject) => {
      setTimeout(() => reject(new Error('Property fetch timeout after 10 seconds')), 10000);
    });
    
    const properties = await Promise.race([
      PropertyCacheService.getAllProperties(),
      timeoutPromise
    ]);

    if (properties.length === 0) {
      return (
        <main className="container-padding py-12 min-h-screen">
          <h1 className="text-4xl font-bold mb-2 text-center">Active Listings</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-yellow-800 text-lg font-semibold mb-2">No Properties Available</h2>
            <p className="text-yellow-600 mb-4">
              We&apos;re currently updating our property database. Please check back in a few minutes.
            </p>
            <div className="mt-4 text-sm text-yellow-700">
              <p className="font-semibold mb-2">This might be due to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Cache refresh in progress (check back in ~20 minutes)</li>
                <li>Cache not populated yet</li>
                <li>Supabase connection issues</li>
                <li>MLS API temporarily unavailable</li>
              </ul>
              <p className="mt-4 text-xs text-yellow-600">
                The cache is automatically refreshed daily. If this persists, please contact support.
              </p>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="container-padding py-12 min-h-screen">
        {/* Preload property images for better performance */}
        <PreloadPropertyImages properties={properties} />
        
        <h1 className="text-4xl font-bold mb-2 text-center">Active Listings</h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Explore all active properties currently listed for sale. Use the filters to narrow your search.
        </p>
        <PropertyFilter initialProperties={properties} />
      </main>
    );
  } catch (error) {
    console.error('Error loading properties:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('timeout');
    
    return (
      <main className="container-padding py-12 min-h-screen">
        <h1 className="text-4xl font-bold mb-2 text-center">Active Listings</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error Loading Properties</h2>
          <p className="text-red-600 mb-4">
            {isTimeout 
              ? 'The request took too long to complete. This might be due to a database connection issue.'
              : 'We encountered an error while loading properties. Please try again later.'}
          </p>
          {isTimeout && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <p className="font-semibold mb-1">What you can do:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Wait a few minutes and refresh the page</li>
                <li>Check if the cache refresh is still running</li>
                <li>The cache should be available shortly</li>
              </ul>
            </div>
          )}
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors inline-block"
            >
              Go Home
            </a>
          </div>
        </div>
      </main>
    );
  }
} 