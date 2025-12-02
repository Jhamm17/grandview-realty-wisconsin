'use client';

import { useEffect, useState, useRef } from 'react';

interface HeroVideoProps {
  posterImage: string;
  posterAlt: string;
}

export default function HeroVideo({ posterImage, posterAlt }: HeroVideoProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Reset state when component mounts
    setIsVideoLoaded(false);
    setIsVideoError(false);
    setShouldLoadVideo(true);
    setIsInitialized(false);

    // Reset video element if it exists
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check connection speed (basic heuristic)
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g'
    );
    
    // Only disable video for very slow connections or reduced motion preference
    // Allow video on mobile devices for better user experience
    if (prefersReducedMotion || isSlowConnection) {
      setShouldLoadVideo(false);
      setIsVideoError(true);
    }

    setIsInitialized(true);
  }, []);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const handleVideoError = () => {
    setIsVideoError(true);
  };

  const handleVideoCanPlay = () => {
    if (videoRef.current) {
      // Add a small delay for mobile devices
      setTimeout(() => {
        videoRef.current?.play().catch((error) => {
          console.log('Video autoplay failed:', error);
          // Auto-play failed, fall back to image
          setIsVideoError(true);
        });
      }, 100);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Video Element - Always render to prevent grey flash */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        style={{ objectPosition: "center 70%" }}
        preload="auto"
        onLoadedData={handleVideoLoad}
        onCanPlay={handleVideoCanPlay}
        onError={handleVideoError}
      >
        {/* Desktop video (larger screens) */}
        <source 
          src="/Grandview Home.mp4" 
          type="video/mp4" 
          media="(min-width: 768px)"
        />
        
        {/* Mobile video (smaller screens) */}
        <source 
          src="/GrandviewMobile.mp4" 
          type="video/mp4" 
          media="(max-width: 767px)"
        />
      </video>
      
      {/* Fallback image - Only show if video fails to load */}
      {isVideoError && (
        <img
          src={posterImage}
          alt={posterAlt}
          className="w-full h-full object-cover absolute inset-0"
          style={{ objectPosition: "center 70%" }}
        />
      )}
    </div>
  );
} 