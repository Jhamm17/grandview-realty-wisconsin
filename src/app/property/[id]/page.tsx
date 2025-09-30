import { PropertyCacheService } from '@/lib/property-cache';
import PropertyGallery from '@/components/PropertyGallery';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cleanStatusText } from '@/lib/utils';
import { getAgentByNameOrEmail } from '@/lib/agent-service';

// Preload component for property images
function PreloadPropertyImages({ images }: { images: any[] }) {
  if (typeof window !== 'undefined' && images && images.length > 0) {
    // Preload the first 3 images for better performance
    const imagesToPreload = Math.min(3, images.length);
    for (let i = 0; i < imagesToPreload; i++) {
      const img = new (window as any).Image();
      img.src = images[i].MediaURL;
    }
  }
  return null;
}

interface PropertyPageProps {
  params: { id: string };
}

// Force dynamic rendering - no static generation to avoid API calls during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate metadata for SEO
export async function generateMetadata({ params }: PropertyPageProps) {
  try {
    const property = await PropertyCacheService.getProperty(params.id);
    
    if (!property) {
      return {
        title: 'Property Not Found',
        description: 'The requested property could not be found.',
      };
    }

    // Create the street address for the title
    const streetAddress = property.StreetNumber && property.StreetName 
      ? `${property.StreetNumber} ${property.StreetName} ${property.StreetSuffix || ''}`.trim()
      : property.UnparsedAddress || 'Property';

    return {
      title: `${streetAddress} - Grandview Realty`,
      description: `${property.BedroomsTotal} bed, ${property.BathroomsTotalInteger} bath home for sale in ${property.City}, ${property.StateOrProvince}. Listed at $${property.ListPrice?.toLocaleString()}.`,
      openGraph: {
        title: `${streetAddress} - Grandview Realty`,
        description: `${property.BedroomsTotal} bed, ${property.BathroomsTotalInteger} bath home for sale in ${property.City}, ${property.StateOrProvince}.`,
        images: property.Media && property.Media.length > 0 ? [property.Media[0].MediaURL] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Property - Grandview Realty',
      description: 'Property details from Grandview Realty.',
    };
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  try {
    const property = await PropertyCacheService.getProperty(params.id);

    if (!property) {
      notFound();
    }

    // Fetch agent information if we have agent details
    let agent = null;
    if (property.ListAgentFullName || property.ListAgentEmail) {
      console.log(`[PropertyPage] Looking for agent: "${property.ListAgentFullName}" or "${property.ListAgentEmail}"`);
      
      // Special case for Chris Clark - try both name variations
      if (property.ListAgentFullName && property.ListAgentFullName.includes('Christopher Clark')) {
        agent = await getAgentByNameOrEmail('Chris Clark');
        if (!agent) {
          agent = await getAgentByNameOrEmail(property.ListAgentFullName);
        }
      } else {
        agent = await getAgentByNameOrEmail(property.ListAgentFullName || property.ListAgentEmail || '');
      }
      
      console.log(`[PropertyPage] Found agent:`, agent);
    }

    return (
      <div className="container-padding py-16">
        {/* Preload property images for better performance */}
        <PreloadPropertyImages images={property.Media || []} />
        
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/properties" className="text-blue-600 hover:text-blue-800 underline flex items-center">
            ← Back to Properties
          </Link>
        </div>

        {/* Mobile Property Header - Address, Location, Price Above Gallery */}
        <div className="block lg:hidden mb-6">
          <h1 className="text-3xl font-bold mb-2 text-black">
            {property.StreetNumber && property.StreetName 
              ? `${property.StreetNumber} ${property.StreetName} ${property.StreetSuffix || ''}`.trim()
              : property.UnparsedAddress || 'Address not available'
            }
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {property.City}, {property.StateOrProvince} {property.PostalCode}
          </p>
          <p className="text-2xl font-semibold mb-4" style={{ color: '#3D9BE9' }}>
            ${property.ListPrice?.toLocaleString()}
          </p>
        </div>

        {/* Mobile Status Bubble - Above Gallery */}
        <div className="block lg:hidden mb-4">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
            property.StandardStatus === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {cleanStatusText(property.StandardStatus)}
          </span>
        </div>

        {/* Property Header - Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Property Gallery */}
          <div className="lg:col-span-1">
            <PropertyGallery 
              images={property.Media || []}
              propertyAddress={property.UnparsedAddress || 'Property'}
            />
          </div>

          {/* Property Info - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <h1 className="text-4xl font-bold mb-2 text-black">
              {property.StreetNumber && property.StreetName 
                ? `${property.StreetNumber} ${property.StreetName} ${property.StreetSuffix || ''}`.trim()
                : property.UnparsedAddress || 'Address not available'
              }
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              {property.City}, {property.StateOrProvince} {property.PostalCode}
            </p>
            <p className="text-2xl font-semibold mb-6" style={{ color: '#3D9BE9' }}>
              ${property.ListPrice?.toLocaleString()}
            </p>
            
            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{property.BedroomsTotal}</div>
                <div className="text-gray-600">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{property.BathroomsTotalInteger}</div>
                <div className="text-gray-600">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {property.LivingArea ? `${property.LivingArea.toLocaleString()} sq ft` : 'N/A'}
                </div>
                <div className="text-gray-600">Square Feet</div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-8">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                property.StandardStatus === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {cleanStatusText(property.StandardStatus)}
              </span>
            </div>

            {/* Agent Information */}
            {property.ListAgentFullName && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Listing Agent</h3>
                <div className="flex items-center mb-4">
                  {agent && (agent.logo_url || agent.image_url) ? (
                    <div className="w-12 h-12 mr-3 flex items-center justify-center">
                      <img
                        src={agent.logo_url || agent.image_url}
                        alt={`${agent.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-blue-600">
                        {property.ListAgentFullName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {agent ? agent.name : property.ListAgentFullName}
                    </h4>
                    {agent && agent.title && (
                      <p className="text-sm text-gray-600">{agent.title}</p>
                    )}
                    {!agent && property.ListOfficeName && (
                      <p className="text-sm text-gray-600">{property.ListOfficeName}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {(agent?.email || property.ListAgentEmail) && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${agent?.email || property.ListAgentEmail}`} className="text-blue-600 hover:text-blue-800">
                        {agent?.email || property.ListAgentEmail}
                      </a>
                    </div>
                  )}
                  {(agent?.phone || property.ListAgentDirectPhone) && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${agent?.phone || property.ListAgentDirectPhone}`} className="text-blue-600 hover:text-blue-800">
                        {agent?.phone || property.ListAgentDirectPhone}
                      </a>
                    </div>
                  )}
                </div>

                <a 
                  href={`mailto:${agent?.email || property.ListAgentEmail || 'info@grandviewrealty.com'}?subject=Inquiry about ${property.UnparsedAddress}`}
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Contact Agent
                </a>
              </div>
            )}

            {/* Contact Info - Fallback if no agent */}
            {!property.ListAgentFullName && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Interested in this property?</h3>
                <div className="space-y-3">
                  <a 
                    href="tel:+1234567890" 
                    className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Call Us
                  </a>
                  <a 
                    href="mailto:info@grandviewrealty.com" 
                    className="block w-full bg-white text-blue-600 border border-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Property Details Grid - Below Gallery */}
        <div className="block lg:hidden mb-8">
          <div className="grid grid-cols-2 gap-6">
            {/* Bedrooms */}
            <div className="text-center bg-gray-50 rounded-lg p-4">
              <div className="flex justify-center mb-2">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 640 640" style={{ color: '#3D9BE9' }}>
                  <path d="M64 96C81.7 96 96 110.3 96 128L96 352L320 352L320 224C320 206.3 334.3 192 352 192L512 192C565 192 608 235 608 288L608 512C608 529.7 593.7 544 576 544C558.3 544 544 529.7 544 512L544 448L96 448L96 512C96 529.7 81.7 544 64 544C46.3 544 32 529.7 32 512L32 128C32 110.3 46.3 96 64 96zM144 256C144 220.7 172.7 192 208 192C243.3 192 272 220.7 272 256C272 291.3 243.3 320 208 320C172.7 320 144 291.3 144 256z"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-800">{property.BedroomsTotal}</div>
              <div className="text-sm text-gray-600">Bedrooms</div>
            </div>

            {/* Bathrooms */}
            <div className="text-center bg-gray-50 rounded-lg p-4">
              <div className="flex justify-center mb-2">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 640 640" style={{ color: '#3D9BE9' }}>
                  <path d="M128 195.9C128 176.1 144.1 160 163.9 160C173.4 160 182.5 163.8 189.3 170.5L205.5 186.7C184.5 225.6 188.1 274.2 216.4 309.7L215 311C205.6 320.4 205.6 335.6 215 344.9C224.4 354.2 239.6 354.3 248.9 344.9L409 185C418.4 175.6 418.4 160.4 409 151.1C399.6 141.8 384.4 141.7 375.1 151.1L373.8 152.4C338.3 124.1 289.7 120.5 250.8 141.5L234.5 125.3C215.8 106.5 190.4 96 163.9 96C108.7 96 64 140.7 64 195.9L64 512C64 529.7 78.3 544 96 544C113.7 544 128 529.7 128 512L128 195.9zM320 416C337.7 416 352 401.7 352 384C352 366.3 337.7 352 320 352C302.3 352 288 366.3 288 384C288 401.7 302.3 416 320 416zM384 480C384 462.3 369.7 448 352 448C334.3 448 320 462.3 320 480C320 497.7 334.3 512 352 512C369.7 512 384 497.7 384 480zM384 352C401.7 352 416 337.7 416 320C416 302.3 401.7 288 384 288C366.3 288 352 302.3 352 320C352 337.7 366.3 352 384 352zM448 416C448 398.3 433.7 384 416 384C398.3 384 384 398.3 384 416C384 433.7 398.3 448 416 448C433.7 448 448 433.7 448 416zM448 288C465.7 288 480 273.7 480 256C480 238.3 465.7 224 448 224C430.3 224 416 238.3 416 256C416 273.7 430.3 288 448 288zM512 352C512 334.3 497.7 320 480 320C462.3 320 448 334.3 448 352C448 369.7 462.3 384 480 384C497.7 384 512 369.7 512 352zM544 320C561.7 320 576 305.7 576 288C576 270.3 561.7 256 544 256C526.3 256 512 270.3 512 288C512 305.7 526.3 320 544 320z"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-800">{property.BathroomsTotalInteger}</div>
              <div className="text-sm text-gray-600">Bathrooms</div>
            </div>

            {/* Square Feet */}
            <div className="text-center bg-gray-50 rounded-lg p-4">
              <div className="flex justify-center mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3D9BE9' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {property.LivingArea ? `${property.LivingArea.toLocaleString()}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Sq Ft</div>
            </div>

            {/* Year Built */}
            <div className="text-center bg-gray-50 rounded-lg p-4">
              <div className="flex justify-center mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3D9BE9' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-gray-800">{property.YearBuilt || 'N/A'}</div>
              <div className="text-sm text-gray-600">Year Built</div>
            </div>
          </div>
        </div>

        {/* Mobile Property Details */}
        <div className="block lg:hidden mb-8">
          <h2 className="text-2xl font-bold mb-4">Property Details</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-600">MLS #:</span>
                <span className="font-semibold">{property.ListingId?.replace(/^MRD/, '') || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold">{cleanStatusText(property.StandardStatus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Property Type:</span>
                <span className="font-semibold">{property.PropertyType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year Built:</span>
                <span className="font-semibold">{property.YearBuilt || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lot Size:</span>
                <span className="font-semibold">{property.LotSize || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">County:</span>
                <span className="font-semibold">{property.CountyOrParish || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Property Description */}
        <div className="block lg:hidden mb-8">
          <h2 className="text-2xl font-bold mb-4">Property Description</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-700 leading-relaxed">
              {property.PublicRemarks || 'No description available for this property.'}
            </p>
          </div>
        </div>

        {/* Mobile Agent Details */}
        {property.ListAgentFullName && (
          <div className="block lg:hidden mb-8">
            <h2 className="text-2xl font-bold mb-4">Listing Agent</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                {agent && (agent.logo_url || agent.image_url) ? (
                  <div className="w-16 h-16 mr-4 flex items-center justify-center">
                    <img
                      src={agent.logo_url || agent.image_url}
                      alt={`${agent.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {property.ListAgentFullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {agent ? agent.name : property.ListAgentFullName}
                  </h3>
                  {agent && agent.title && (
                    <p className="text-gray-600">{agent.title}</p>
                  )}
                  {!agent && property.ListOfficeName && (
                    <p className="text-gray-600">{property.ListOfficeName}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {(agent?.email || property.ListAgentEmail) && (
                  <div className="flex items-center">
                                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3D9BE9' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                    <a href={`mailto:${agent?.email || property.ListAgentEmail}`} className="text-blue-600 hover:text-blue-800">
                      {agent?.email || property.ListAgentEmail}
                    </a>
                  </div>
                )}
                {(agent?.phone || property.ListAgentDirectPhone) && (
                  <div className="flex items-center">
                                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3D9BE9' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                    <a href={`tel:${agent?.phone || property.ListAgentDirectPhone}`} className="text-blue-600 hover:text-blue-800">
                      {agent?.phone || property.ListAgentDirectPhone}
                    </a>
                  </div>
                )}
              </div>

              <a 
                href={`mailto:${agent?.email || property.ListAgentEmail || 'info@grandviewrealty.com'}?subject=Inquiry about ${property.UnparsedAddress}`}
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Agent
              </a>
            </div>
          </div>
        )}

        {/* Property Description - Desktop */}
        <div className="hidden lg:block mb-16">
          <h2 className="text-3xl font-bold mb-6">Property Details</h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Property Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {property.PublicRemarks || 'No description available for this property.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Property Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">MLS #:</span>
                    <span className="font-semibold">{property.ListingId?.replace(/^MRD/, '') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold">{cleanStatusText(property.StandardStatus)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-semibold">{property.PropertyType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year Built:</span>
                    <span className="font-semibold">{property.YearBuilt || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lot Size:</span>
                    <span className="font-semibold">{property.LotSize || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Location</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-semibold">{property.City}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">State:</span>
                    <span className="font-semibold">{property.StateOrProvince}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ZIP:</span>
                    <span className="font-semibold">{property.PostalCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">County:</span>
                    <span className="font-semibold">{property.CountyOrParish || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading property page:', error);
    notFound();
  }
} 