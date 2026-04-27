/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Set basePath if deploying to a GitHub Pages subdirectory
  // basePath: '/SchoolDocGenie',
  // assetPrefix: '/SchoolDocGenie/',
};

module.exports = nextConfig;
