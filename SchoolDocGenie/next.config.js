/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to support API routes with Firebase backend
  // Now requires Node.js hosting (Vercel, Netlify, or Docker)
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
