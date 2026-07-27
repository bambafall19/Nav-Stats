/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dcvxkacmkovqhsrfbdhe.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'date-fns'],
  },
};

module.exports = nextConfig;
