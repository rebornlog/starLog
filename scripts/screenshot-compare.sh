#!/bin/bash
# screenshot-compare.sh - 截图对比工具
# 用法：./screenshot-compare.sh [--capture|--compare|--help]

SCREENSHOT_DIR="/tmp/screenshots"
mkdir -p $SCREENSHOT_DIR

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 捕获页面截图
capture_screenshots() {
    log "📸 捕获页面截图..."
    
    pages=(
        "/"
        "/funds"
        "/stocks"
        "/blog"
    )
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    
    for page in "${pages[@]}"; do
        filename="screenshot_${timestamp}$(echo $page | tr '/' '_').png"
        
        log "  捕获：$page"
        
        # 使用 Puppeteer 截图（需要安装）
        if command -v puppeteer &> /dev/null; then
            node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000$page', {waitUntil: 'networkidle2'});
  await page.screenshot({path: '$SCREENSHOT_DIR/$filename', fullPage: true});
  await browser.close();
})();" 2>/dev/null
            
            if [ $? -eq 0 ]; then
                log "${GREEN}✅ $page 截图成功${NC}"
            else
                log "${RED}❌ $page 截图失败${NC}"
            fi
        else
            # 备用方案：使用 curl + wkhtmltoimage
            if command -v wkhtmltoimage &> /dev/null; then
                wkhtmltoimage --quality 100 "http://localhost:3000$page" "$SCREENSHOT_DIR/$filename" 2>/dev/null
                log "  使用 wkhtmltoimage 截图"
            else
                log "${YELLOW}⚠️  需要安装 puppeteer 或 wkhtmltoimage${NC}"
            fi
        fi
    done
    
    log "📸 截图保存到：$SCREENSHOT_DIR"
}

# 比较截图（简化版）
compare_screenshots() {
    log "🔍 比较截图..."
    
    # 获取最新的两组截图
    latest=$(ls -t $SCREENSHOT_DIR/screenshot_*.png 2>/dev/null | head -1)
    previous=$(ls -t $SCREENSHOT_DIR/screenshot_*.png 2>/dev/null | head -2 | tail -1)
    
    if [ -z "$latest" ] || [ -z "$previous" ]; then
        log "${YELLOW}⚠️  需要至少两组截图才能比较${NC}"
        return 1
    fi
    
    log "  最新：$latest"
    log "  之前：$previous"
    
    # 使用 ImageMagick 比较
    if command -v compare &> /dev/null; then
        diff_image="$SCREENSHOT_DIR/diff_$(date +%Y%m%d_%H%M%S).png"
        compare -metric AE "$previous" "$latest" "$diff_image" 2>&1
        
        if [ $? -eq 0 ]; then
            log "${GREEN}✅ 截图相同${NC}"
        else
            log "${YELLOW}⚠️  截图有差异${NC}"
            log "  差异图：$diff_image"
        fi
    else
        log "${YELLOW}⚠️  需要安装 ImageMagick 进行比较${NC}"
        echo "   安装：sudo apt-get install imagemagick"
    fi
}

# 生成报告
generate_report() {
    log "📊 生成截图报告..."
    
    report_file="$SCREENSHOT_DIR/screenshot_report_$(date +%Y%m%d).md"
    
    cat << EOF > $report_file
# 📸 截图对比报告

**日期：** $(date '+%Y-%m-%d %H:%M:%S')

---

## 截图列表

EOF

    ls -lh $SCREENSHOT_DIR/screenshot_*.png 2>/dev/null | while read line; do
        echo "- $line" >> $report_file
    done
    
    cat << EOF >> $report_file

---

## 使用说明

1. 部署前截图：\`./screenshot-compare.sh --capture\`
2. 部署后截图：\`./screenshot-compare.sh --capture\`
3. 比较差异：\`./screenshot-compare.sh --compare\`

---

**截图位置：** $SCREENSHOT_DIR
EOF

    log "✅ 报告已生成：$report_file"
}

# 主函数
main() {
    case ${1:---help} in
        --capture)
            capture_screenshots
            ;;
        --compare)
            compare_screenshots
            ;;
        --report)
            generate_report
            ;;
        --help|*)
            echo "用法：$0 [--capture|--compare|--report|--help]"
            echo "  --capture   捕获页面截图"
            echo "  --compare   比较截图差异"
            echo "  --report    生成截图报告"
            echo "  --help      显示帮助"
            exit 0
            ;;
    esac
}

main "$@"
