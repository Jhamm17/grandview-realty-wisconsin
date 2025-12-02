'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
// Using regular img tags for Supabase storage URLs
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PropertyGalleryProps {
  images: Array<{
    MediaURL: string;
    MediaCategory?: string;
    MediaDescription?: string;
  }>;
  propertyAddress: string;
}

export default function PropertyGallery({ images, propertyAddress }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true); // Changed to true to show thumbnails by default
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Filter out images that don't have valid URLs
  const validImages = images.filter(img => img.MediaURL && img.MediaURL.trim() !== '');

  const nextImage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [validImages.length, isTransitioning]);

  const prevImage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [validImages.length, isTransitioning]);

  const goToImage = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, isTransitioning]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
  }, [isTransitioning]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || isTransitioning) return;
    
    const currentX = e.clientX;
    const diff = currentX - dragStartX;
    setDragOffset(diff);
  }, [isDragging, dragStartX, isTransitioning]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || isTransitioning) return;
    
    setIsDragging(false);
    
    // Determine if we should change images based on drag distance
    const threshold = 50; // pixels
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        prevImage();
      } else {
        nextImage();
      }
    }
    
    setDragOffset(0);
  }, [isDragging, dragOffset, prevImage, nextImage, isTransitioning]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragOffset(0);
  }, [isTransitioning]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || isTransitioning) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - dragStartX;
    setDragOffset(diff);
  }, [isDragging, dragStartX, isTransitioning]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'Escape') {
        setShowThumbnails(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage]);

  // Auto-advance slideshow removed - users control navigation manually

  // If no valid images, show placeholder
  if (validImages.length === 0) {
    return (
      <div className="relative h-96 bg-gray-200 rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <p className="text-lg">No Images Available</p>
            <p className="text-sm mt-2">Contact us for more information</p>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = validImages[currentIndex];

  return (
    <div className="relative">
      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative h-96 md:h-[500px] bg-gray-200 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image with enhanced animations */}
        <div 
          ref={imageRef}
          className="relative w-full h-full"
          style={{
            transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
            transition: isDragging 
              ? 'none' 
              : isTransitioning 
                ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                : 'transform 0.2s ease-out'
          }}
        >
          <img
            src={currentImage.MediaURL}
            alt={currentImage.MediaDescription || `${propertyAddress} - Image ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            style={{
              transition: isTransitioning ? 'opacity 0.3s ease-in-out' : 'opacity 0.2s ease-out'
            }}
          />
        </div>

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {currentIndex + 1} / {validImages.length}
        </div>

        {/* Navigation Arrows with enhanced hover effects */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Thumbnail Toggle Button */}
        {validImages.length > 1 && (
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="absolute bottom-4 left-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white px-3 py-1 rounded-full text-sm transition-all duration-200 backdrop-blur-sm"
          >
            {showThumbnails ? 'Hide' : 'Show'} Thumbnails
          </button>
        )}

        {/* Image Description */}
        {currentImage.MediaDescription && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm max-w-xs truncate backdrop-blur-sm">
            {currentImage.MediaDescription}
          </div>
        )}
      </div>

      {/* Enhanced Thumbnail Navigation - Always visible when multiple images */}
      {validImages.length > 1 && (
        <div className="mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                disabled={isTransitioning}
                className={`flex-shrink-0 relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  index === currentIndex 
                    ? 'border-blue-500 scale-105 shadow-lg ring-2 ring-blue-200' 
                    : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                }`}
              >
                <img
                  src={image.MediaURL}
                  alt={`${propertyAddress} - Thumbnail ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  {index !== currentIndex && (
                    <div className="w-2 h-2 bg-white rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Dots Indicator - Only show when thumbnails are hidden */}
      {!showThumbnails && validImages.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 disabled:opacity-50 disabled:cursor-not-allowed ${
                index === currentIndex 
                  ? 'bg-blue-500 scale-125 shadow-lg' 
                  : 'bg-gray-300 hover:bg-gray-400 hover:shadow-md'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 