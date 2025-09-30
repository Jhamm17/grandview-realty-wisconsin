import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.mlsgrid.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.mred.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'photos.mred.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/images/**',
            },
            {
                protocol: 'https',
                hostname: 'grandview-realty.jphamm2001.workers.dev',
                pathname: '/proxy/**',
            }
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp'],
        minimumCacheTTL: 3600, // 1 hour minimum cache
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    experimental: {
        optimizeCss: true
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