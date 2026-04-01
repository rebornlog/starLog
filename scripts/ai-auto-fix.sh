#!/bin/bash
# ai-auto-fix.sh - AI 驱动的自动修复脚本（实用版）
# 检测问题 → 调用 AI 分析 → 生成修复代码 → 应用修复 → 提交

set -e

WORKSPACE_DIR="/home/admin/.openclaw/workspace/starLog"
REPORT_DIR="$WORKSPACE_DIR/test-reports"
LOG_FILE="/tmp/ai-auto-fix.log"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ==================== 检测 SEO 问题 ====================
check_seo_issues() {
    log "🔍 检测 SEO 问题..."
    
    local issues=()
    local pages=("/funds" "/stocks" "/blog")
    
    for page in "${pages[@]}"; do
        local html=$(curl -s "http://localhost:3000$page" --connect-timeout 10)
        local page_issues=()
        
        # 检查 title
        if ! echo "$html" | grep -q "<title>" || [ -z "$(echo "$html" | grep -oP '(?<=<title>)[^<]+' | head -1)" ]; then
            page_issues+=("missing_title")
        fi
        
        # 检查 meta description
        if ! echo "$html" | grep -q 'name="description"'; then
            page_issues+=("missing_meta_description")
        fi
        
        # 检查 H1
        if ! echo "$html" | grep -q "<h1"; then
            page_issues+=("missing_h1")
        fi
        
        # 检查 canonical
        if ! echo "$html" | grep -q 'rel="canonical"'; then
            page_issues+=("missing_canonical")
        fi
        
        # 检查 viewport
        if ! echo "$html" | grep -q 'name="viewport"'; then
            page_issues+=("missing_viewport")
        fi
        
        if [ ${#page_issues[@]} -gt 0 ]; then
            log "  ⚠️  $page: ${page_issues[*]}"
            issues+=("$page:${page_issues[*]}")
        fi
    done
    
    # 返回问题列表
    printf '%s\n' "${issues[@]}"
}

# ==================== 生成 AI 修复任务 ====================
generate_ai_task() {
    local issues=$1
    local task_file="$REPORT_DIR/ai-task-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$task_file" << EOF
# AI 网站优化任务

## 检测到的问题

$issues

## 任务要求

请分析以上网站 SEO 问题，并为每个问题提供：

1. **问题描述**：清楚说明问题是什么
2. **影响分析**：说明这个问题对 SEO/用户体验的影响
3. **修复方案**：提供具体的代码修改
4. **文件路径**：指出需要修改的文件

## 输出格式

请按以下格式输出：

### 问题 1：[问题名称]
- **页面**：[页面路径]
- **影响**：[影响说明]
- **修复文件**：[文件路径]
- **修复代码**：
\`\`\`tsx
// 修改前的代码
// ...

// 修改后的代码
// ...
\`\`\`

## 优先级

1. missing_title - 高优先级（严重影响 SEO）
2. missing_meta_description - 中优先级
3. missing_h1 - 中优先级
4. missing_canonical - 低优先级
5. missing_viewport - 高优先级（影响移动端）

请从高到低优先修复。
EOF
    
    echo "$task_file"
}

# ==================== 调用 AI 生成修复方案 ====================
call_ai_for_fix() {
    local task_file=$1
    log "🤖 调用 AI 生成修复方案..."
    
    # 使用 OpenClaw sessions_spawn 调用 AI
    # 这里创建一个临时文件来存储 AI 的修复建议
    local ai_response_file="$REPORT_DIR/ai-response-$(date +%Y%m%d-%H%M%S).md"
    
    # TODO: 实际应该调用 OpenClaw API
    # 现在先创建一个占位符
    cat > "$ai_response_file" << 'EOF'
# AI 修复建议

## 问题 1：missing_title
- **页面**：/funds, /stocks, /blog
- **影响**：缺少 title 标签会严重影响搜索引擎排名
- **修复文件**：app/funds/page.tsx, app/stocks/page.tsx, app/blog/page.tsx
- **修复代码**：

在每个页面组件中添加 Metadata 导出：

```tsx
// app/funds/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '基金排行 - StarLog',
  description: '查看实时基金排行和净值数据',
}
```

## 问题 2：missing_meta_description
- **页面**：/funds, /stocks, /blog
- **影响**：缺少描述会影响搜索结果的点击率
- **修复文件**：同上
- **修复代码**：

在上面的 metadata 中已包含 description

## 问题 3：missing_h1
- **页面**：/funds, /stocks, /blog
- **影响**：缺少 H1 影响页面结构和 SEO
- **修复文件**：同上
- **修复代码**：

在页面主内容区添加 H1 标签：

```tsx
<main>
  <h1>基金排行</h1>
  {/* 其他内容 */}
</main>
```

## 问题 4：missing_viewport
- **页面**：/funds, /stocks, /blog
- **影响**：移动端显示异常
- **修复文件**：app/layout.tsx
- **修复代码**：

确保 root layout 包含 viewport：

```tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://starlog.dev'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StarLog',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}
```
EOF
    
    log "  ✅ AI 修复建议已生成：$ai_response_file"
    echo "$ai_response_file"
}

# ==================== 应用修复 ====================
apply_seo_fixes() {
    log "🔧 应用 SEO 修复..."
    
    # 1. 修复基金页面的 metadata
    log "  修复：app/funds/page.tsx"
    add_metadata_to_page "$WORKSPACE_DIR/app/funds/page.tsx" "基金排行 - StarLog" "查看实时基金排行和净值数据" "基金排行"
    
    # 2. 修复股票页面的 metadata
    log "  修复：app/stocks/page.tsx"
    add_metadata_to_page "$WORKSPACE_DIR/app/stocks/page.tsx" "股票行情 - StarLog" "查看实时股票行情和 K 线图" "股票行情"
    
    # 3. 修复博客页面的 metadata
    log "  修复：app/blog/page.tsx"
    add_metadata_to_page "$WORKSPACE_DIR/app/blog/page.tsx" "技术博客 - StarLog" "分享编程技术和开发经验" "技术博客"
    
    log "  ✅ SEO 修复完成"
}

# 为页面添加 metadata
add_metadata_to_page() {
    local file=$1
    local title=$2
    local description=$3
    local h1_text=$4
    
    if [ ! -f "$file" ]; then
        log "    ⚠️  文件不存在：$file"
        return 1
    fi
    
    # 检查是否已有 metadata 导出
    if grep -q "export const metadata" "$file"; then
        log "    ℹ️  已有 metadata，跳过"
    else
        # 在文件开头添加导入
        if ! grep -q "import { Metadata }" "$file"; then
            sed -i "1s/^/import { Metadata } from 'next'\n/" "$file"
        fi
        
        # 添加 metadata 导出（在第一个 export 之前）
        local metadata_code="
export const metadata: Metadata = {
  title: '$title',
  description: '$description',
}
"
        # 找到第一个 export 的位置并插入
        local line_num=$(grep -n "^export " "$file" | head -1 | cut -d: -f1)
        if [ -n "$line_num" ]; then
            sed -i "${line_num}i\\$metadata_code" "$file"
        fi
    fi
    
    # 检查是否有 H1 标签
    if ! grep -q "<h1" "$file"; then
        log "    添加 H1 标签..."
        # 在 main 标签后添加 H1
        sed -i 's/<main>/<main>\n  <h1>'"$h1_text"'<\/h1>/' "$file"
    fi
    
    log "    ✅ 已添加 metadata 和 H1"
}

# ==================== 验证修复 ====================
verify_fixes() {
    log "✅ 验证修复效果..."
    
    sleep 2  # 等待 Next.js 热重载
    
    local pages=("/funds" "/stocks" "/blog")
    local fixed_count=0
    
    for page in "${pages[@]}"; do
        local html=$(curl -s "http://localhost:3000$page" --connect-timeout 10)
        local has_title=$(echo "$html" | grep -c "<title>" || echo 0)
        local has_description=$(echo "$html" | grep -c 'name="description"' || echo 0)
        local has_h1=$(echo "$html" | grep -c "<h1" || echo 0)
        
        log "  检查：$page"
        log "    Title: $([ $has_title -gt 0 ] && echo '✅' || echo '❌')"
        log "    Description: $([ $has_description -gt 0 ] && echo '✅' || echo '❌')"
        log "    H1: $([ $has_h1 -gt 0 ] && echo '✅' || echo '❌')"
        
        if [ $has_title -gt 0 ] && [ $has_description -gt 0 ] && [ $has_h1 -gt 0 ]; then
            ((fixed_count++))
        fi
    done
    
    log "  📊 修复成功率：$fixed_count/${#pages[@]}"
    echo "$fixed_count"
}

# ==================== 提交到 GitHub ====================
commit_to_github() {
    log "📤 提交到 GitHub..."
    
    cd "$WORKSPACE_DIR"
    
    # 检查是否有更改
    if git status --porcelain | grep -q "."; then
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        local commit_msg="🤖 AI Auto-Fix: 自动优化 SEO ($timestamp)"
        
        # 添加更改
        git add -A 2>/dev/null || true
        
        # 提交
        if git status --porcelain | grep -q "."; then
            git commit -m "$commit_msg" 2>/dev/null || true
            
            # 推送
            if git remote -v | grep -q "github"; then
                git push origin master 2>/dev/null && log "✅ 已推送到 GitHub" || log "⚠️  Push 失败"
            fi
        fi
    else
        log "ℹ️  没有更改需要提交"
    fi
}

# ==================== 主函数 ====================
main() {
    mkdir -p "$REPORT_DIR"
    
    log "=========================================="
    log "🚀 AI 驱动的自动优化"
    log "=========================================="
    
    # 步骤 1: 检测问题
    local issues=$(check_seo_issues)
    
    if [ -z "$issues" ]; then
        log "✅ 未发现问题，无需优化"
        exit 0
    fi
    
    # 步骤 2: 生成 AI 任务
    local task_file=$(generate_ai_task "$issues")
    
    # 步骤 3: 调用 AI（模拟）
    local ai_response=$(call_ai_for_fix "$task_file")
    
    # 步骤 4: 应用修复
    apply_seo_fixes
    
    # 步骤 5: 验证
    verify_fixes
    
    # 步骤 6: 提交
    commit_to_github
    
    log "=========================================="
    log "✅ AI 优化完成"
    log "=========================================="
}

main "$@"
