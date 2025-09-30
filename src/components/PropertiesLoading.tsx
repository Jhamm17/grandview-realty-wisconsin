export default function PropertiesLoading() {
  return (
    <div className="container-padding py-16">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-12 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
        </div>

        {/* Filter Controls Skeleton */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Results Count Skeleton */}
        <div className="mb-6">
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>

        {/* Property Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white shadow-md overflow-hidden" style={{ borderRadius: '0' }}>
              {/* Image Skeleton */}
              <div className="relative h-64 bg-gray-200">
                <div className="absolute bottom-0 left-0 bg-gray-300 w-20 h-8"></div>
              </div>
              
              {/* Content Skeleton */}
              <div className="p-6 text-center">
                <div className="h-8 w-3/4 bg-gray-200 rounded mx-auto mb-3"></div>
                <div className="h-5 w-1/2 bg-gray-200 rounded mx-auto mb-4"></div>
                <div className="h-8 w-1/3 bg-gray-200 rounded mx-auto mb-4"></div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 