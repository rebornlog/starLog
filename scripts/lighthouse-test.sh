#!/bin/bash
# lighthouse-test.sh - Lighthouse 性能测试脚本
# 集成到 25 分钟定时任务中

set -e

WORKSPACE_DIR="/home/admin/.openclaw/workspace/starLog"
REPORT_DIR="$WORKSPACE_DIR/test-reports"
LIGHTHOUSE_LOG="/tmp/lighthouse-test.log"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LIGHTHOUSE_LOG"
}

# 测试单个 URL
test_url() {
    local url=$1
    local output_name=$2
    
    log "测试：$url"
    
    # 运行 Lighthouse
    npx -y lighthouse "$url" \
        --output json \
        --output-path "$REPORT_DIR/lighthouse-${output_name}-$(date +%Y%m%d-%H%M%S).json" \
        --output html \
        --chrome-flags="--headless --no-sandbox" \
        --quiet \
        --throttling.cpuSlowdownMultiplier=1 \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ Lighthouse 测试完成${NC}"
        return 0
    else
        log "${RED}❌ Lighthouse 测试失败${NC}"
        return 1
    fi
}

# 生成 HTML 报告
generate_html_report() {
    local json_files=$(ls -t "$REPORT_DIR"/lighthouse-*.json 2>/dev/null | head -5)
    
    if [ -z "$json_files" ]; then
        log "无 Lighthouse 数据，跳过 HTML 报告"
        return 0
    fi
    
    log "生成 Lighthouse HTML 报告..."
    
    cat > "$REPORT_DIR/lighthouse-summary-$(date +%Y-%m-%d).html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Lighthouse 性能报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .good { background: #d4edda; }
        .warning { background: #fff3cd; }
        .bad { background: #f8d7da; }
    </style>
</head>
<body>
    <h1>Lighthouse 性能报告</h1>
    <p>自动生成 - 每 25 分钟更新</p>
    <div id="results"></div>
    <script>
        // 动态加载最新结果
        fetch('lighthouse-latest.json')
            .then(r => r.json())
            .then(data => {
                const categories = data.categories;
                let html = '';
                for (const [key, value] of Object.entries(categories)) {
                    const score = Math.round(value.score * 100);
                    let cls = score >= 90 ? 'good' : score >= 50 ? 'warning' : 'bad';
                    html += `<div class="metric ${cls}"><strong>${key}:</strong> ${score}/100</div>`;
                }
                document.getElementById('results').innerHTML = html;
            });
    </script>
</body>
</html>
EOF

    log "HTML 报告已生成"
}

# 主函数
main() {
    mkdir -p "$REPORT_DIR"
    
    log "=========================================="
    log "💡 开始 Lighthouse 性能测试"
    log "=========================================="
    
    # 测试关键页面
    local urls=(
        "http://localhost:3000|home"
        "http://localhost:3000/funds|funds"
        "http://localhost:3000/stocks|stocks"
        "http://localhost:3000/blog|blog"
    )
    
    local passed=0
    local failed=0
    
    for url_info in "${urls[@]}"; do
        local url=$(echo "$url_info" | cut -d'|' -f1)
        local name=$(echo "$url_info" | cut -d'|' -f2)
        
        if test_url "$url" "$name"; then
            ((passed++))
        else
            ((failed++))
        fi
        
        # 避免请求过快
        sleep 2
    done
    
    # 生成 HTML 报告
    generate_html_report
    
    log "=========================================="
    log "📊 Lighthouse 测试完成"
    log "通过：$passed, 失败：$failed"
    log "=========================================="
    
    if [ $failed -gt 0 ]; then
        exit 1
    fi
}

main "$@"
