import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Next.js looks in the src directory
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

export default nextConfig;
