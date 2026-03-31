import { test, expect } from '@playwright/test';

test('问卦页面测试', async ({ page }) => {
  console.log('访问问卦页面...');
  await page.goto('http://localhost:3000/iching');
  await page.waitForLoadState('networkidle');
  
  // 截图
  await page.screenshot({ path: 'test-results/iching-page.png' });
  console.log('✅ 问卦页面截图已保存');
  
  // 检查页面元素
  const title = await page.title();
  console.log(`页面标题：${title}`);
  
  // 检查是否有起卦按钮
  const buttonExists = await page.isVisible('button:has-text("起卦"), button:has-text("问卦"), button:has-text("占卜")');
  console.log(`起卦按钮是否存在：${buttonExists}`);
  
  // 收集 Console 日志
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  // 等待 2 秒
  await page.waitForTimeout(2000);
  
  // 输出日志
  if (consoleLogs.length > 0) {
    console.log('\n📋 Console 日志:');
    consoleLogs.slice(-10).forEach(log => console.log(`  ${log}`));
  }
});
