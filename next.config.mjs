/** @type {import('next').NextConfig} */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const path = require("path");
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
    sassOptions: {
        includePaths: [path.join(__dirname, "styles")],
    },
    transpilePackages: ['antd', 'd3', 'phylotree', '@ant-design'], // 显式转换特定包
    swcMinify: true,
    experimental: {
        esmExternals: 'loose'
    },
    compiler: {
        styledComponents: true,
        reactRemoveProperties: true,
        removeConsole: process.env.NODE_ENV === 'production',
    },
    webpack: (config) => {
        // 添加 fs 模块的忽略
        config.resolve.fallback = {
            fs: false,
            // 其他需要忽略的模块
        };

        return config;
    },
    i18n: {
        locales: ['en', 'zh'], // 支持的语言
        defaultLocale: 'en',   // 默认语言
        localeDetection: false
    },
    reactStrictMode: false,
    rewrites: async () => {
        return [
            {
                source: "/api/auth/:path*",
                destination: `/api/auth/:path*`,
            }
        ];
    },
    compiler:{
        styledComponents: true,
        reactRemoveProperties: true,
        removeConsole:process.env.NODE_ENV === 'production'
    }
};

export default nextConfig;
