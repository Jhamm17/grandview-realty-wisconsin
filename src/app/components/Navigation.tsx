'use client';

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Add CSS animations for dropdown menu
const dropdownStyles = `
  @keyframes slideInFromTop {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

function NavDropdown({ title, items }: { title: string; items: { name: string; href: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Inject CSS animations
  useEffect(() => {
    if (!document.getElementById('dropdown-styles')) {
      const style = document.createElement('style');
      style.id = 'dropdown-styles';
      style.textContent = dropdownStyles;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Check if any dropdown item is active
  const isActive = items.some(item => pathname === item.href);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className={`flex items-center text-white hover:text-white/80 transition-all duration-200 py-4 px-2 text-base font-medium relative ${
          isActive ? 'text-[#60a5fa]' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        {title}
        <svg 
          className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* Dropdown Menu with Smooth Animations */}
      <div 
        className={`absolute left-0 mt-2 w-48 bg-[#081d36] rounded-md shadow-xl py-1 z-50 transition-all duration-300 ease-in-out transform origin-top backdrop-blur-sm border border-white/10 ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 text-sm text-white hover:bg-white/10 transition-all duration-200 ease-out transform hover:translate-x-1 ${
              pathname === item.href ? 'text-[#60a5fa] bg-white/5' : ''
            }`}
            style={{
              animationDelay: isOpen ? `${index * 50}ms` : '0ms',
              animation: isOpen ? 'slideInFromTop 0.3s ease-out forwards' : 'none'
            }}
            onClick={() => setIsOpen(false)}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  
  const navItems = {
    properties: [
      { name: "Active Listings", href: "/properties" },
      { name: "Under Contract", href: "/properties/under-contract" },
    ],
    team: [
      { name: "Agents", href: "/team/agents" },
              { name: "Office Personnel", href: "/team/office-staff" },
    ],
    about: [
      { name: "Affiliations & Accreditation", href: "/about/affiliations" },
      { name: "Legal & Compliance", href: "/about/legal" },
    ],
    contact: [
      { name: "General Inquiry", href: "/contact/general-inquiry" },
      { name: "Looking to Buy", href: "/contact/looking-to-buy" },
      { name: "Looking to Sell", href: "/contact/looking-to-sell" },
      { name: "Home Evaluation", href: "/contact/home-evaluation" },
    ],
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="bg-[#081d36] shadow-sm sticky top-0 z-50">
      <nav className="w-full px-[10%]">
        <div className="flex items-center justify-between h-24">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="Grandview Realty"
              width={1200}
              height={300}
              className="h-28 w-auto"
              priority
            />
            <span className="sr-only">Grandview Realty</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              href="/" 
              className={`text-white hover:text-white/80 transition-colors text-base font-medium py-4 px-2 ${
                pathname === '/' ? 'text-[#60a5fa]' : ''
              }`}
            >
              Home
            </Link>
            <NavDropdown title="Properties" items={navItems.properties} />
            <NavDropdown title="Team" items={navItems.team} />
            <NavDropdown title="About Us" items={navItems.about} />
            <Link 
              href="/careers" 
              className={`text-white hover:text-white/80 transition-colors text-base font-medium py-4 px-2 ${
                pathname === '/careers' ? 'text-[#60a5fa]' : ''
              }`}
            >
              Careers
            </Link>
            <NavDropdown title="Contact" items={navItems.contact} />
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 mobile-menu-button text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 mobile-menu bg-[#081d36]">
            <div className="flex flex-col space-y-2 text-base">
              <Link 
                href="/" 
                className={`text-white hover:text-white/80 transition-colors py-2 px-3 rounded ${
                  pathname === '/' ? 'text-[#60a5fa]' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              {/* Properties, Team, About dropdowns */}
              {Object.entries(navItems).filter(([key]) => key !== 'contact' && key !== 'community').map(([key, items]) => (
                <div key={key} className="space-y-1">
                  <button
                    className="font-medium text-white flex items-center justify-between w-full text-base py-2 px-3 rounded"
                    onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === key ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === key && (
                    <div className="pl-4 space-y-1">
                      {items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block text-white/90 hover:text-white transition-colors text-sm py-2 px-3 rounded ${
                            pathname === item.href ? 'text-[#60a5fa]' : ''
                          }`}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setActiveDropdown(null);
                          }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Careers link */}
              <Link 
                href="/careers" 
                className={`text-white hover:text-white/80 transition-colors text-base py-2 px-3 rounded ${
                  pathname === '/careers' ? 'text-[#60a5fa]' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Careers
              </Link>
              {/* Contact dropdown */}
              {Object.entries(navItems).filter(([key]) => key === 'contact').map(([key, items]) => (
                <div key={key} className="space-y-1">
                  <button
                    className="font-medium text-white flex items-center justify-between w-full text-base py-2 px-3 rounded"
                    onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === key ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === key && (
                    <div className="pl-4 space-y-1">
                      {items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block text-white/90 hover:text-white transition-colors text-sm py-2 px-3 rounded ${
                            pathname === item.href ? 'text-[#60a5fa]' : ''
                          }`}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setActiveDropdown(null);
                          }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#081d36] text-white">
      <div className="container-padding py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Logo and Address */}
          <div className="lg:col-span-2 text-center lg:text-left">
            <div className="mb-6 md:mb-8">
              <Image
                src="/logo.png"
                alt="Grandview Realty"
                width={300}
                height={75}
                className="h-24 md:h-32 w-auto mx-auto lg:mx-0"
              />
            </div>
            <p className="text-white/80 mb-4 text-base md:text-lg max-w-xs md:max-w-sm mx-auto lg:mx-0 text-center lg:text-left">
              Your trusted real estate partner across Wisconsin.
            </p>
            <div className="text-white/80 text-base md:text-lg">
              <p>Serving Wisconsin Communities</p>
              <p>Milwaukee • Madison • Green Bay • Kenosha</p>
            </div>
          </div>

          {/* Quick Links and Legal - More Spaced Out */}
          <div className="grid grid-cols-2 gap-8 md:gap-12 lg:col-span-2">
            {/* Quick Navigation */}
            <div className="text-center lg:text-left">
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <div className="flex flex-col space-y-2">
                <Link href="/" className="text-white/80 hover:text-[#60a5fa] transition-colors text-sm">Home</Link>
                <Link href="/properties" className="text-white/80 hover:text-[#60a5fa] transition-colors text-sm">Active Listings</Link>
                <Link href="/properties/under-contract" className="text-white/80 hover:text-[#60a5fa] transition-colors text-sm">Under Contract</Link>
                <Link href="/team/agents" className="text-white/80 hover:text-[#60a5fa] transition-colors text-sm">Agents</Link>
                <Link href="/team/office-staff" className="text-white/80 hover:text-[#60a5fa] transition-colors text-sm">Office Personnel</Link>
                <Link href="/contact" className="text-white/80 hover:text-[#60a5fa] transition-colors text-sm">Contact</Link>
              </div>
            </div>

            {/* Legal */}
            <div className="text-center lg:text-left">
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <div className="flex flex-col space-y-2">
                <Link href="/about/legal/privacy" className="text-white/80 hover:text-[#60a5fa] transition-colors text-sm">Privacy Policy</Link>
                <Link href="/about/legal/fair-housing" className="text-white/80 hover:text-[#60a5fa] transition-colors text-sm">Fair Housing</Link>
              </div>
            </div>

          </div>
        </div>
        
        {/* BBB and Social Media - Bottom Right Corner */}
        <div className="mt-8 md:mt-12 flex justify-end items-center space-x-6">
          {/* BBB Accreditation */}
          <div>
            <a 
              href="https://www.bbb.org/us/wi/milwaukee/profile/real-estate-broker/grandview-realty-wisconsin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <Image
                src="/bbb-seal.png"
                alt="BBB Accredited Business"
                width={80}
                height={80}
                className="h-12 md:h-16 w-auto"
              />
            </a>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-3">
            <a 
              href="https://www.facebook.com/GrandviewRealtyWisconsin/" 
              className="text-white/80 hover:text-[#60a5fa] transition-colors" 
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="h-6 w-6 md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a 
              href="https://www.instagram.com/grandviewrealtywisconsin/" 
              className="text-white/80 hover:text-[#60a5fa] transition-colors" 
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="h-6 w-6 md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/20 text-center text-white/60">
          <p className="text-sm md:text-base">&copy; 2025 Grandview Realty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 