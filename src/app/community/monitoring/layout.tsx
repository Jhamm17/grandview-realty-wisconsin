'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MonitoringLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Dashboard', href: '/community/monitoring' },
        { name: 'API Test', href: '/community/monitoring/test' },
    ];

    return (
        <div className="container mx-auto px-4">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`
                                    py-4 px-1 border-b-2 font-medium text-sm
                                    ${isActive 
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            {children}
        </div>
    );
} 