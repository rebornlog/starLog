#!/bin/bash
# accessibility-check.sh - 无障碍检测脚本
# 用法：./accessibility-check.sh

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Lighthouse 无障碍检查
check_lighthouse_a11y() {
    log "♿ 运行 Lighthouse 无障碍检查..."
    
    urls=(
        "http://localhost:3000"
        "http://localhost:3000/funds"
        "http://localhost:3000/blog"
    )
    
    results_dir="/tmp/a11y-results"
    mkdir -p $results_dir
    
    for url in "${urls[@]}"; do
        log "  检查：$url"
        
        # 运行 Lighthouse
        if command -v lighthouse &> /dev/null; then
            lighthouse $url \
                --output json \
                --output-path "$results_dir/a11y_$(echo $url | md5sum | cut -d' ' -f1).json" \
                --quiet \
                --only-categories=accessibility \
                --chrome-flags="--headless" 2>/dev/null
            
            if [ $? -eq 0 ]; then
                log "${GREEN}✅ $url 检查完成${NC}"
            else
                log "${RED}❌ $url 检查失败${NC}"
            fi
        else
            log "${YELLOW}⚠️  Lighthouse 未安装${NC}"
            echo "   安装：npm install -g lighthouse"
            return 1
        fi
    done
    
    # 生成报告
    generate_a11y_report $results_dir
}

# 生成无障碍报告
generate_a11y_report() {
    local results_dir=$1
    
    log "📊 生成无障碍报告..."
    
    report_file="$results_dir/accessibility_report_$(date +%Y%m%d).md"
    
    cat << EOF > $report_file
# ♿ 无障碍检测报告

**日期：** $(date '+%Y-%m-%d %H:%M:%S')

---

## 检测页面

EOF

    for json_file in $results_dir/a11y_*.json; do
        if [ -f "$json_file" ]; then
            score=$(cat "$json_file" | grep -o '"score":[0-9.]*' | head -1 | cut -d: -f2)
            url=$(cat "$json_file" | grep -o '"requestedUrl":"[^"]*"' | cut -d'"' -f4)
            
            # 转换分数为百分比
            score_percent=$(echo "$score * 100" | bc 2>/dev/null | cut -d. -f1)
            
            if [ "$score_percent" -ge 90 ]; then
                status="✅ 优秀"
            elif [ "$score_percent" -ge 80 ]; then
                status="⚠️  良好"
            else
                status="❌ 需改进"
            fi
            
            echo "- $url - $score_percent% $status" >> $report_file
        fi
    done
    
    cat << EOF >> $report_file

---

## 常见问题

### 严重问题
- [ ] 图片缺少 alt 文本
- [ ] 表单缺少 label
- [ ] 颜色对比度不足
- [ ] 键盘导航不支持

### 建议改进
- [ ] 添加 ARIA 标签
- [ ] 优化标题层级
- [ ] 增加跳过链接
- [ ] 提供文字替代

---

## 修复指南

### 图片缺少 alt
\`\`\`tsx
// ❌ 错误
<img src="logo.png" />

// ✅ 正确
<img src="logo.png" alt="公司 Logo" />
\`\`\`

### 表单缺少 label
\`\`\`tsx
// ❌ 错误
<input type="text" id="email" />

// ✅ 正确
<label htmlFor="email">邮箱地址</label>
<input type="text" id="email" />
\`\`\`

### 颜色对比度
- 文本与背景对比度至少 4.5:1
- 大文本至少 3:1
- 使用工具检查：https://webaim.org/resources/contrastchecker/

---

**报告位置：** $report_file
EOF

    log "✅ 报告已生成：$report_file"
}

# 主函数
main() {
    case ${1:---check} in
        --check)
            check_lighthouse_a11y
            ;;
        --report)
            generate_a11y_report "/tmp/a11y-results"
            ;;
        --help|*)
            echo "用法：$0 [--check|--report|--help]"
            echo "  --check   运行无障碍检查"
            echo "  --report  生成检测报告"
            echo "  --help    显示帮助"
            exit 0
            ;;
    esac
}

main "$@"
