const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    console.log('🚀 启动浏览器...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // 设置视口
    await page.setViewport({ width: 1280, height: 720 });

    console.log('📖 访问问卦页面...');
    await page.goto('http://localhost:3000/iching', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 截图
    await page.screenshot({ path: '/tmp/iching-page.png', fullPage: true });
    console.log('✅ 页面截图已保存：/tmp/iching-page.png');

    // 检查页面标题
    const title = await page.title();
    console.log(`📋 页面标题：${title}`);

    // 检查问卦指引是否存在
    const guideExists = await page.$eval('[class*="DivinationGuide"], [class*="divination-guide"]', 
      el => el ? true : false).catch(() => false);
    console.log(`✅ 问卦指引组件：${guideExists ? '存在' : '未找到'}`);

    // 检查起卦方式按钮
    const methodButtons = await page.$$('button');
    const methodTexts = await Promise.all(
      methodButtons.map(btn => btn.evaluate(el => el.textContent?.trim()))
    );
    const hasRandom = methodTexts.some(t => t?.includes('随机'));
    const hasTime = methodTexts.some(t => t?.includes('时间'));
    const hasNumber = methodTexts.some(t => t?.includes('数字'));
    console.log(`✅ 随机起卦按钮：${hasRandom ? '存在' : '未找到'}`);
    console.log(`✅ 时间起卦按钮：${hasTime ? '存在' : '未找到'}`);
    console.log(`✅ 数字起卦按钮：${hasNumber ? '存在' : '未找到'}`);

    // 检查五行属性
    const fiveElements = await page.$eval('[class*="FiveElements"], [class*="five-elements"], [class*="五行"]',
      el => el ? true : false).catch(() => false);
    console.log(`✅ 五行属性展示：${fiveElements ? '存在' : '未找到'}`);

    // 检查选项卡
    const tabs = await page.$$('[role="tab"], button[class*="tab"]');
    console.log(`✅ 选项卡数量：${tabs.length}`);

    // 测试随机起卦
    console.log('\n🎲 测试随机起卦...');
    if (hasRandom) {
      const randomBtn = await page.$('button');
      for (const btn of await page.$$('button')) {
        const text = await btn.evaluate(el => el.textContent?.trim());
        if (text?.includes('随机')) {
          await btn.click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }

    // 等待并检查是否有结果
    await page.waitForTimeout(3000);
    
    // 检查是否有卦象结果
    const resultExists = await page.$eval('[class*="Hexagram"], [class*="hexagram"], [class*="卦象"]',
      el => el ? true : false).catch(() => false);
    console.log(`✅ 卦象结果展示：${resultExists ? '存在' : '未找到'}`);

    // 再次截图
    await page.screenshot({ path: '/tmp/iching-result.png', fullPage: true });
    console.log('✅ 结果截图已保存：/tmp/iching-result.png');

    // 检查历史记录链接
    const historyLink = await page.$eval('a[href*="history"]', 
      el => el ? el.textContent?.trim() : null).catch(() => null);
    console.log(`✅ 历史记录链接：${historyLink || '未找到'}`);

    console.log('\n✅ 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
