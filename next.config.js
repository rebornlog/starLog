const { withContentlayer } = require('next-contentlayer2')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// API 代理配置 - 顶层定义，确保生效（排除 Next.js 原生 API 路由）
async function rewrites() {
  return [
    {
      source: '/api/search/:path*',
      destination: '/api/search/:path*',
    },
    {
      source: '/api/posts/:path*',
      destination: '/api/posts/:path*',
    },
    {
      source: '/api/stocks/:path*',
      destination: 'http://localhost:8081/api/stocks/:path*',
    },
    {
      source: '/api/funds/:path*',
      destination: 'http://localhost:8082/api/funds/:path*',  // 基金 API 在 8082 端口
    },
    {
      source: '/api/market/:path*',
      destination: 'http://localhost:8081/api/market/:path*',
    },
  ]
}

// Headers 配置
async function headers() {
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
      source: '/api/posts/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=900',
        },
      ],
    },
    {
      source: '/api/search/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
        },
      ],
    },
    {
      source: '/api/stocks/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=60, s-maxage=120, stale-while-revalidate=180',
        },
      ],
    },
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=120, s-maxage=300, stale-while-revalidate=600',
        },
      ],
    },
  ]
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 顶层 rewrites 配置 - 确保在包装器外部生效
  rewrites,
  headers,
  
  // 图片优化配置
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
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
}

module.exports = withBundleAnalyzer(
  withContentlayer(nextConfig)
)
