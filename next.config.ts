import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // React Compiler — moved to top-level in Next.js 16
  reactCompiler: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ecommerce.routemisr.com" },
      { protocol: "https", hostname: "route-academy-api.herokuapp.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
