#!/usr/bin/env node

/**
 * 使用 Puppeteer 无头浏览器测试问卦功能
 */

const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 启动无头浏览器...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 设置 Console 监听
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // 设置错误监听
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });
    
    console.log('📄 测试 1: 访问问卦页面');
    await page.goto('http://localhost:3000/iching/', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    const title = await page.title();
    console.log(`   页面标题：${title}`);
    
    const content = await page.content();
    if (content.includes('易经问卦')) {
      console.log('   ✅ 页面加载正常\n');
    } else {
      console.log('   ❌ 页面内容异常\n');
    }
    
    console.log('🔍 测试 2: 检查起卦按钮');
    const buttons = await page.$$('button');
    console.log(`   找到 ${buttons.length} 个按钮`);
    
    // 查找"时间起卦"按钮
    const timeButton = await page.$('button::-p-text(时间起卦)');
    if (timeButton) {
      console.log('   ✅ 找到"时间起卦"按钮\n');
      
      console.log('⚡ 测试 3: 点击"时间起卦"');
      await timeButton.click();
      await page.waitForTimeout(1000);
      
      // 检查是否显示确认页面
      const confirmButton = await page.$('button::-p-text(开始起卦)');
      if (confirmButton) {
        console.log('   ✅ 确认页面显示正常\n');
        
        console.log('🎯 测试 4: 点击"开始起卦"');
        await confirmButton.click();
        await page.waitForTimeout(2000);
        
        // 检查是否显示结果
        const resultContent = await page.content();
        if (resultContent.includes('卦') && resultContent.includes('第')) {
          console.log('   ✅ 卦象结果显示正常\n');
        } else {
          console.log('   ❌ 未显示卦象结果\n');
        }
      } else {
        console.log('   ❌ 未找到"开始起卦"按钮\n');
      }
    } else {
      console.log('   ❌ 未找到"时间起卦"按钮\n');
    }
    
    console.log('✅ 测试完成！\n');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
