'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Navigation';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on charity page since it has its own footer
  if (pathname === '/community/charity') {
    return null;
  }
  
  return <Footer />;
} 