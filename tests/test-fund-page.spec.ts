import { test, expect } from '@playwright/test';

test.use({ headless: true });

test('基金详情页历史业绩按钮测试', async ({ page }) => {
  // 访问基金详情页
  console.log('访问页面...');
  await page.goto('http://localhost:3000/funds/005827');
  await page.waitForLoadState('networkidle');
  
  // 截图：页面加载后
  await page.screenshot({ path: 'test-results/page-loaded.png' });
  console.log('✅ 页面加载截图已保存');
  
  // 收集 Console 日志
  const consoleLogs: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(`ERROR: ${error.message}`);
  });
  
  // 点击"历史业绩"按钮
  console.log('点击历史业绩按钮...');
  await page.click('button:has-text("历史业绩")');
  await page.waitForTimeout(3000);
  
  // 截图：点击后
  await page.screenshot({ path: 'test-results/page-after-click.png' });
  console.log('✅ 点击后截图已保存');
  
  // 输出 Console 日志
  console.log('\n📋 Console 日志:');
  consoleLogs.slice(-10).forEach(log => console.log(`  ${log}`));
  
  // 输出错误
  if (errors.length > 0) {
    console.log('\n❌ 错误:');
    errors.forEach(err => console.log(`  ${err}`));
  } else {
    console.log('\n✅ 无 JavaScript 错误');
  }
  
  // 检查是否显示表格
  const table = page.locator('table');
  const tableVisible = await table.isVisible();
  console.log(`\n表格是否显示：${tableVisible}`);
});
