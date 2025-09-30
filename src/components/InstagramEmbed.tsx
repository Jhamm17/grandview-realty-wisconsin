'use client';

import { useEffect, useRef } from 'react';

interface InstagramEmbedProps {
  className?: string;
  title?: string;
  description?: string;
  showHeader?: boolean;
}

export default function InstagramEmbed({ 
  className = '', 
  title = 'Follow Us on Instagram',
  description = 'Stay connected with Grandview Realty',
  showHeader = true 
}: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Juicer embed script
    const script = document.createElement('script');
    script.src = 'https://www.juicer.io/embed/grandviewrealtygeneva/embed-code.js';
    script.async = true;
    script.defer = true;
    
    // Append script to document
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className={className}>
      {showHeader && (
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      )}
      
      {/* Juicer Feed Container */}
      <div 
        ref={containerRef}
        className="max-w-4xl mx-auto"
        id="juicer-feed"
      >
        {/* Juicer will inject the feed here */}
      </div>
    </div>
  );
} 