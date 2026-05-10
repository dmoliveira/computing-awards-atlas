import type { NextConfig } from "next";

const repoBasePath = process.env.PAGES_BASE_PATH ?? "";
const isStaticExport = process.env.GITHUB_ACTIONS === "true" || process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: isStaticExport ? repoBasePath : "",
  assetPrefix: isStaticExport && repoBasePath ? `${repoBasePath}/` : undefined,
};

export default nextConfig;
