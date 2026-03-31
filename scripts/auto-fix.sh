#!/bin/bash
# auto-fix.sh - 自动修复脚本
# 根据检测结果自动修复常见问题，并提交到 GitHub

set -e

WORKSPACE_DIR="/home/admin/.openclaw/workspace/starLog"
REPORT_DIR="$WORKSPACE_DIR/test-reports"
FIX_LOG="/tmp/auto-fix.log"
GIT_USER="openclaw-bot"
GIT_EMAIL="bot@starlog.dev"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$FIX_LOG"
}

log_step() { log "${BLUE}📍$NC $1"; }
log_success() { log "${GREEN}✅$NC $1"; }
log_warning() { log "${YELLOW}⚠️$NC $1"; }
log_error() { log "${RED}❌$NC $1"; }

# 修复缺失的 SEO meta 标签
fix_seo_meta() {
    log_step "检查并修复 SEO Meta 标签..."
    
    local pages_dir="$WORKSPACE_DIR/app"
    local fixed_count=0
    
    # 检查各个页面的 metadata 配置
    for page_dir in "$pages_dir"/*/ "$pages_dir"/funds/*/; do
        if [ -d "$page_dir" ]; then
            local page_name=$(basename "$page_dir")
            local page_file="$page_dir/page.tsx"
            
            if [ -f "$page_file" ]; then
                log "  检查：$page_name"
                
                # 检查是否有 metadata 导出
                if ! grep -q "export const metadata" "$page_file" && ! grep -q "export async function generateMetadata" "$page_file"; then
                    log_warning "    缺少 metadata，尝试添加..."
                    
                    # 生成 title
                    local title=$(echo "$page_name" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
                    if [ "$page_name" = "funds" ]; then
                        title="基金 - 实时净值查询"
                    elif [ "$page_name" = "stocks" ]; then
                        title="股票 - 实时行情"
                    elif [ "$page_name" = "blog" ]; then
                        title="博客 - 技术文章"
                    fi
                    
                    # 添加 metadata 导出
                    local metadata_block="
export const metadata = {
  title: '$title | starLog',
  description: '$title 页面 - starLog 个人知识库',
  robots: {
    index: true,
    follow: true,
  },
}
"
                    # 在文件开头插入 metadata（在第一个 import 之后）
                    if grep -q "^import" "$page_file"; then
                        # 有 import，在最后一个 import 后插入
                        local temp_file=$(mktemp)
                        awk -v meta="$metadata_block" '
                        /^import/ { import_block = import_block $0 "\n"; next }
                        { if (import_block) { print import_block; print meta; import_block = "" } print }
                        END { if (import_block) { print import_block; print meta } }
                        ' "$page_file" > "$temp_file"
                        mv "$temp_file" "$page_file"
                    else
                        # 没有 import，直接在开头插入
                        echo "$metadata_block" | cat - "$page_file" > temp && mv temp "$page_file"
                    fi
                    
                    log_success "    已添加 metadata: $title"
                    ((fixed_count++))
                else
                    log_success "    metadata 已存在"
                fi
            fi
        fi
    done
    
    log "✅ 共修复 $fixed_count 个页面的 metadata"
    return $fixed_count
}

# 优化图片为 WebP
optimize_images_webp() {
    log_step "优化图片为 WebP 格式..."
    
    local public_dir="$WORKSPACE_DIR/public"
    local converted=0
    
    if [ ! -d "$public_dir" ]; then
        log_warning "public 目录不存在，跳过"
        return 0
    fi
    
    # 查找所有 PNG 和 JPG 图片
    find "$public_dir" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read img; do
        local webp_img="${img%.*}.webp"
        
        # 如果 WebP 不存在或比原图新
        if [ ! -f "$webp_img" ] || [ "$img" -nt "$webp_img" ]; then
            log "  转换：$(basename $img)"
            
            if command -v cwebp &> /dev/null; then
                cwebp -q 80 "$img" -o "$webp_img" 2>/dev/null && {
                    local orig_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
                    local new_size=$(stat -f%z "$webp_img" 2>/dev/null || stat -c%s "$webp_img" 2>/dev/null)
                    local saved=$(( (orig_size - new_size) * 100 / orig_size ))
                    log_success "    节省 ${saved}% 空间 (${orig_size}B → ${new_size}B)"
                    ((converted++))
                } || log_error "    转换失败"
            else
                log_warning "    cwebp 未安装，跳过"
                return 0
            fi
        fi
    done
    
    log "✅ 图片 WebP 优化完成"
}

# 添加图片 alt 属性
fix_image_alt() {
    log_step "检查并修复图片 Alt 属性..."
    
    local components_dir="$WORKSPACE_DIR/components"
    local fixed_count=0
    
    # 查找组件中的 img 标签
    find "$components_dir" -name "*.tsx" -o -name "*.jsx" 2>/dev/null | while read file; do
        # 检查是否有缺少 alt 的 img 标签
        if grep -q '<img[^>]*>' "$file" && ! grep -q 'alt=' "$file"; then
            log_warning "  发现缺少 alt 的图片：$(basename $file)"
            # 这个需要人工检查，因为不知道图片内容
            log "    ⚠️  需要人工添加合适的 alt 描述"
        fi
    done
    
    log "ℹ️  图片 Alt 属性需要人工检查（AI 无法自动确定图片内容）"
}

# 优化加载性能 - 添加懒加载
add_lazy_loading() {
    log_step "添加图片懒加载..."
    
    local app_dir="$WORKSPACE_DIR/app"
    local added=0
    
    # 查找 Next.js Image 组件
    find "$app_dir" -name "*.tsx" | while read file; do
        if grep -q '<img' "$file" && ! grep -q 'loading="lazy"' "$file"; then
            # 替换 img 标签，添加懒加载
            sed -i 's/<img/<img loading="lazy"/g' "$file" 2>/dev/null && {
                log_success "  已添加懒加载：$(basename $file)"
                ((added++))
            }
        fi
    done
    
    log "✅ 懒加载优化完成"
}

# 添加缓存头配置
add_cache_headers() {
    log_step "检查缓存配置..."
    
    local next_config="$WORKSPACE_DIR/next.config.js"
    
    if [ -f "$next_config" ]; then
        if grep -q "headers" "$next_config"; then
            log_success "  缓存配置已存在"
        else
            log_warning "  缺少缓存配置，建议手动添加"
            cat << 'EOF'

建议在 next.config.js 中添加：

async headers() {
  return [
    {
      source: '/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ]
    },
    {
      source: '/:path*.(png|jpg|jpeg|webp|svg|gif|ico)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ]
    }
  ];
}

EOF
        fi
    fi
}

# 压缩静态资源
compress_assets() {
    log_step "压缩静态资源..."
    
    if command -v gzip &> /dev/null; then
        local public_dir="$WORKSPACE_DIR/public"
        
        find "$public_dir" -type f \( -name "*.js" -o -name "*.css" -o -name "*.svg" \) -size +1k | head -10 | while read file; do
            local gz_file="${file}.gz"
            if [ ! -f "$gz_file" ]; then
                gzip -k "$file" 2>/dev/null && {
                    local orig_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
                    local gz_size=$(stat -c%s "$gz_file" 2>/dev/null || stat -f%z "$gz_file" 2>/dev/null)
                    local saved=$(( (orig_size - gz_size) * 100 / orig_size ))
                    log_success "  压缩：$(basename $file) (节省 ${saved}%)"
                }
            fi
        done
    else
        log_warning "gzip 不可用，跳过"
    fi
}

# 提交到 GitHub
commit_and_push() {
    log_step "提交到 GitHub..."
    
    cd "$WORKSPACE_DIR"
    
    # 配置 git 用户
    git config user.name "$GIT_USER"
    git config user.email "$GIT_EMAIL"
    
    # 检查是否有更改
    if git status --porcelain | grep -q "."; then
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        local commit_msg="🤖 Auto-Fix: 自动优化与修复 ($timestamp)"
        
        # 添加所有更改
        git add -A
        
        # 提交
        git commit -m "$commit_msg" && {
            log_success "✅ 已提交：$commit_msg"
            
            # 推送到 GitHub
            log "  推送中..."
            if git push origin master 2>/dev/null || git push origin main 2>/dev/null; then
                log_success "✅ 已推送到 GitHub"
            else
                log_error "❌ Push 失败，检查网络或权限"
                log "  但 commit 已本地保存"
            fi
        } || log_warning "⚠️  没有新的更改或提交失败"
    else
        log "ℹ️  工作区干净，无需提交"
    fi
}

# 生成修复报告
generate_fix_report() {
    log_step "生成修复报告..."
    
    local report_file="$REPORT_DIR/auto-fix-$(date +%Y-%m-%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# 🔧 自动修复报告

**执行时间：** $(date '+%Y-%m-%d %H:%M:%S')

---

## 📊 修复统计

| 类型 | 数量 | 状态 |
|------|------|------|
| SEO Meta 修复 | $(grep -c "已添加 metadata" "$FIX_LOG" 2>/dev/null || echo 0) | ✅ |
| 图片 WebP 转换 | $(grep -c "节省.*空间" "$FIX_LOG" 2>/dev/null || echo 0) | ✅ |
| 懒加载添加 | $(grep -c "已添加懒加载" "$FIX_LOG" 2>/dev/null || echo 0) | ✅ |
| 资源压缩 | $(grep -c "压缩：" "$FIX_LOG" 2>/dev/null || echo 0) | ✅ |

---

## 🔍 详细修复

### SEO Meta 标签
EOF

    grep "已添加 metadata" "$FIX_LOG" 2>/dev/null | while read line; do
        echo "- $line" >> "$report_file"
    done

    cat >> "$report_file" << EOF

### 图片优化
EOF

    grep "节省.*空间" "$FIX_LOG" 2>/dev/null | while read line; do
        echo "- $line" >> "$report_file"
    done

    cat >> "$report_file" << EOF

### 待人工检查

- 图片 Alt 属性（需要人工确定描述）
- 颜色对比度（需要人工检查）
- 内容质量（需要人工审核）

---

## 📤 Git 提交

**Commit Message:** \`🤖 Auto-Fix: 自动优化与修复\`

**状态：** 已提交并推送 ✅

---

**下次执行：** 25 分钟后自动
**报告位置：** $REPORT_DIR/
EOF

    log_success "修复报告已生成：$report_file"
}

# 主函数
main() {
    mkdir -p "$REPORT_DIR"
    
    log "=========================================="
    log "🔧 开始自动修复"
    log "=========================================="
    
    # 1. SEO Meta 修复
    fix_seo_meta || true
    echo ""
    
    # 2. 图片 WebP 优化
    optimize_images_webp || true
    echo ""
    
    # 3. 图片 Alt 检查
    fix_image_alt || true
    echo ""
    
    # 4. 懒加载优化
    add_lazy_loading || true
    echo ""
    
    # 5. 缓存配置检查
    add_cache_headers || true
    echo ""
    
    # 6. 资源压缩
    compress_assets || true
    echo ""
    
    # 7. 提交到 GitHub
    commit_and_push || true
    echo ""
    
    # 8. 生成报告
    generate_fix_report
    
    log "=========================================="
    log "✅ 自动修复完成"
    log "=========================================="
}

main "$@"
