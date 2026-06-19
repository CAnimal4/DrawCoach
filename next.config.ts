import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  ...(isGitHubPages
    ? {
        assetPrefix: "/DrawCoach",
        basePath: "/DrawCoach",
      }
    : {}),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

