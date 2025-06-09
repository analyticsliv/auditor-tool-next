/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // Add Google as a trusted domain
  },
};

export default nextConfig;  