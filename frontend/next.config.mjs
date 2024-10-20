/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3002/:path*", // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
