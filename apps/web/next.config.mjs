import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
      },
    ],
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      os: false,
      path: false,
      crypto: false,
    };
    
    // Add webpack aliases for ox modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'ox/BlockOverrides': path.resolve(__dirname, 'node_modules/ox/BlockOverrides'),
      'ox/AbiConstructor': path.resolve(__dirname, 'node_modules/ox/AbiConstructor'),
      'ox/AbiFunction': path.resolve(__dirname, 'node_modules/ox/AbiFunction'),
      'ox/AbiEvent': path.resolve(__dirname, 'node_modules/ox/AbiEvent'),
      'ox/AbiError': path.resolve(__dirname, 'node_modules/ox/AbiError'),
      'ox/Hex': path.resolve(__dirname, 'node_modules/ox/Hex'),
      'ox/Address': path.resolve(__dirname, 'node_modules/ox/Address'),
    };
    
    return config;
  },
}

export default nextConfig; 