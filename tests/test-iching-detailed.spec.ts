import { test, expect } from '@playwright/test';

test('问卦页面详细功能测试', async ({ page }) => {
  console.log('\n=== 访问问卦页面 ===');
  await page.goto('http://localhost:3000/iching');
  await page.waitForLoadState('networkidle');
  
  // 截图：首页
  await page.screenshot({ path: 'test-results/iching-01-home.png' });
  console.log('✅ 截图 1：问卦首页');
  
  // 检查页面标题
  const title = await page.title();
  console.log(`📋 页面标题：${title}`);
  
  // 查找所有按钮
  console.log('\n=== 查找所有按钮 ===');
  const buttons = await page.locator('button').all();
  console.log(`找到 ${buttons.length} 个按钮`);
  
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const text = await buttons[i].textContent();
    console.log(`  按钮 ${i + 1}: "${text?.trim()}"`);
  }
  
  // 检查是否有引导页
  const hasGuide = await page.isVisible('text=/静心|起卦|专注/');
  console.log(`\n📋 是否有引导页：${hasGuide}`);
  
  // 检查是否有起卦方式选择
  const hasMethodSelect = await page.isVisible('text=/随机起卦 | 时间起卦 | 数字起卦/');
  console.log(`📋 是否有起卦方式选择：${hasMethodSelect}`);
  
  // 尝试点击"跳过引导"或"开始起卦"
  try {
    const startButton = page.locator('button:has-text("开始"), button:has-text("跳过"), button:has-text("起卦")').first();
    if (await startButton.isVisible()) {
      console.log('\n=== 点击开始按钮 ===');
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/iching-02-after-start.png' });
      console.log('✅ 截图 2：点击开始后');
    }
  } catch (e) {
    console.log('⚠️ 未找到开始按钮或已跳过');
  }
  
  // 检查是否有数字输入
  const hasNumberInput = await page.isVisible('input[type="number"], input[inputmode="numeric"]');
  console.log(`\n📋 是否有数字输入：${hasNumberInput}`);
  
  // 检查是否有卦象显示
  const hasHexagram = await page.isVisible('text=/卦|爻|乾|坤/');
  console.log(`📋 是否有卦象显示：${hasHexagram}`);
  
  // 收集 Console 日志
  const consoleLogs: string[] = [];
  const errors: string[] = [];
  
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(`ERROR: ${error.message}`);
  });
  
  // 等待 3 秒
  await page.waitForTimeout(3000);
  
  // 截图：最终状态
  await page.screenshot({ path: 'test-results/iching-03-final.png' });
  console.log('\n✅ 截图 3：最终状态');
  
  // 输出 Console 日志
  if (consoleLogs.length > 0 || errors.length > 0) {
    console.log('\n📋 Console 日志:');
    [...consoleLogs, ...errors].slice(-20).forEach(log => {
      console.log(`  ${log}`);
    });
  } else {
    console.log('\n✅ 无 Console 错误');
  }
  
  // 检查页面元素完整性
  console.log('\n=== 页面元素检查 ===');
  const checks = [
    { name: '标题', selector: 'h1, h2, .title' },
    { name: '按钮', selector: 'button' },
    { name: '输入框', selector: 'input' },
    { name: '卦象', selector: '[class*="hexagram"], [class*="gua"]' },
    { name: '说明文字', selector: 'p, .description, .guide' },
  ];
  
  for (const check of checks) {
    const exists = await page.isVisible(check.selector);
    console.log(`  ${check.name}: ${exists ? '✅' : '❌'}`);
  }
});
