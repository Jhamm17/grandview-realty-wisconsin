"use client";

import { useEffect } from "react";

export default function ScrollController() {
  useEffect(() => {
    // Get the navigation height (h-24 = 96px)
    const navHeight = 96;
    
    // Prevent scrolling up past the navigation bar with hard stop
    const handleScroll = (e: Event) => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Prevent scrolling up past the navigation bar
      if (scrollTop < navHeight) {
        e.preventDefault();
        window.scrollTo(0, navHeight);
        return false;
      }
    };

    // Handle wheel events to prevent scrolling beyond bounds
    const handleWheel = (e: WheelEvent) => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Prevent scrolling up past navigation
      if (e.deltaY < 0 && scrollTop <= navHeight) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Handle touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop < navHeight) {
        e.preventDefault();
        return false;
      }
    };

    // Handle key events (arrow keys, page up/down, home/end)
    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Prevent keys that would scroll up past navigation
      if (scrollTop <= navHeight && (
        e.key === 'ArrowUp' || 
        e.key === 'PageUp' || 
        e.key === 'Home' ||
        e.key === ' '
      )) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners with passive: false to allow preventDefault
    window.addEventListener('scroll', handleScroll, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null; // This component doesn't render anything
} 