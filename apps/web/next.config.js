/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@repo/shared-helpers', '@repo/auth'],
};

export default nextConfig;
