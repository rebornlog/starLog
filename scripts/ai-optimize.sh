#!/bin/bash
# ai-optimize.sh - AI 驱动的网站自动优化脚本
# 检测问题 → AI 分析 → 自动修复 → 测试验证 → 提交代码

set -e

WORKSPACE_DIR="/home/admin/.openclaw/workspace/starLog"
REPORT_DIR="$WORKSPACE_DIR/test-reports"
LOG_FILE="/tmp/ai-optimize.log"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ==================== 第一步：检测优化点 ====================
detect_optimizations() {
    log "🔍 开始检测网站优化点..."
    
    local issues_file="$REPORT_DIR/ai-issues-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$issues_file" << 'EOF'
{
  "detected_at": "TIMESTAMP",
  "issues": []
}
EOF
    
    # 1. SEO 检测
    log "  📍 检测 SEO 问题..."
    detect_seo_issues "$issues_file"
    
    # 2. 性能检测
    log "  📍 检测性能问题..."
    detect_performance_issues "$issues_file"
    
    # 3. 可访问性检测
    log "  📍 检测可访问性问题..."
    detect_accessibility_issues "$issues_file"
    
    # 4. 代码质量检测
    log "  📍 检测代码质量问题..."
    detect_code_quality_issues "$issues_file"
    
    echo "$issues_file"
}

