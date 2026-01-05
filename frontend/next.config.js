/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force static export to avoid SSR issues
  output: 'export',
  // Disable image optimization for build
  images: {
    unoptimized: true,
  },
  // Force dynamic rendering for all pages
  experimental: {
    forceSwcTransforms: true,
  },
  // Disable static generation for 404 page
  trailingSlash: true,
};

module.exports = nextConfig;
