const { withContentlayer } = require('next-contentlayer2')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 图片优化配置
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    // 远程图片域名（CDN）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.starlog.com',
      },
    ],
  },
  
  // 压缩配置
  compress: true,
  
  // 生产环境配置
  productionBrowserSourceMaps: false,
  
  // 静态页面生成
  trailingSlash: true,
  
  // 性能优化
  poweredByHeader: false,
  
  // 缓存配置
  headers: async () => [
    {
      // 静态资源：长期缓存（1 年）
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      // 图片资源：长期缓存
      source: '/_next/image',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      // API 响应：短期缓存
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      ],
    },
  ],
}

module.exports = withBundleAnalyzer(
  withContentlayer({
    ...nextConfig,
    async headers() {
      return [
        {
          source: '/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/_next/image',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
            },
          ],
        },
      ]
    },
  })
)
