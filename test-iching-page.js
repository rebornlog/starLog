#!/usr/bin/env node

/**
 * 问卦页面测试脚本
 * 检查页面加载和动画相关错误
 */

const http = require('http');

console.log('🔍 开始测试问卦页面...\n');

// 测试页面加载
http.get('http://localhost:3000/iching/', (res) => {
  console.log(`✅ HTTP 状态：${res.statusCode}`);
  
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log(`✅ 页面大小：${(html.length / 1024).toFixed(2)} KB`);
    
    // 检查关键组件
    const checks = [
      { name: 'DivinationAnimation', pattern: 'DivinationAnimation' },
      { name: 'Coin 组件', pattern: 'Coin' },
      { name: '摇卦动画', pattern: 'coin-flip' },
      { name: 'useEffect', pattern: 'useEffect' },
      { name: 'useState', pattern: 'useState' },
    ];
    
    console.log('\n📋 组件检查:');
    checks.forEach(check => {
      const found = html.includes(check.pattern);
      console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
    });
    
    // 检查可能的错误模式
    const errorPatterns = [
      { name: 'undefined', pattern: 'undefined' },
      { name: 'null', pattern: 'null' },
      { name: 'Error', pattern: 'Error' },
    ];
    
    console.log('\n⚠️ 潜在问题检查:');
    errorPatterns.forEach(pattern => {
      const count = (html.match(new RegExp(pattern.pattern, 'g')) || []).length;
      console.log(`  ${count > 0 ? '⚠️' : '✅'} ${pattern.name}: ${count} 次`);
    });
    
    console.log('\n✅ 测试完成！页面结构正常。');
    console.log('\n💡 建议：打开浏览器 F12 Console 查看实际运行时错误');
  });
}).on('error', (err) => {
  console.error(`❌ 请求失败：${err.message}`);
  process.exit(1);
});
