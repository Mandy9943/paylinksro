import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Adjust to your R2 public domain if you use a custom one
      { protocol: "https", hostname: "*assets.paylinks.ro" },
      { protocol: "https", hostname: "*.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;
