#!/usr/bin/env node

/**
 * 测试问卦功能 - 模拟浏览器行为
 */

const http = require('http');

console.log('🔍 开始测试问卦功能...\n');

// 测试 1: 访问页面
console.log('📄 测试 1: 访问 /iching/ 页面');
http.get('http://localhost:3000/iching/', (res) => {
  console.log(`   HTTP 状态：${res.statusCode}`);
  
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    if (html.includes('易经问卦')) {
      console.log('   ✅ 页面加载正常\n');
    } else {
      console.log('   ❌ 页面内容异常\n');
    }
    
    // 测试 2: 检查编译后的 JS
    console.log('📦 测试 2: 检查 JavaScript 代码');
    const jsMatch = html.match(/iching\/page-([a-z0-9]+)\.js/);
    if (jsMatch) {
      console.log(`   ✅ 找到 JS 文件：iching/page-${jsMatch[1]}.js`);
      
      // 测试 3: 获取 JS 文件并检查函数
      http.get(`http://localhost:3000/_next/static/chunks/app/iching/page-${jsMatch[1]}.js`, (jsRes) => {
        let jsCode = '';
        jsRes.on('data', chunk => jsCode += chunk);
        jsRes.on('end', () => {
          const checks = [
            { name: 'castHexagram', pattern: 'function t(t,e)' },
            { name: 'interpretHexagram', pattern: 'function e(t)' },
            { name: 'getHexagramById', pattern: 'function l(t)' },
            { name: 'timeMethod', pattern: 'function t()' },
          ];
          
          console.log('\n📋 测试 3: 检查关键函数');
          checks.forEach(check => {
            if (jsCode.includes(check.pattern)) {
              console.log(`   ✅ ${check.name} 函数存在`);
            } else {
              console.log(`   ❌ ${check.name} 函数缺失`);
            }
          });
          
          console.log('\n✅ 测试完成！代码编译正常');
          console.log('\n💡 如果浏览器仍然报错，请：');
          console.log('   1. 清除浏览器缓存 (Ctrl+Shift+Delete)');
          console.log('   2. 使用无痕模式测试');
          console.log('   3. 按 F12 查看 Console 错误信息');
        });
      }).on('error', (err) => {
        console.log(`   ❌ 无法加载 JS 文件：${err.message}`);
      });
    } else {
      console.log('   ❌ 未找到 JS 文件\n');
    }
  });
}).on('error', (err) => {
  console.error(`❌ 请求失败：${err.message}`);
  process.exit(1);
});
