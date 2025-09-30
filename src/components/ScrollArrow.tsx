'use client';

export default function ScrollArrow() {
  const handleScroll = () => {
    const buySellSection = document.getElementById('buy-sell-section');
    if (buySellSection) {
      buySellSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute left-8 bottom-8 z-10 animate-bounce">
      <button 
        onClick={handleScroll}
        className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors cursor-pointer group"
      >
        <svg 
          className="w-8 h-8 group-hover:scale-110 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
        <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Scroll
        </span>
      </button>
    </div>
  );
} 