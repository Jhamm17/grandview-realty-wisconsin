import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    experimental: {
        optimizeCss: true
    },
    images: {
        // Disable Vercel image optimization to avoid using free plan quota
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/**',
            }
        ],
        // Keep minimal config for any remaining next/image usage (static assets only)
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    // Video optimization headers
    async headers() {
        return [
            {
                source: '/(.*)\\.mp4',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                    {
                        key: 'Accept-Ranges',
                        value: 'bytes',
                    },
                ],
            },
        ];
    },
};

export default nextConfig; 