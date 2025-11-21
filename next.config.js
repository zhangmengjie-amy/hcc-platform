/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  transpilePackages: ["antd", "d3", "phylotree", "@ant-design"],
  swcMinify: true,
  experimental: {
    esmExternals: "loose",
    forceSwcTransforms: true,
  },
  compiler: {
    styledComponents: true,
    reactRemoveProperties: true,
    removeConsole: process.env.NODE_ENV === "production",
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
  i18n: {
    locales: ["en", "zh"],
    defaultLocale: "en",
    localeDetection: false,
  },
  reactStrictMode: false,
  compiler: {
    styledComponents: true, 
    reactRemoveProperties: true,
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;