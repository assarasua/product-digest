import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx"],
  outputFileTracingRoot: __dirname,
  experimental: {
    cpus: 1,
    webpackBuildWorker: false,
    serverMinification: false
  },
  webpack: (config, { dev }) => {
    if (!dev && config.optimization) {
      config.optimization.minimize = false;
    }
    return config;
  }
};

export default nextConfig;
