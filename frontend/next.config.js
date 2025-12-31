/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable image optimization for build
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
