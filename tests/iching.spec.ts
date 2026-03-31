import { test, expect } from '@playwright/test';

test.use({ headless: true });

test('问卦功能测试', async ({ page }) => {
  console.log('🚀 开始测试问卦功能...\n');
  
  // 测试 1: 访问页面
  console.log('📄 测试 1: 访问 /iching/ 页面');
  await page.goto('http://localhost:3000/iching/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const title = await page.title();
  console.log(`   页面标题：${title}`);
  
  const content = await page.content();
  if (content.includes('易经问卦')) {
    console.log('   ✅ 页面加载正常\n');
  }
  
  // 测试 2: 检查 Console 错误
  console.log('🔍 测试 2: 检查 Console 错误');
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('   ❌ Console Error:', msg.text());
    }
  });
  
  // 测试 2.5: 跳过引导
  console.log('⏭️ 测试 2.5: 跳过引导页面');
  const skipButton = page.locator('button:has-text("跳过引导")');
  if (await skipButton.isVisible()) {
    await skipButton.click();
    await page.waitForTimeout(1000);
    console.log('   ✅ 已跳过引导\n');
  }
  
  // 测试 3: 点击时间起卦
  console.log('⚡ 测试 3: 点击"时间起卦"按钮');
  const timeButton = page.locator('button:has-text("时间起卦")');
  await timeButton.click();
  await page.waitForTimeout(1000);
  
  const confirmButton = page.locator('button:has-text("开始起卦")');
  await expect(confirmButton).toBeVisible();
  console.log('   ✅ 确认页面显示正常\n');
  
  // 测试 4: 点击开始起卦
  console.log('🎯 测试 4: 点击"开始起卦"');
  await confirmButton.click();
  await page.waitForTimeout(2000);
  
  // 检查是否显示卦象
  console.log('📊 测试 5: 检查卦象结果');
  const resultContent = await page.content();
  if (resultContent.includes('卦') && resultContent.includes('第')) {
    console.log('   ✅ 卦象结果显示正常\n');
  } else {
    console.log('   ❌ 未显示卦象结果\n');
  }
  
  // 报告结果
  console.log('📋 测试结果:');
  if (errors.length > 0) {
    console.log(`   ❌ 发现 ${errors.length} 个错误`);
    errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  } else {
    console.log('   ✅ 无 Console 错误');
  }
});
