/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'grandview-realty.jphamm2001.workers.dev',
                pathname: '/proxy/**',
            },
            {
                protocol: 'https',
                hostname: 's3.amazonaws.com',
                pathname: '/mlsgrid/images/**',
            },
        ],
    },
};

export default nextConfig; 