#!/bin/bash
# performance-check.sh - 性能检查脚本
# 用法：./performance-check.sh [--lighthouse|--api|--report]

LOG_FILE="/tmp/performance-check.log"
FRONTEND_URL="http://localhost:3000"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Lighthouse 检查
check_lighthouse() {
    log "🔍 运行 Lighthouse 检查..."
    
    if ! command -v lighthouse &> /dev/null; then
        log "⚠️  Lighthouse 未安装，尝试使用 npx..."
        npx -y lighthouse $FRONTEND_URL --output json --output-path /tmp/lighthouse-report.json --quiet 2>/dev/null
    else
        lighthouse $FRONTEND_URL --output json --output-path /tmp/lighthouse-report.json --quiet 2>/dev/null
    fi
    
    if [ -f /tmp/lighthouse-report.json ]; then
        log "✅ Lighthouse 检查完成"
        
        # 提取关键指标
        performance=$(cat /tmp/lighthouse-report.json | grep -o '"performance":[0-9.]*' | head -1 | cut -d: -f2)
        accessibility=$(cat /tmp/lighthouse-report.json | grep -o '"accessibility":[0-9.]*' | head -1 | cut -d: -f2)
        best_practices=$(cat /tmp/lighthouse-report.json | grep -o '"best-practices":[0-9.]*' | head -1 | cut -d: -f2)
        seo=$(cat /tmp/lighthouse-report.json | grep -o '"seo":[0-9.]*' | head -1 | cut -d: -f2)
        
        echo ""
        echo "📊 Lighthouse 评分:"
        echo "  - Performance:      $performance"
        echo "  - Accessibility:    $accessibility"
        echo "  - Best Practices:   $best_practices"
        echo "  - SEO:              $seo"
        echo ""
        
        # 判断是否合格
        if (( $(echo "$performance < 80" | bc -l 2>/dev/null || echo 0) )); then
            log "⚠️  Performance 低于 80 分，需要优化"
        fi
    else
        log "❌ Lighthouse 检查失败"
    fi
}

# API 响应时间检查
check_api_response() {
    log "🔍 检查 API 响应时间..."
    
    endpoints=(
        "http://localhost:8081/health"
        "http://localhost:8081/api/funds/list"
        "http://localhost:8081/api/stocks/list"
    )
    
    echo ""
    echo "📊 API 响应时间:"
    
    for endpoint in "${endpoints[@]}"; do
        # 测量 3 次取平均
        total=0
        for i in {1..3}; do
            time_ms=$(curl -s -o /dev/null -w "%{time_total}" $endpoint --connect-timeout 5)
            time_ms_int=$(echo "$time_ms * 1000" | bc 2>/dev/null | cut -d. -f1)
            total=$((total + time_ms_int))
        done
        
        avg=$((total / 3))
        
        if [ $avg -lt 200 ]; then
            echo "  ✅ $endpoint - ${avg}ms"
        elif [ $avg -lt 500 ]; then
            echo "  ⚠️  $endpoint - ${avg}ms (较慢)"
        else
            echo "  ❌ $endpoint - ${avg}ms (很慢)"
        fi
    done
    
    echo ""
}

# 生成报告
generate_report() {
    log "📊 生成性能报告..."
    
    cat << EOF
════════════════════════════════════════
📈 starLog 性能检查报告
🕐 时间：$(date '+%Y-%m-%d %H:%M:%S')
════════════════════════════════════════

EOF

    check_lighthouse
    check_api_response
    
    cat << EOF
💡 优化建议:
  1. Performance < 80: 优化图片、减少 JS 包体积
  2. API > 200ms: 检查数据库查询、添加缓存
  3. Accessibility < 90: 添加 alt 文本、ARIA 标签

════════════════════════════════════════
EOF
}

# 主函数
main() {
    case ${1:---report} in
        --lighthouse)
            check_lighthouse
            ;;
        --api)
            check_api_response
            ;;
        --report)
            generate_report
            ;;
        *)
            echo "用法：$0 [--lighthouse|--api|--report]"
            exit 1
            ;;
    esac
}

main "$@"
