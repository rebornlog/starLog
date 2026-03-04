/** @type {import("nextra/site-metadata").SiteMetadata} */
const siteMetadata = {
  title: 'starLog - 个人知识库',
  author: 'musk',
  headerTitle: 'starLog',
  description: 'musk 的个人知识库 - 技术文章、金融分析、项目文档',
  language: 'zh-CN',
  theme: 'system',
  siteUrl: 'https://starlog.dev',
  siteRepo: 'https://github.com/rebornlog/starLog',
  siteLogo: '/static/images/logo.png',
  socialBanner: '/static/images/twitter-card.png',
  email: '944183654@qq.com',
  github: 'https://github.com/rebornlog',
  twitter: 'https://twitter.com',
  facebook: '',
  youtube: '',
  linkedin: '',
  threads: '',
  instagram: '',
  locale: 'zh-CN',
  analytics: {
    umamiAnalytics: {
      umamiWebsiteId: '',
    },
    plausibleAnalytics: {
      plausibleDataDomain: '',
    },
    simpleAnalytics: {
      enabled: false,
      customDomain: '',
    },
    googleAnalytics: {
      googleAnalyticsId: '',
    },
    posthogAnalytics: {
      posthogProjectApiKey: '',
    },
    microAnalytics: {
      microAnalyticsId: '',
    },
    matomoAnalytics: {
      matomoSiteId: '',
      matomoUrl: '',
    },
  },
  newsletter: {
    provider: 'none',
  },
  comments: {
    provider: 'giscus',
    giscusConfig: {
      repo: 'rebornlog/starLog',
      repositoryId: '',
      category: 'Announcements',
      categoryId: '',
      mapping: 'pathname',
      reactions: '1',
      metadata: '6',
      theme: 'light',
      darkTheme: 'transparent_dark',
      themeURL: '',
      lang: 'zh-CN',
    },
  },
  search: {
    provider: 'kbar',
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`,
    },
  },
}

module.exports = siteMetadata
