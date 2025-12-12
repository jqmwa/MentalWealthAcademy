/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'i.imgur.com',
      'cdn.builder.io',
      'via.placeholder.com',
      'images.unsplash.com',
      'www.larvalabs.com',
      'i.pinimg.com',
      'api.dicebear.com',
    ],
    unoptimized: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.glsl$/,
        use: 'raw-loader',
      });
    }
    return config;
  },
}

module.exports = nextConfig

