/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static page generation and prefetching
  experimental: {
    optimizePackageImports: ['connectkit', 'wagmi'],
  },
  // Optimize compilation
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'cdn.builder.io' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.larvalabs.com' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'cloudflare-ipfs.com' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'gateway.pinata.cloud' },
      { protocol: 'https', hostname: 'dweb.link' },
      { protocol: 'https', hostname: 'peach-impossible-chicken-451.mypinata.cloud' },
    ],
    unoptimized: false,
  },
  webpack: (config, { isServer, webpack }) => {
    // ConnectKit webpack config
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false 
    };
    
    // Ignore optional Solana/Coinbase dependencies that aren't needed for Ethereum-only
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^bs58$/,
        contextRegExp: /@coinbase\/cdp-sdk/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@solana\/kit$/,
        contextRegExp: /@solana-program/,
      })
    );
    
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

