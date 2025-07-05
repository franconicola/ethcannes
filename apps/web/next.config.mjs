/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Required for Cloudflare
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
        protocol: 'https',

      },
    ],
  },
}

// Suppress unhandled rejection warnings
if (typeof process !== 'undefined') {
  process.on('unhandledRejection', (reason, promise) => {
    if (reason && reason.message && reason.message.includes('Incompatible React versions')) {
      // Ignore React version mismatch errors during build
      return;
    }
    // Re-throw other unhandled rejections
    throw reason;
  });
}

export default nextConfig; 