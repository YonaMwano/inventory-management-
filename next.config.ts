import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server external packages for Node-only modules on Vercel
  serverExternalPackages: ["pg"],
};

export default nextConfig;
