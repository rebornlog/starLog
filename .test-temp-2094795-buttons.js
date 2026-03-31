const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(process.argv[2], { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 查找所有可点击元素（按钮、链接、卡片等）
        const clickables = await page.$$(
            'button, [role="button"], input[type="button"], input[type="submit"], ' +
            'a[href], [onclick], .cursor-pointer, [tabindex="0"], ' +
            '.clickable, [role="link"], [role="menuitem"]'
        );
        const results = [];
        const testedUrls = new Set(); // 避免重复测试相同 URL
        
        for (let i = 0; i < clickables.length; i++) {
            const clickable = clickables[i];
            try {
                const text = await clickable.textContent();
                const isVisible = await clickable.isVisible();
                const isDisabled = await clickable.isDisabled();
                const tagName = await clickable.evaluate(el => el.tagName.toLowerCase());
                
                // 只测试可见且未禁用的元素
                if (isVisible && !isDisabled) {
                    // 获取元素位置，避免重复点击重叠元素
                    const box = await clickable.boundingBox();
                    if (!box) continue;
                    
                    const key = `${Math.round(box.x)},${Math.round(box.y)}`;
                    if (testedUrls.has(key)) continue; // 跳过重叠元素
                    testedUrls.add(key);
                    
                    // 滚动到元素位置
                    await clickable.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(200);
                    
                    // 点击元素
                    await clickable.click({ timeout: 5000, force: true });
                    await page.waitForTimeout(1500); // 等待反应
                    
                    // 检查是否有错误
                    const hasError = await page.$('.error, [role="alert"], .toast-error');
                    const currentUrl = page.url();
                    
                    results.push({
                        index: i,
                        tagName: tagName,
                        text: text?.trim().substring(0, 50) || 'unnamed',
                        clicked: true,
                        hasError: !!hasError,
                        navigated: currentUrl !== process.argv[2],
                        url: currentUrl
                    });
                }
            } catch (error) {
                // 忽略超时等错误，继续测试下一个
                results.push({
                    index: i,
                    error: error.message.substring(0, 100)
                });
            }
        }
        
        console.log(JSON.stringify({ buttons: results, total: clickables.length, tested: results.length }));
        
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
