
import type {NextConfig} from 'next';
require('dotenv').config()

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd112y698adiu2z.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'remotive.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'univault.live',
        port: '',
        pathname: '/**',
      }
    ],
  },
  serverExternalPackages: ['pdf-parse'],
  async rewrites() {
    const agentId = "APscETS6hFlXjiPna6p-o";
    return [
      {
        source: "/help",
        destination: `https://chatbase.co/${agentId}/help`,
      },
      {
        source: "/help/:path*",
        destination: `https://chatbase.co/${agentId}/help/:path*`,
      },
      {
        source: "/__cb/:path*",
        destination: "https://chatbase.co/__cb/:path*",
      },
      {
        source: `/api/chat/${agentId}/:path*`,
        destination: `https://chatbase.co/api/chat/${agentId}/:path*`,
      },
    ];
  },
};

export default nextConfig;
