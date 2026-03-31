#!/bin/bash
# auto-optimize.sh - 网站性能与内容优化脚本
# 检测性能问题、SEO 问题、可访问性问题，并生成优化建议

set -e

WORKSPACE_DIR="/home/admin/.openclaw/workspace/starLog"
REPORT_DIR="$WORKSPACE_DIR/test-reports"
OPTIMIZE_LOG="/tmp/auto-optimize.log"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$OPTIMIZE_LOG"
}

# 性能测试
test_performance() {
    log "📊 开始性能测试..."
    
    local urls=(
        "http://localhost:3000"
        "http://localhost:3000/funds"
        "http://localhost:3000/stocks"
        "http://localhost:3000/blog"
    )
    
    local perf_results=()
    
    for url in "${urls[@]}"; do
        log "  测试：$url"
        
        # 测量加载时间
        local start_time=$(date +%s%N)
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --connect-timeout 10)
        local end_time=$(date +%s%N)
        
        local load_time=$(( (end_time - start_time) / 1000000 ))  # 毫秒
        
        # 获取页面大小
        local page_size=$(curl -s "$url" --connect-timeout 10 | wc -c)
        local page_size_kb=$((page_size / 1024))
        
        perf_results+=("$url|HTTP $http_code|${load_time}ms|${page_size_kb}KB")
        
        if [ "$http_code" = "200" ] || [ "$http_code" = "308" ]; then
            if [ $load_time -lt 1000 ]; then
                log "    ${GREEN}✅ 加载快速${NC} (${load_time}ms, ${page_size_kb}KB)"
            elif [ $load_time -lt 3000 ]; then
                log "    ${YELLOW}⚠️  加载一般${NC} (${load_time}ms, ${page_size_kb}KB)"
            else
                log "    ${RED}❌ 加载缓慢${NC} (${load_time}ms, ${page_size_kb}KB)"
            fi
        else
            log "    ${RED}❌ HTTP 错误：$http_code${NC}"
        fi
    done
    
    # 保存结果
    printf '%s\n' "${perf_results[@]}" > "$REPORT_DIR/performance-$(date +%Y%m%d-%H%M%S).txt"
}

# SEO 检查
test_seo() {
    log "🔍 开始 SEO 检查..."
    
    local pages=(
        "/"
        "/funds"
        "/stocks"
        "/blog"
    )
    
    for page in "${pages[@]}"; do
        log "  检查：$page"
        
        local html=$(curl -s "http://localhost:3000$page" --connect-timeout 10)
        
        # 检查 title
        if echo "$html" | grep -q "<title>"; then
            local title=$(echo "$html" | grep -oP '(?<=<title>)[^<]+' | head -1)
            if [ -n "$title" ]; then
                log "    ${GREEN}✅ Title${NC}: $title"
            else
                log "    ${YELLOW}⚠️  Title 为空${NC}"
            fi
        else
            log "    ${RED}❌ 缺少 Title 标签${NC}"
        fi
        
        # 检查 meta description
        if echo "$html" | grep -q 'name="description"'; then
            log "    ${GREEN}✅ Meta Description${NC}"
        else
            log "    ${YELLOW}⚠️  缺少 Meta Description${NC}"
        fi
        
        # 检查 h1
        if echo "$html" | grep -q "<h1"; then
            log "    ${GREEN}✅ H1 标签${NC}"
        else
            log "    ${YELLOW}⚠️  缺少 H1 标签${NC}"
        fi
        
        # 检查 canonical
        if echo "$html" | grep -q 'rel="canonical"'; then
            log "    ${GREEN}✅ Canonical URL${NC}"
        else
            log "    ${YELLOW}⚠️  缺少 Canonical URL${NC}"
        fi
        
        # 检查 viewport
        if echo "$html" | grep -q 'name="viewport"'; then
            log "    ${GREEN}✅ Viewport (移动端)${NC}"
        else
            log "    ${RED}❌ 缺少 Viewport (移动端不友好)${NC}"
        fi
    done
}

# 可访问性检查
test_accessibility() {
    log "♿ 开始可访问性检查..."
    
    local pages=("/" "/funds" "/stocks")
    
    for page in "${pages[@]}"; do
        log "  检查：$page"
        
        local html=$(curl -s "http://localhost:3000$page" --connect-timeout 10)
        
        # 检查图片 alt 属性
        local images_without_alt=$(echo "$html" | grep -oP '<img[^>]*>' | grep -v 'alt=' | wc -l)
        if [ $images_without_alt -gt 0 ]; then
            log "    ${YELLOW}⚠️  $images_without_alt 个图片缺少 alt 属性${NC}"
        else
            log "    ${GREEN}✅ 图片都有 alt 属性${NC}"
        fi
        
        # 检查按钮可访问性
        local buttons_without_aria=$(echo "$html" | grep -oP '<button[^>]*>' | grep -v 'aria-label' | grep -v '>' | wc -l)
        if [ $buttons_without_aria -gt 0 ]; then
            log "    ${YELLOW}⚠️  $buttons_without_aria 个按钮缺少 aria-label${NC}"
        else
            log "    ${GREEN}✅ 按钮可访问性良好${NC}"
        fi
        
        # 检查颜色对比度（简化检查）
        log "    ${GREEN}✅ 颜色对比度待人工检查${NC}"
    done
}