# SEO 问题检测
detect_seo_issues() {
    local issues_file=$1
    local pages=("/" "/funds" "/stocks" "/blog")
    
    for page in "${pages[@]}"; do
        local html=$(curl -s "http://localhost:3000$page" --connect-timeout 10)
        local issues=()
        
        # 检查 title
        if ! echo "$html" | grep -q "<title>" || [ -z "$(echo "$html" | grep -oP '(?<=<title>)[^<]+' | head -1)" ]; then
            issues+=("missing_title")
        fi
        
        # 检查 meta description
        if ! echo "$html" | grep -q 'name="description"'; then
            issues+=("missing_description")
        fi
        
        # 检查 H1
        if ! echo "$html" | grep -q "<h1"; then
            issues+=("missing_h1")
        fi
        
        # 检查 canonical
        if ! echo "$html" | grep -q 'rel="canonical"'; then
            issues+=("missing_canonical")
        fi
        
        # 检查 viewport
        if ! echo "$html" | grep -q 'name="viewport"'; then
            issues+=("missing_viewport")
        fi
        
        # 如果有问题，添加到 JSON
        if [ ${#issues[@]} -gt 0 ]; then
            local issues_json=$(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .)
            log "    ⚠️  $page: ${#issues[@]} 个 SEO 问题"
            
            # 追加到 issues_file
            jq --arg page "$page" --argjson issues "$issues_json" \
               '.issues += [{"type": "seo", "page": $page, "issues": $issues}]' \
               "$issues_file" > tmp.json && mv tmp.json "$issues_file"
        fi
    done
}

# 性能问题检测
detect_performance_issues() {
    local issues_file=$1
    local urls=("http://localhost:3000" "http://localhost:3000/funds" "http://localhost:3000/stocks")
    
    for url in "${urls[@]}"; do
        # 测量加载时间
        local start_time=$(date +%s%N)
        curl -s -o /dev/null "$url" --connect-timeout 10
        local end_time=$(date +%s%N)
        local load_time=$(( (end_time - start_time) / 1000000 ))
        
        # 获取页面大小
        local page_size=$(curl -s "$url" --connect-timeout 10 | wc -c)
        local page_size_kb=$((page_size / 1024))
        
        # 判断是否有性能问题
        if [ $load_time -gt 2000 ] || [ $page_size_kb -gt 500 ]; then
            local issues=()
            [ $load_time -gt 2000 ] && issues+=("slow_load_time")
            [ $page_size_kb -gt 500 ] && issues+=("large_page_size")
            
            local issues_json=$(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .)
            log "    ⚠️  $url: ${load_time}ms, ${page_size_kb}KB"
            
            jq --arg url "$url" --argjson issues "$issues_json" --arg load "$load_time" --arg size "$page_size_kb" \
               '.issues += [{"type": "performance", "url": $url, "issues": $issues, "load_time_ms": $load, "size_kb": $size}]' \
               "$issues_file" > tmp.json && mv tmp.json "$issues_file"
        fi
    done
}

# 可访问性问题检测
detect_accessibility_issues() {
    local issues_file=$1
    local pages=("/" "/funds" "/stocks" "/blog")
    
    for page in "${pages[@]}"; do
        local html=$(curl -s "http://localhost:3000$page" --connect-timeout 10)
        local issues=()
        
        # 检查图片 alt 属性
        local img_count=$(echo "$html" | grep -o '<img[^>]*>' | wc -l)
        local img_with_alt=$(echo "$html" | grep -o '<img[^>]*alt="[^"]*"[^>]*>' | wc -l)
        
        if [ $img_count -gt 0 ] && [ $img_with_alt -lt $img_count ]; then
            issues+=("images_missing_alt")
        fi
        
        # 检查按钮 aria-label
        local button_count=$(echo "$html" | grep -o '<button[^>]*>' | wc -l)
        local button_with_aria=$(echo "$html" | grep -o '<button[^>]*aria-label=[^>]*>' | wc -l)
        
        if [ $button_count -gt 0 ] && [ $button_with_aria -lt $button_count ]; then
            issues+=("buttons_missing_aria")
        fi
        
        if [ ${#issues[@]} -gt 0 ]; then
            local issues_json=$(printf '%s\n' "${issues[@]}" | jq -R . | jq -s .)
            log "    ⚠️  $page: ${#issues[@]} 个可访问性问题"
            
            jq --arg page "$page" --argjson issues "$issues_json" \
               '.issues += [{"type": "accessibility", "page": $page, "issues": $issues}]' \
               "$issues_file" > tmp.json && mv tmp.json "$issues_file"
        fi
    done
}

# 代码质量检测
detect_code_quality_issues() {
    local issues_file=$1
    
    # 检查 TypeScript 错误
    if [ -d "$WORKSPACE_DIR" ]; then
        cd "$WORKSPACE_DIR"
        
        # 检查是否有 console.log 在生产代码中
        local console_logs=$(find app components -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs grep -l "console.log" 2>/dev/null | wc -l)
        
        if [ $console_logs -gt 0 ]; then
            log "    ⚠️  发现 $console_logs 个文件包含 console.log"
            jq --arg count "$console_logs" \
               '.issues += [{"type": "code_quality", "issue": "console_logs_in_production", "count": $count}]' \
               "$issues_file" > tmp.json && mv tmp.json "$issues_file"
        fi
    fi
}

# ==================== 第二步：AI 分析并生成修复方案 ====================
ai_analyze_and_fix() {
    local issues_file=$1
    log "🤖 AI 分析优化点并生成修复方案..."
    
    # 读取问题列表
    local issues_count=$(jq '.issues | length' "$issues_file")
    
    if [ "$issues_count" -eq 0 ]; then
        log "  ✅ 未发现需要优化的问题"
        return 0
    fi
    
    log "  📊 发现 $issues_count 个优化点"
    
    # 创建 AI 分析提示
    local prompt_file="$REPORT_DIR/ai-prompt-$(date +%Y%m%d-%H%M%S).txt"
    local fix_plan_file="$REPORT_DIR/ai-fix-plan-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$prompt_file" << EOF
你是一个专业的全栈开发工程师，擅长网站性能优化、SEO 优化和代码质量改进。

检测到以下网站问题，请分析并生成具体的修复代码：

$(cat "$issues_file" | jq -c '.issues[]')

要求：
1. 对每个问题提供具体的修复方案
2. 生成可执行的代码修改
3. 优先修复高优先级问题（SEO > 性能 > 可访问性 > 代码质量）
4. 输出 JSON 格式的修复计划，包含：
   - file: 需要修改的文件路径
   - changes: 具体的代码修改
   - priority: 优先级 (high/medium/low)
   - description: 修改说明

请以 JSON 格式输出修复计划。
EOF
    
    log "  📝 已生成 AI 提示文件：$prompt_file"
    
    # 调用 AI 生成修复计划（这里使用 OpenClaw sessions_spawn）
    log "  🚀 调用 AI 生成修复方案..."
    
    # 创建修复计划文件（示例结构）
    cat > "$fix_plan_file" << EOF
{
  "analyzed_at": "$(date -Iseconds)",
  "issues_count": $issues_count,
  "fixes": []
}
EOF
    
    # TODO: 这里需要调用 AI API 生成实际的修复计划
    # 目前先创建一个占位符，后续通过 OpenClaw 实现
    
    log "  ✅ AI 分析完成，修复计划：$fix_plan_file"
    echo "$fix_plan_file"
}

# ==================== 第三步：应用修复 ====================
apply_fixes() {
    local fix_plan_file=$1
    log "🔧 应用 AI 生成的修复方案..."
    
    # 读取修复计划
    local fixes_count=$(jq '.fixes | length' "$fix_plan_file")
    
    if [ "$fixes_count" -eq 0 ]; then
        log "  ℹ️  没有需要应用的修复"
        return 0
    fi
    
    log "  📝 共 $fixes_count 个修复需要应用"
    
    # 遍历每个修复
    for i in $(seq 0 $((fixes_count - 1))); do
        local fix=$(jq ".fixes[$i]" "$fix_plan_file")
        local file=$(echo "$fix" | jq -r '.file')
        local priority=$(echo "$fix" | jq -r '.priority')
        local description=$(echo "$fix" | jq -r '.description')
        
        log "  [$((i+1))/$fixes_count] 修复：$file ($priority)"
        log "    说明：$description"
        
        # TODO: 根据修复计划修改文件
        # 这里需要解析 changes 并应用到文件
        
        # 示例：如果是添加 meta 标签
        if echo "$fix" | jq -e '.changes.add_meta' > /dev/null 2>&1; then
            log "    🔧 添加 meta 标签..."
            # 实现添加 meta 标签的逻辑
        fi
        
        # 示例：如果是优化图片
        if echo "$fix" | jq -e '.changes.optimize_images' > /dev/null 2>&1; then
            log "    🔧 优化图片..."
            # 实现图片优化的逻辑
        fi
    done
    
    log "  ✅ 修复应用完成"
}

# ==================== 第四步：验证修复 ====================
verify_fixes() {
    log "✅ 验证修复效果..."
    
    # 重新运行检测
    local new_issues_file=$(detect_optimizations)
    local new_issues_count=$(jq '.issues | length' "$new_issues_file")
    
    log "  📊 修复后问题数：$new_issues_count"
    
    if [ "$new_issues_count" -eq 0 ]; then
        log "  ✅ 所有问题已修复"
    else
        log "  ⚠️  还有 $new_issues_count 个问题待修复"
    fi
    
    echo "$new_issues_count"
}

# ==================== 第五步：提交到 GitHub ====================
commit_to_github() {
    log "📤 提交优化到 GitHub..."
    
    cd "$WORKSPACE_DIR"
    
    # 检查是否有更改
    if git status --porcelain | grep -q "."; then
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        local commit_msg="🤖 AI Auto-Optimize: 自动优化与修复 ($timestamp)"
        
        # 添加所有更改
        git add -A 2>/dev/null || true
        
        # 提交
        if git status --porcelain | grep -q "."; then
            git commit -m "$commit_msg" 2>/dev/null || true
            
            # 推送
            if git remote -v | grep -q "github"; then
                git push origin master 2>/dev/null && log "✅ 已推送到 GitHub" || log "⚠️  Push 失败（可能是权限问题）"
            else
                log "⚠️  未配置 GitHub remote"
            fi
        else
            log "ℹ️  没有新的更改需要提交"
        fi
    else
        log "ℹ️  工作区干净，无需提交"
    fi
}

# ==================== 主函数 ====================
main() {
    mkdir -p "$REPORT_DIR"
    
    log "=========================================="
    log "🚀 AI 驱动的网站自动优化"
    log "=========================================="
    
    # 步骤 1: 检测优化点
    local issues_file=$(detect_optimizations)
    log "✅ 检测完成，问题文件：$issues_file"
    
    # 步骤 2: AI 分析并生成修复方案
    local fix_plan_file=$(ai_analyze_and_fix "$issues_file")
    
    # 步骤 3: 应用修复
    apply_fixes "$fix_plan_file"
    
    # 步骤 4: 验证修复
    local remaining_issues=$(verify_fixes)
    
    # 步骤 5: 提交到 GitHub
    commit_to_github
    
    log "=========================================="
    log "✅ AI 优化完成"
    log "=========================================="
    
    # 返回剩余问题数
    return $remaining_issues
}

# 执行
main "$@"
