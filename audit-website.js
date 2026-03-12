const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://47.79.20.10:3000';
const OUTPUT_DIR = '/tmp/website-audit';

// 创建输出目录
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

const report = {
  timestamp: new Date().toISOString(),
  pages: [],
  errors: []
};

(async () => {
  console.log('🚀 开始网站审计和截图...\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  
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
      
      report.pages.push({
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
      report.errors.push({
        page: pageConfig.name,
        error: error.message
      });
    }
  }
  
  await browser.close();
  
  // 保存报告
  const reportPath = path.join(OUTPUT_DIR, 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('=================================');
  console.log('✅ 审计完成！');
  console.log('=================================');
  console.log(`📊 总页面：${pages.length}`);
  console.log(`✅ 成功：${report.pages.length}`);
  console.log(`❌ 失败：${report.errors.length}`);
  console.log(`📁 截图目录：${OUTPUT_DIR}`);
  console.log(`📄 报告文件：${reportPath}`);
  console.log('');
})();