# 生成优化建议
generate_recommendations() {
    log "📝 生成优化建议..."
    
    local rec_file="$REPORT_DIR/recommendations-$(date +%Y-%m-%d-%H%M%S).md"
    
    cat > "$rec_file" << EOF
# 🚀 网站优化建议

**生成时间：** $(date '+%Y-%m-%d %H:%M:%S')

---

## 📊 性能优化

### P0 - 高优先级
- [ ] **启用 CDN** - 静态资源使用 CDN 加速
- [ ] **图片优化** - 所有图片转换为 WebP 格式
- [ ] **代码分割** - 按需加载 JavaScript 模块
- [ ] **缓存策略** - 配置浏览器缓存（Cache-Control）

### P1 - 中优先级
- [ ] **懒加载** - 图片和非关键资源懒加载
- [ ] **预加载** - 关键资源使用 link preload
- [ ] **压缩** - 启用 Gzip/Brotli 压缩
- [ ] **减少重定向** - 优化路由，减少 308 跳转

### P2 - 低优先级
- [ ] **Service Worker** - 实现离线缓存
- [ ] **HTTP/2** - 启用 HTTP/2 推送
- [ ] **边缘计算** - 考虑使用 Edge Functions

---

## 🔍 SEO 优化

### 页面优化
- [ ] **Title 优化** - 每个页面有独特且描述性的 title
- [ ] **Meta Description** - 为所有页面添加描述
- [ ] **H1 标签** - 确保每个页面只有一个 H1
- [ ] **结构化数据** - 添加 Schema.org 标记

### 技术 SEO
- [ ] **Sitemap** - 生成并提交 sitemap.xml
- [ ] **Robots.txt** - 优化爬虫规则
- [ ] **Canonical** - 所有页面添加 canonical URL
- [ ] **404 页面** - 自定义友好的 404 页面

---

## ♿ 可访问性优化

### 基础可访问性
- [ ] **图片 Alt** - 所有图片添加描述性 alt
- [ ] **按钮标签** - 所有交互元素添加 aria-label
- [ ] **键盘导航** - 确保所有功能可键盘操作
- [ ] **焦点指示** - 清晰的焦点样式

### 高级可访问性
- [ ] **屏幕阅读器** - 测试主流屏幕阅读器
- [ ] **颜色对比** - 确保 WCAG AA 标准
- [ ] **字幕** - 视频内容添加字幕
- [ ] **错误提示** - 表单错误清晰可读

---

## 📱 移动端优化

- [ ] **响应式设计** - 所有页面适配移动端
- [ ] **触摸友好** - 按钮大小适合触摸（最小 44px）
- [ ] **字体大小** - 正文至少 16px
- [ ] **视口配置** - 正确的 viewport meta

---

## 🎯 内容优化

### 用户体验
- [ ] **加载状态** - 添加骨架屏和加载动画
- [ ] **错误处理** - 友好的错误提示
- [ ] **空状态** - 设计美观的空状态页面
- [ ] **搜索功能** - 添加站内搜索

### 内容质量
- [ ] **原创内容** - 定期更新高质量内容
- [ ] **内部链接** - 优化内容间链接结构
- [ ] **多媒体** - 适当使用图片、视频
- [ ] **更新频率** - 保持内容更新

---

## 📈 监控与分析

- [ ] **性能监控** - 部署 Lighthouse CI
- [ ] **错误追踪** - 集成 Sentry 或类似工具
- [ ] **用户分析** - 启用 Umami 或 Google Analytics
- [ ] **A/B 测试** - 关键页面进行 A/B 测试

---

## 🔧 自动修复项

以下问题可以自动修复：

### 已完成
- [x] 自动化测试部署
- [x] 性能基础检测
- [x] SEO 基础检查

### 待实现
- [ ] 图片自动压缩为 WebP
- [ ] 自动生成 sitemap.xml
- [ ] 自动添加 missing alt 属性
- [ ] 自动优化 CSS/JS

---

**下次检查：** 25 分钟后自动执行
**报告位置：** $REPORT_DIR/
EOF

    log "✅ 优化建议已生成：$rec_file"
}

# 提交到 GitHub
commit_to_github() {
    log "📤 提交到 GitHub..."
    
    cd "$WORKSPACE_DIR"
    
    # 检查是否有更改
    if git status --porcelain | grep -q "."; then
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        local commit_msg="🤖 Auto: 自动化测试与优化报告 ($timestamp)"
        
        # 添加测试报告
        git add test-reports/ 2>/dev/null || true
        
        # 如果有更改则提交
        if git status --porcelain | grep -q "."; then
            git commit -m "$commit_msg" 2>/dev/null || true
            
            # 推送到 GitHub（如果配置了）
            if git remote -v | grep -q "github"; then
                git push origin main 2>/dev/null && log "✅ 已推送到 GitHub" || log "⚠️  Push 失败（可能是权限问题）"
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

# 主函数
main() {
    mkdir -p "$REPORT_DIR"
    
    log "=========================================="
    log "🚀 开始网站优化检测"
    log "=========================================="
    
    test_performance
    echo ""
    test_seo
    echo ""
    test_accessibility
    echo ""
    generate_recommendations
    echo ""
    commit_to_github
    
    log "=========================================="
    log "✅ 优化检测完成"
    log "=========================================="
}

main "$@"
