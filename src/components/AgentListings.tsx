'use client';

import { useState, useEffect } from 'react';
// Using regular img tags for Supabase storage URLs
import Link from 'next/link';
import { Property } from '@/lib/mred/types';

interface AgentListingsProps {
  agentId: string;
  agentName: string;
  listings?: Property[];
}

export default function AgentListings({ agentId, agentName, listings: preFetchedListings }: AgentListingsProps) {
  const [listings, setListings] = useState<Property[]>(preFetchedListings || []);
  const [loading, setLoading] = useState(!preFetchedListings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have pre-fetched listings, use them
    if (preFetchedListings) {
      setListings(preFetchedListings);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    async function fetchListings() {
      try {
        setLoading(true);
        const response = await fetch(`/api/agents/${agentId}/listings`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        setListings(data.data || []);
      } catch (err) {
        console.error('Error fetching agent listings:', err);
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [agentId, preFetchedListings]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-padding">
          <h2 className="text-3xl font-bold mb-8 text-center">Active Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-padding">
          <h2 className="text-3xl font-bold mb-8 text-center">Active Listings</h2>
          <div className="text-center text-gray-600">
            <p>Unable to load listings at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-padding">
          <h2 className="text-3xl font-bold mb-8 text-center">Active Listings</h2>
          <div className="text-center text-gray-600">
            <p>No active listings found for {agentName}.</p>
            <p className="mt-2">Check back soon for new properties!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-padding">
        <h2 className="text-3xl font-bold mb-8 text-center">Active Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.ListingId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/property/${listing.ListingId}`}>
                <div className="relative h-48 bg-gray-200">
                  {listing.Media && listing.Media.length > 0 ? (
                    (() => {
                      // Sort media by Order to ensure proper sequence, then get the first image
                      const sortedMedia = listing.Media.sort((a, b) => (a.Order || 0) - (b.Order || 0));
                      const firstImage = sortedMedia[0];
                      
                      // Preload the first image for better performance
                      if (firstImage?.MediaURL && typeof window !== 'undefined') {
                        const preloadImg = new (window as any).Image();
                        preloadImg.src = firstImage.MediaURL;
                      }
                      
                      return (
                        <img
                          src={firstImage.MediaURL}
                          alt={listing.UnparsedAddress || 'Property'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      );
                    })()
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    ${listing.ListPrice.toLocaleString()}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">
                    {listing.UnparsedAddress || `${listing.StreetNumber} ${listing.StreetName}`}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {listing.City}, {listing.StateOrProvince} {listing.PostalCode}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{listing.BedroomsTotal} beds</span>
                    <span>{listing.BathroomsTotalInteger} baths</span>
                    <span>{listing.LivingArea?.toLocaleString()} sq ft</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 