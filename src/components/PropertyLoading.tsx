'use client';

export default function PropertyLoading() {
  return (
    <div className="container-padding py-16">
      <div className="animate-pulse">
        {/* Back Button Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Property Header Skeleton */}
        <div className="mb-8">
          <div className="h-12 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 w-48 bg-gray-200 rounded"></div>
        </div>

        {/* Main Image Skeleton */}
        <div className="mb-8">
          <div className="h-96 w-full bg-gray-200 rounded-lg"></div>
        </div>

        {/* Property Details Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
              
              {/* Stats Grid Skeleton */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="h-10 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-10 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-10 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                </div>
              </div>

              {/* Additional Details Skeleton */}
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-200">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact/MLS Info Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 