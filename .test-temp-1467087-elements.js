const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // 设置超时
        page.setDefaultTimeout(10000);
        
        // 访问页面
        await page.goto(process.argv[2], { waitUntil: 'networkidle' });
        
        // 检查 Console 错误
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // 检查 Network 错误
        const networkErrors = [];
        page.on('response', response => {
            if (response.status() >= 400) {
                networkErrors.push(`${response.url()} - ${response.status()}`);
            }
        });
        
        // 等待页面稳定
        await page.waitForTimeout(3000);
        
        // 检查关键元素
        const hasMainContent = await page.$('main') || await page.$('#__next') || await page.$('body');
        const hasNavigation = await page.$('nav') || await page.$('[role="navigation"]');
        
        // 截图
        const screenshot = `/tmp/auto-test-e2e/screenshot-${Date.now()}.png`;
        await page.screenshot({ path: screenshot, fullPage: true });
        
        // 输出结果
        const result = {
            url: process.argv[2],
            consoleErrors: consoleErrors,
            networkErrors: networkErrors,
            hasMainContent: !!hasMainContent,
            hasNavigation: !!hasNavigation,
            screenshot: screenshot,
            timestamp: new Date().toISOString()
        };
        
        console.log(JSON.stringify(result));
        
    } catch (error) {
        console.error(JSON.stringify({ error: error.message, url: process.argv[2] }));
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
