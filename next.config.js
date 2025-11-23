/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Required for pdfjs-dist to work properly
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig
