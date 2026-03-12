#!/usr/bin/env node
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.SITE_URL || 'http://47.79.20.10:3000';
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/tmp/website-screenshots';

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pages = [
  { path: '/', name: '01-homepage' },
  { path: '/blog/', name: '02-blog' },
  { path: '/zodiac/', name: '03-zodiac' },
  { path: '/iching/', name: '04-iching' },
  { path: '/diet/', name: '05-diet' },
  { path: '/stocks/', name: '06-stocks' },
  { path: '/tags/', name: '07-tags' },
  { path: '/projects/', name: '08-projects' },
  { path: '/about/', name: '09-about' },
  { path: '/favorites/', name: '10-favorites' },
  { path: '/timeline/', name: '11-timeline' },
];

async function screenshot() {
  console.log('🚀 开始网站截图...\n');
  console.log(`📍 目标网站：${BASE_URL}`);
  console.log(`📁 输出目录：${OUTPUT_DIR}\n`);
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    outputDir: OUTPUT_DIR,
    pages: [],
    errors: []
  };
  
  for (const pageConfig of pages) {
    console.log(`📄 ${pageConfig.name}`);
    
    try {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // 收集错误
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // 访问页面
      const url = BASE_URL + pageConfig.path;
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // 截图
      const screenshotPath = path.join(OUTPUT_DIR, `${pageConfig.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      // 获取页面信息
      const title = await page.title();
      
      results.pages.push({
        name: pageConfig.name,
        path: pageConfig.path,
        url: url,
        status: response.status(),
        title: title,
        screenshot: screenshotPath,
        errors: errors.length
      });
      
      console.log(`  ✅ 状态：${response.status()}`);
      console.log(`  📸 截图：${screenshotPath}`);
      if (errors.length > 0) {
        console.log(`  ⚠️  错误：${errors.length}`);
      }
      console.log('');
      
      await page.close();
      
    } catch (error) {
      console.log(`  ❌ 错误：${error.message}\n`);
      results.errors.push({
        page: pageConfig.name,
        error: error.message
      });
    }
  }
  
  await browser.close();
  
  // 保存报告
  const reportPath = path.join(OUTPUT_DIR, 'screenshot-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log('=================================');
  console.log('✅ 截图完成！');
  console.log('=================================');
  console.log(`📊 总页面：${pages.length}`);
  console.log(`✅ 成功：${results.pages.length}`);
  console.log(`❌ 失败：${results.errors.length}`);
  console.log(`📄 报告文件：${reportPath}`);
  console.log('');
}

screenshot().catch(e => {
  console.error('❌ 错误:', e.message);
  process.exit(1);
});
