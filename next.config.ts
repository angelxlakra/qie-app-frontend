import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Webpack configuration for production builds
  webpack: (config) => {
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      "@react-native-async-storage/async-storage"
    );
    return config;
  },
};

export default nextConfig;
