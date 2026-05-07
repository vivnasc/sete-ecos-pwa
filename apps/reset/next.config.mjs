/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Força bundle único · sem chunks por rota
  webpack(config, { isServer }) {
    if (!isServer) {
      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
          defaultVendors: false
        }
      }
      config.optimization.runtimeChunk = false
    }
    return config
  }
}

export default nextConfig
