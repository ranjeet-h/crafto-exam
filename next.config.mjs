/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.crafto.app',
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
