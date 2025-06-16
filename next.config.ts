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
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    }
};

export default nextConfig;
