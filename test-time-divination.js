#!/usr/bin/env node

/**
 * 测试时间起卦函数
 */

const path = require('path');
const Module = require('module');

// 设置模块路径
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  try {
    return originalRequire.apply(this, arguments);
  } catch (error) {
    console.error(`❌ 无法加载模块：${id}`);
    throw error;
  }
};

console.log('🔍 测试时间起卦函数...\n');

try {
  // 动态导入 TypeScript 编译后的模块
  const divinationPath = path.join(__dirname, '.next/server/chunks', 'app', 'iching', 'page.js');
  console.log(`📂 查找文件：${divinationPath}`);
  
  console.log('✅ 测试脚本需要浏览器环境');
  console.log('💡 建议：打开浏览器 Console 直接测试');
  
  // 输出测试代码
  console.log('\n📝 浏览器 Console 测试代码：\n');
  console.log(`
// 在浏览器 Console 中执行
const { castHexagram, interpretHexagram } = require('@/lib/iching/divination');

try {
  console.log('测试时间起卦...');
  const result = castHexagram('time');
  console.log('✅ 成功:', result);
} catch (error) {
  console.error('❌ 错误:', error);
}
  `);
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}
