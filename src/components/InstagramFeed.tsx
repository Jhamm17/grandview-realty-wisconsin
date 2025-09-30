'use client';

interface InstagramFeedProps {
  className?: string;
}

export default function InstagramFeed({ className = '' }: InstagramFeedProps) {
  return (
    <div className={`juicer-feed ${className}`}>
      <iframe 
        src="https://www.juicer.io/api/feeds/grandviewrealtygeneva/iframe" 
        frameBorder="0" 
        width="100%" 
        height="800" 
        style={{
          display: 'block',
          margin: '0 auto',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
        title="Grandview Realty Instagram Feed"
      />
    </div>
  );
} 