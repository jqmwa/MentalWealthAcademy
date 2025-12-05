/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.imgur.com', 'cdn.builder.io'],
    unoptimized: false,
  },
}

module.exports = nextConfig

