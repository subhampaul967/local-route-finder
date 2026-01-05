/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal config to avoid SSR issues
  images: {
    unoptimized: true,
  },
  // Disable trailing slash to avoid conflicts
  trailingSlash: false,
};

module.exports = nextConfig;
