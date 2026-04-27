/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: '/ALMWork',
  assetPrefix: '/ALMWork/',
};

module.exports = nextConfig;
