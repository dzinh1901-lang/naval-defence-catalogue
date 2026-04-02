import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  // Transpile workspace packages
  transpilePackages: ['@naval/domain', '@naval/ui'],

  experimental: {
    // Use React 19 features
    reactCompiler: false,
  },
};

export default nextConfig;
