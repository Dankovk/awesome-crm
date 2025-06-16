import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        domains: ['avatars.githubusercontent.com'],
    },
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    }
};

export default nextConfig;
