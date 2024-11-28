/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_BUILD_SERVER_URL: process.env.BUILD_SERVER_URL || '',
        NEXT_PUBLIC_CLIENT_SERVER_URL: process.env.CLIENT_SERVER_URL || '',
    },
};

export default nextConfig;