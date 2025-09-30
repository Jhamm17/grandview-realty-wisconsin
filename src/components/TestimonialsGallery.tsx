'use client';

import { useState, useRef, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    quote: "Their team genuinely enjoyed and appreciated my one of a kind house... Not only were the agents knowledgeable about the mechanics and design of the house, they were patient and perseverant, employing various sales tactics. Additionally, I had an absolutely amazing video of the house which really advertised its one of a kind features and amazing architectural structure.",
    author: "Kristina R.",
    role: "Satisfied Seller",
    initial: "K"
  },
  {
    id: 2,
    quote: "As a seller, if you want a team who is willing to put the time and effort into really knowing your house, especially if you have a difficult house to sell, Grandview Realty is the company to use!",
    author: "Chris P.",
    role: "Happy Seller",
    initial: "C"
  },
  {
    id: 3,
    quote: "We experienced the utmost professionalism, upfront communication, honesty and integrity throughout the entire process. We highly recommend the services of the team at Grandview Realty!",
    author: "Edward G.",
    role: "Delighted Client",
    initial: "E"
  }
];

export default function TestimonialsGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const nextTestimonial = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevTestimonial = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToTestimonial = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStartX(touch.clientX);
    setDragCurrentX(touch.clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const offset = currentX - dragStartX;
    
    setDragCurrentX(currentX);
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50; // Minimum distance to trigger swipe
    const offset = dragCurrentX - dragStartX;
    
    if (Math.abs(offset) > threshold) {
      if (offset > 0) {
        // Swiped right - go to previous
        prevTestimonial();
      } else {
        // Swiped left - go to next
        nextTestimonial();
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  // Prevent default touch behaviors during drag
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefault = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', preventDefault, { passive: false });
    
    return () => {
      container.removeEventListener('touchmove', preventDefault);
    };
  }, [isDragging]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Main Testimonial Content - Touch Enabled */}
      <div 
        ref={containerRef}
        className={`text-center transition-all duration-500 ease-in-out cursor-grab active:cursor-grabbing ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{
          transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
          transition: isDragging ? 'none' : 'all 0.5s ease-in-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Quote Text */}
        <div className="mb-12">
          <p className="text-white leading-relaxed italic text-lg md:text-xl lg:text-2xl font-medium max-w-3xl mx-auto">
            &ldquo;{currentTestimonial.quote}&rdquo;
          </p>
        </div>
        
        {/* Author Info */}
        <div className="text-center">
          <p className="font-bold text-white text-xl mb-1">{currentTestimonial.author}</p>
          <p className="text-white/80 font-medium">{currentTestimonial.role}</p>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on Mobile */}
      <button
        onClick={prevTestimonial}
        className="hidden md:flex absolute left-8 top-1/3 -translate-y-1/2 w-12 h-12 items-center justify-center hover:opacity-80 transition-all duration-200 z-10"
        aria-label="Previous testimonial"
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextTestimonial}
        className="hidden md:flex absolute right-8 top-1/3 -translate-y-1/2 w-12 h-12 items-center justify-center hover:opacity-80 transition-all duration-200 z-10"
        aria-label="Next testimonial"
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator - More prominent on mobile */}
      <div className="flex justify-center mt-8 space-x-3">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToTestimonial(index)}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-200 ${
              index === currentIndex ? 'bg-white shadow-lg' : 'bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 