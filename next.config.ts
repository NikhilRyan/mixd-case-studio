import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Covers the 12 MB artwork ceiling plus multipart request overhead.
      bodySizeLimit: "13mb",
    },
  },
};

export default nextConfig;
