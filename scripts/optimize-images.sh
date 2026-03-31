#!/bin/bash

# 图片优化脚本 - WebP 转换
# 功能：批量转换图片为 WebP 格式，减少文件大小

set -e

# === 配置区域 ===
IMAGE_DIRS=(
    "/home/admin/.openclaw/workspace/starLog/public/static/images"
    "/home/admin/.openclaw/workspace/starLog/public/static/avatars"
)
QUALITY=80                    # WebP 质量 (1-100)
RESIZE_WIDTH=1920             # 最大宽度（超过则缩放）
LOG_FILE="/tmp/starlog-image-optimize.log"

# === 函数定义 ===
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_dependencies() {
    log "📦 检查依赖..."
    
    if ! command -v convert &> /dev/null; then
        log "❌ ImageMagick 未安装，正在安装..."
        sudo yum install -y ImageMagick || sudo apt-get install -y imagemagick
    fi
    
    if ! command -v cwebp &> /dev/null; then
        log "❌ WebP 工具未安装，正在安装..."
        sudo yum install -y libwebp-tools || sudo apt-get install -y webp
    fi
    
    log "✅ 依赖检查完成"
}

optimize_image() {
    local input_file="$1"
    local output_file="${input_file%.*}.webp"
    
    # 跳过已存在的 WebP 文件
    if [ -f "$output_file" ]; then
        log "⏭️  跳过（已存在）: $input_file"
        return 0
    fi
    
    # 获取原始大小
    local original_size=$(stat -c%s "$input_file" 2>/dev/null || stat -f%z "$input_file")
    
    # 转换并优化
    if cwebp -q $QUALITY -resize $RESIZE_WIDTH 0 "$input_file" -o "$output_file" 2>/dev/null; then
        local new_size=$(stat -c%s "$output_file" 2>/dev/null || stat -f%z "$output_file")
        local savings=$(echo "scale=2; (1 - $new_size / $original_size) * 100" | bc)
        
        log "✅ 优化成功：$input_file"
        log "   原始大小：$(numfmt --to=iec-i --suffix=B $original_size)"
        log "   优化后：$(numfmt --to=iec-i --suffix=B $new_size)"
        log "   节省：${savings}%"
    else
        log "❌ 优化失败：$input_file"
        return 1
    fi
}

process_directory() {
    local dir="$1"
    
    if [ ! -d "$dir" ]; then
        log "⚠️  目录不存在：$dir"
        return 0
    fi
    
    log "📁 处理目录：$dir"
    
    local count=0
    local success=0
    local failed=0
    
    # 查找所有 JPG/PNG 图片
    while IFS= read -r -d '' file; do
        ((count++))
        
        # 跳过缩略图和已优化的图片
        if [[ "$file" == *"-thumb"* ]] || [[ "$file" == *".webp" ]]; then
            continue
        fi
        
        if optimize_image "$file"; then
            ((success++))
        else
            ((failed++))
        fi
        
    done < <(find "$dir" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -print0 2>/dev/null)
    
    log "📊 目录处理完成：$dir"
    log "   总文件数：$count"
    log "   成功：$success"
    log "   失败：$failed"
}

generate_nextjs_image_component() {
    log "🔧 生成 Next.js Image 组件示例..."
    
    cat > /tmp/image-usage-example.md << 'EOF'
# Next.js Image 组件使用示例

## 优化后的图片使用方式

```tsx
import Image from 'next/image'

// ✅ 推荐：使用 WebP 格式
<Image
  src="/static/images/avatar.webp"
  alt="描述"
  width={800}
  height={600}
  priority={true}  // 首屏图片
  quality={80}
  placeholder="blur"  // 模糊占位
  blurDataURL="data:image/webp;base64,..."  // 可选
/>

// ✅ 响应式图片
<Image
  src="/static/images/banner.webp"
  alt="横幅"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={true}
/>
```

## 自动优化配置

Next.js 已配置自动 WebP 转换：

```js
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  }
}
```

使用标准 `<img>` 标签时，Next.js 会自动提供 WebP 格式（如果浏览器支持）。
EOF
    
    log "✅ 示例文档：/tmp/image-usage-example.md"
}

# === 主程序 ===
main() {
    log "=========================================="
    log "🚀 开始图片优化"
    log "=========================================="
    
    # 检查依赖
    check_dependencies
    
    # 生成使用示例
    generate_nextjs_image_component
    
    # 处理所有目录
    for dir in "${IMAGE_DIRS[@]}"; do
        process_directory "$dir"
    done
    
    # 统计总体情况
    log "=========================================="
    log "📊 总体统计"
    log "=========================================="
    
    local total_webp=$(find "${IMAGE_DIRS[@]}" -name "*.webp" 2>/dev/null | wc -l)
    local total_original=$(find "${IMAGE_DIRS[@]}" \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) 2>/dev/null | wc -l)
    local total_size_webp=$(du -sh "${IMAGE_DIRS[0]}" 2>/dev/null | cut -f1 || echo "N/A")
    
    log "WebP 文件数：$total_webp"
    log "原始文件数：$total_original"
    log "目录总大小：$total_size_webp"
    
    log "=========================================="
    log "✅ 图片优化完成"
    log "=========================================="
    
    # 提示
    log ""
    log "💡 提示："
    log "1. 在代码中使用 <Image> 组件代替 <img> 标签"
    log "2. Next.js 会自动为支持的浏览器提供 WebP 格式"
    log "3. 查看示例文档：/tmp/image-usage-example.md"
}

# 执行主程序
main
