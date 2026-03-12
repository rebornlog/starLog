#!/usr/bin/env node

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.join(__dirname, '../public')
const OUTPUT_DIR = path.join(__dirname, '../public/optimized')

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

async function compressImage(inputPath, outputPath, options = {}) {
  const { width = 1920, quality = 80 } = options
  
  try {
    await sharp(inputPath)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputPath)
    
    const stats = fs.statSync(outputPath)
    const originalStats = fs.statSync(inputPath)
    const savings = ((originalStats.size - stats.size) / originalStats.size * 100).toFixed(2)
    
    console.log(`✅ ${path.basename(inputPath)} -> ${path.basename(outputPath)} (节省 ${savings}%)`)
  } catch (error) {
    console.error(`❌ 压缩失败 ${path.basename(inputPath)}:`, error.message)
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      await processDirectory(filePath)
    } else if (stat.isFile() && /\.(png|jpg|jpeg|gif)$/i.test(file)) {
      const outputPath = path.join(OUTPUT_DIR, path.relative(PUBLIC_DIR, dir), file.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp'))
      
      // 确保输出目录存在
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      await compressImage(filePath, outputPath)
    }
  }
}

async function main() {
  console.log('🚀 开始压缩图片...\n')
  
  await processDirectory(PUBLIC_DIR)
  
  console.log('\n🎉 图片压缩完成！')
  console.log(`📁 输出目录：${OUTPUT_DIR}`)
}

main().catch(console.error)
