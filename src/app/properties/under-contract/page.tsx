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
  title: 'Properties Under Contract - Grandview Realty',
  description: 'Explore all properties currently under contract. Use the filters to narrow your search.',
  openGraph: {
    title: 'Properties Under Contract - Grandview Realty',
    description: 'Explore all properties currently under contract.',
  },
};

// Cache for 15 minutes (same as PropertyCacheService)
export const revalidate = 900; // 15 minutes in seconds

export default async function UnderContractPage() {
  try {
    const underContractProperties = await PropertyCacheService.getUnderContractProperties();

    if (underContractProperties.length === 0) {
      return (
        <main className="container-padding py-12 min-h-screen">
          <h1 className="text-4xl font-bold mb-2 text-center">Properties Under Contract</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-yellow-800 text-lg font-semibold mb-2">No Properties Under Contract</h2>
            <p className="text-yellow-600">
              We currently don&apos;t have any properties under contract. Please check back later or browse our active listings.
            </p>
            <div className="mt-4">
              <a 
                href="/properties" 
                className="text-blue-600 hover:text-blue-800 underline font-semibold"
              >
                View Active Listings →
              </a>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="container-padding py-12 min-h-screen">
        {/* Preload property images for better performance */}
        <PreloadPropertyImages properties={underContractProperties} />
        
        <h1 className="text-4xl font-bold mb-2 text-center">Properties Under Contract</h1>
        <p className="text-center text-lg text-gray-600 mb-8">
          Explore all properties currently under contract. Use the filters to narrow your search.
        </p>
        <PropertyFilter initialProperties={underContractProperties} />
      </main>
    );
  } catch (error) {
    console.error('Error loading under contract properties:', error);
    
    return (
      <main className="container-padding py-12 min-h-screen">
        <h1 className="text-4xl font-bold mb-2 text-center">Properties Under Contract</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error Loading Properties</h2>
          <p className="text-red-600 mb-4">
            We encountered an error while loading properties under contract. Please try again later.
          </p>
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
} 