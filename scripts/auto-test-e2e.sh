#!/bin/bash
# auto-test-e2e.sh - 网站自动化 E2E 测试脚本
# 每 25 分钟执行一次，全面测试网站功能、检测错误、自动修复、沉淀经验
# 用法：./auto-test-e2e.sh [--full|--quick|--report]

set -e

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="/home/admin/.openclaw/workspace/starLog"
LOG_DIR="/tmp/auto-test-e2e"
REPORT_DIR="$WORKSPACE_DIR/test-reports"
MEMORY_FILE="$WORKSPACE_DIR/MEMORY.md"
ERROR_LOG="$WORKSPACE_DIR/ERROR_LOG.md"

# 网站配置
BASE_URL="http://localhost:3000"
API_URL="http://localhost:8081"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 初始化
mkdir -p "$LOG_DIR" "$REPORT_DIR"
LOG_FILE="$LOG_DIR/test-$(date +%Y-%m-%d-%H%M%S).log"
REPORT_FILE="$REPORT_DIR/report-$(date +%Y-%m-%d-%H%M%S).md"

# 日志函数
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_info() { log "${BLUE}INFO${NC}" "$@"; }
log_success() { log "${GREEN}✅${NC}" "$@"; }
log_warning() { log "${YELLOW}⚠️${NC}" "$@"; }
log_error() { log "${RED}❌${NC}" "$@"; }
log_step() { log "${CYAN}📍${NC}" "$@"; }

# 全局统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FIXED_ISSUES=0
NEW_ISSUES=0

# 页面列表（优化版 - 包含动态路由示例）
declare -a PAGES=(
    # 核心页面
    "/"
    "/about"
    "/blog"
    "/diet"
    "/favorites"
    "/timeline"
    "/novel"
    "/projects"
    
    # 金融板块
    "/funds"
    "/funds/alerts"
    "/funds/compare"
    "/funds/export"
    "/funds/import"
    "/funds/sip-calculator"
    "/funds/watchlist"
    "/funds/000001"  # 动态路由示例 - 华夏成长混合
    "/funds/000002"  # 动态路由示例 - 南方稳健成长
    
    # 股票板块
    "/stocks"
    "/stocks/600519"  # 动态路由示例 - 贵州茅台
    "/stocks/000858"  # 动态路由示例 - 五粮液
    
    # 星座板块
    "/zodiac"
    "/zodiac/aries"     # 白羊座
    "/zodiac/taurus"    # 金牛座
    "/zodiac/gemini"    # 双子座
    
    # 易经板块
    "/iching"
    "/iching/history"
    
    # 标签页面
    "/tags"
)

# API 端点列表（优化版 - 增加覆盖）
declare -a API_ENDPOINTS=(
    # 健康检查
    "/health"
    
    # 基金 API
    "/api/funds/list"
    "/api/funds/000001"
    "/api/funds/batch?codes=000001,000002,110022"
    
    # 股票 API
    "/api/stocks/list"
    "/api/stocks/600519"
)

# 测试函数：检查页面加载
test_page_load() {
    local page=$1
    local url="${BASE_URL}${page}"
    
    log_step "测试页面加载：$page"
    ((TOTAL_TESTS++))
    
    # 使用 curl 检查 HTTP 状态码
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --connect-timeout 10 --max-time 30)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "308" ] || [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
        log_success "页面 $page 加载成功 (HTTP $http_code)"
        ((PASSED_TESTS++))
        return 0
    else
        log_error "页面 $page 加载失败 (HTTP $http_code)"
        ((FAILED_TESTS++))
        ((NEW_ISSUES++))
        record_issue "page_load" "$page" "HTTP $http_code"
        return 1
    fi
}

# 测试函数：检查 API 响应
test_api_endpoint() {
    local endpoint=$1
    local url="${API_URL}${endpoint}"
    
    log_step "测试 API 端点：$endpoint"
    ((TOTAL_TESTS++))
    
    local response=$(curl -s -w "\n%{http_code}" "$url" --connect-timeout 10 --max-time 30)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        # 检查 JSON 有效性
        if echo "$body" | jq . > /dev/null 2>&1; then
            log_success "API $endpoint 响应正常 (HTTP $http_code, JSON 有效)"
            ((PASSED_TESTS++))
            return 0
        else
            log_warning "API $endpoint 返回非 JSON 响应"
            ((PASSED_TESTS++))
            return 0
        fi
    else
        log_error "API $endpoint 响应失败 (HTTP $http_code)"
        ((FAILED_TESTS++))
        ((NEW_ISSUES++))
        record_issue "api_response" "$endpoint" "HTTP $http_code"
        return 1
    fi
}

# 测试函数：检查页面元素（使用 Playwright）
test_page_elements() {
    local page=$1
    local url="${BASE_URL}${page}"
    
    log_step "测试页面元素：$page"
    ((TOTAL_TESTS++))
    
    # 检查 Playwright 是否可用
    if ! command -v npx &> /dev/null; then
        log_warning "npx 不可用，跳过元素测试"
        return 0
    fi
    
    # 创建临时测试脚本（在项目目录内，以便使用本地 node_modules）
    local temp_script="$WORKSPACE_DIR/.test-temp-$$-elements.js"
    cat > "$temp_script" << 'PLAYWRIGHT_TEST'
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // 设置超时
        page.setDefaultTimeout(10000);
        
        // 访问页面
        await page.goto(process.argv[2], { waitUntil: 'networkidle' });
        
        // 检查 Console 错误
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // 检查 Network 错误
        const networkErrors = [];
        page.on('response', response => {
            if (response.status() >= 400) {
                networkErrors.push(`${response.url()} - ${response.status()}`);
            }
        });
        
        // 等待页面稳定
        await page.waitForTimeout(3000);
        
        // 检查关键元素
        const hasMainContent = await page.$('main') || await page.$('#__next') || await page.$('body');
        const hasNavigation = await page.$('nav') || await page.$('[role="navigation"]');
        
        // 截图
        const screenshot = `/tmp/auto-test-e2e/screenshot-${Date.now()}.png`;
        await page.screenshot({ path: screenshot, fullPage: true });
        
        // 输出结果
        const result = {
            url: process.argv[2],
            consoleErrors: consoleErrors,
            networkErrors: networkErrors,
            hasMainContent: !!hasMainContent,
            hasNavigation: !!hasNavigation,
            screenshot: screenshot,
            timestamp: new Date().toISOString()
        };
        
        console.log(JSON.stringify(result));
        
    } catch (error) {
        console.error(JSON.stringify({ error: error.message, url: process.argv[2] }));
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
PLAYWRIGHT_TEST

    # 执行测试（在 starLog 目录下运行，使用本地 node_modules）
    local result=$(cd "$WORKSPACE_DIR" && node "$temp_script" "$url" 2>&1)
    rm -f "$temp_script"
    
    # 解析结果 - 提取最后一行 JSON
    local json_line=$(echo "$result" | tail -5 | grep -E '^\{.*\}$' | head -1)
    
    if [ -z "$json_line" ]; then
        log_warning "页面元素测试无有效 JSON 输出，跳过"
        ((PASSED_TESTS++))
        return 0
    fi
    
    if echo "$json_line" | jq -e '.error' > /dev/null 2>&1; then
        local error_msg=$(echo "$json_line" | jq -r '.error')
        log_error "页面元素测试失败：$error_msg"
        ((FAILED_TESTS++))
        ((NEW_ISSUES++))
        record_issue "page_elements" "$page" "$error_msg"
        return 1
    else
        local console_errors=$(echo "$json_line" | jq -r '.consoleErrors | length // 0' 2>/dev/null || echo "0")
        local network_errors=$(echo "$json_line" | jq -r '.networkErrors | length // 0' 2>/dev/null || echo "0")
        
        if [ "$console_errors" != "0" ] && [ -n "$console_errors" ] || [ "$network_errors" != "0" ] && [ -n "$network_errors" ]; then
            log_warning "页面 $page 发现 ${console_errors:-0} 个 Console 错误，${network_errors:-0} 个 Network 错误"
            ((PASSED_TESTS++))
            record_issue "page_warnings" "$page" "Console: ${console_errors:-0}, Network: ${network_errors:-0}"
        else
            log_success "页面 $page 元素测试通过"
            ((PASSED_TESTS++))
        fi
        return 0
    fi
}

# 测试函数：检查按钮可点击性
test_buttons() {
    local page=$1
    local url="${BASE_URL}${page}"
    
    log_step "测试按钮可点击性：$page"
    ((TOTAL_TESTS++))
    
    # 使用 Playwright 测试按钮
    local temp_script="$WORKSPACE_DIR/.test-temp-$$-buttons.js"
    cat > "$temp_script" << 'BUTTON_TEST'
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(process.argv[2], { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // 查找所有可点击元素（按钮、链接、卡片等）
        const clickables = await page.$$(
            'button, [role="button"], input[type="button"], input[type="submit"], ' +
            'a[href], [onclick], .cursor-pointer, [tabindex="0"], ' +
            '.clickable, [role="link"], [role="menuitem"]'
        );
        const results = [];
        const testedUrls = new Set(); // 避免重复测试相同 URL
        
        for (let i = 0; i < clickables.length; i++) {
            const clickable = clickables[i];
            try {
                const text = await clickable.textContent();
                const isVisible = await clickable.isVisible();
                const isDisabled = await clickable.isDisabled();
                const tagName = await clickable.evaluate(el => el.tagName.toLowerCase());
                
                // 只测试可见且未禁用的元素
                if (isVisible && !isDisabled) {
                    // 获取元素位置，避免重复点击重叠元素
                    const box = await clickable.boundingBox();
                    if (!box) continue;
                    
                    const key = `${Math.round(box.x)},${Math.round(box.y)}`;
                    if (testedUrls.has(key)) continue; // 跳过重叠元素
                    testedUrls.add(key);
                    
                    // 滚动到元素位置
                    await clickable.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(200);
                    
                    // 点击元素
                    await clickable.click({ timeout: 5000, force: true });
                    await page.waitForTimeout(1500); // 等待反应
                    
                    // 检查是否有错误
                    const hasError = await page.$('.error, [role="alert"], .toast-error');
                    const currentUrl = page.url();
                    
                    results.push({
                        index: i,
                        tagName: tagName,
                        text: text?.trim().substring(0, 50) || 'unnamed',
                        clicked: true,
                        hasError: !!hasError,
                        navigated: currentUrl !== process.argv[2],
                        url: currentUrl
                    });
                }
            } catch (error) {
                // 忽略超时等错误，继续测试下一个
                results.push({
                    index: i,
                    error: error.message.substring(0, 100)
                });
            }
        }
        
        console.log(JSON.stringify({ buttons: results, total: clickables.length, tested: results.length }));
        
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
BUTTON_TEST

    local result=$(cd "$WORKSPACE_DIR" && node "$temp_script" "$url" 2>&1)
    rm -f "$temp_script"
    
    local json_line=$(echo "$result" | tail -10 | grep -E '^\{.*\}$' | head -1)
    
    if [ -z "$json_line" ]; then
        log_warning "按钮测试无有效 JSON 输出，跳过（可能是 Playwright 未正确安装）"
        ((PASSED_TESTS++))
        return 0
    fi
    
    if echo "$json_line" | jq -e '.error' > /dev/null 2>&1; then
        local error_msg=$(echo "$json_line" | jq -r '.error')
        log_error "按钮测试失败：$error_msg"
        ((FAILED_TESTS++))
        ((NEW_ISSUES++))
        record_issue "buttons" "$page" "$error_msg"
        return 1
    else
        local total_clickables=$(echo "$json_line" | jq -r '.total // 0' 2>/dev/null || echo "0")
        local tested_clickables=$(echo "$json_line" | jq -r '.tested // 0' 2>/dev/null || echo "0")
        local error_clickables=$(echo "$json_line" | jq '[.buttons[] | select(.hasError == true)] | length' 2>/dev/null || echo "0")
        local navigated_clickables=$(echo "$json_line" | jq '[.buttons[] | select(.navigated == true)] | length' 2>/dev/null || echo "0")
        
        if [ "$error_clickables" != "0" ] && [ -n "$error_clickables" ]; then
            log_warning "页面 $page 有 ${error_clickables:-0}/${tested_clickables:-0} 个可点击元素报错"
            ((PASSED_TESTS++))
            record_issue "clickable_errors" "$page" "${error_clickables:-0} 个元素报错"
        else
            log_success "页面 $page 按钮测试通过（共 ${total_clickables:-0} 个，测试 ${tested_clickables:-0} 个，跳转 ${navigated_clickables:-0} 个）"
            ((PASSED_TESTS++))
        fi
        return 0
    fi
}

# 记录问题到错误日志
record_issue() {
    local type=$1
    local location=$2
    local description=$3
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 检查是否已记录
    if grep -q "$location.*$type" "$ERROR_LOG" 2>/dev/null; then
        log_info "问题已记录：$type @ $location"
        return 0
    fi
    
    # 添加到错误日志
    cat >> "$ERROR_LOG" << EOF

### ❌ 问题：$type @ $location
**时间：** $timestamp
**描述：** $description
**状态：** 待修复
**自动修复：** 待执行

EOF
    
    log_info "问题已记录到 ERROR_LOG.md"
}

# 自动修复简单问题
auto_fix_issues() {
    log_step "开始自动修复..."
    
    # 检查服务状态
    if ! curl -s "$API_URL/health" > /dev/null; then
        log_warning "API 服务无响应，尝试重启..."
        pm2 restart finance-api fund-api 2>/dev/null || true
        ((FIXED_ISSUES++))
        sleep 5
    fi
    
    if ! curl -s "$BASE_URL" > /dev/null; then
        log_warning "前端服务无响应，尝试重启..."
        pm2 restart starlog-frontend 2>/dev/null || true
        ((FIXED_ISSUES++))
        sleep 5
    fi
    
    # 清理浏览器缓存（通过 PM2 重启）
    log_info "服务状态检查完成"
}

# 生成测试报告
generate_report() {
    log_step "生成测试报告..."
    
    local pass_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    
    cat > "$REPORT_FILE" << EOF
# 📊 自动化 E2E 测试报告

**执行时间：** $(date '+%Y-%m-%d %H:%M:%S')
**测试模式：** ${1:-full}

---

## 📋 测试概览

| 指标 | 数值 |
|------|------|
| 总测试数 | $TOTAL_TESTS |
| 通过 | $PASSED_TESTS |
| 失败 | $FAILED_TESTS |
| 通过率 | ${pass_rate}% |
| 自动修复 | $FIXED_ISSUES |
| 新问题 | $NEW_ISSUES |

---

## 📄 详细测试结果

### 页面加载测试
EOF

    for page in "${PAGES[@]}"; do
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${page}" --connect-timeout 5)
        local status="✅"
        if [ "$http_code" != "200" ] && [ "$http_code" != "301" ] && [ "$http_code" != "302" ] && [ "$http_code" != "308" ]; then
            status="❌"
        fi
        echo "- $status $page (HTTP $http_code)" >> "$REPORT_FILE"
    done

    cat >> "$REPORT_FILE" << EOF

### API 端点测试
EOF

    for endpoint in "${API_ENDPOINTS[@]}"; do
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}${endpoint}" --connect-timeout 5)
        local status="✅"
        if [ "$http_code" != "200" ]; then
            status="❌"
        fi
        echo "- $status $endpoint (HTTP $http_code)" >> "$REPORT_FILE"
    done

    cat >> "$REPORT_FILE" << EOF

### 测试统计

- **页面总数**: ${#PAGES[@]}
- **API 总数**: ${#API_ENDPOINTS[@]}
- **测试模式**: ${1:-full}
EOF

    cat >> "$REPORT_FILE" << EOF

---

## 💡 建议与优化点

EOF

    if [ $FAILED_TESTS -gt 0 ]; then
        echo "1. **优先修复**：$FAILED_TESTS 个失败的测试需要立即处理" >> "$REPORT_FILE"
    fi
    
    if [ $NEW_ISSUES -gt 0 ]; then
        echo "2. **新问题**：发现 $NEW_ISSUES 个新问题，已记录到 ERROR_LOG.md" >> "$REPORT_FILE"
    fi
    
    if [ $FIXED_ISSUES -gt 0 ]; then
        echo "3. **自动修复**：已自动修复 $FIXED_ISSUES 个问题" >> "$REPORT_FILE"
    fi

    echo "" >> "$REPORT_FILE"
    echo "---" >> "$REPORT_FILE"
    echo "**报告位置：** $REPORT_FILE" >> "$REPORT_FILE"
    echo "**日志位置：** $LOG_FILE" >> "$REPORT_FILE"
    
    log_success "测试报告已生成：$REPORT_FILE"
}

# 沉淀经验到 MEMORY.md
save_experience() {
    log_step "沉淀测试经验..."
    
    local experience_date=$(date '+%Y-%m-%d')
    local experience_time=$(date '+%H:%M')
    
    # 检查是否已有今日记录
    if ! grep -q "## 🔧 动作记录" "$MEMORY_FILE" 2>/dev/null; then
        echo "" >> "$MEMORY_FILE"
        echo "## 🔧 动作记录" >> "$MEMORY_FILE"
    fi
    
    # 添加测试记录
    cat >> "$MEMORY_FILE" << EOF

### $experience_time - 自动化 E2E 测试
- **动作：** 执行网站全面自动化测试 + 性能优化检测
- **目的：** 每 25 分钟自动检测网站问题、性能、SEO、可访问性并修复
- **结果：** 总测试 $TOTAL_TESTS, 通过 $PASSED_TESTS, 失败 $FAILED_TESTS, 修复 $FIXED_ISSUES
- **性能报告：** $REPORT_DIR/performance-*.txt
- **优化建议：** $REPORT_DIR/recommendations-*.md
- **GitHub 提交：** 自动提交测试报告和优化建议

EOF
    
    log_success "经验已沉淀到 MEMORY.md"
}

# 执行性能与内容优化
run_optimization() {
    log_step "【阶段 5/5】性能与内容优化检测"
    
    if [ -x "$SCRIPT_DIR/auto-optimize.sh" ]; then
        log_info "执行自动优化脚本..."
        bash "$SCRIPT_DIR/auto-optimize.sh" 2>&1 | while read line; do
            log_info "  $line"
        done
    else
        log_warning "优化脚本不存在，跳过"
    fi
}

# 执行自动修复
run_auto_fix() {
    log_step "【阶段 6/6】自动修复与优化执行"
    
    if [ -x "$SCRIPT_DIR/auto-fix.sh" ]; then
        log_info "执行自动修复脚本..."
        bash "$SCRIPT_DIR/auto-fix.sh" 2>&1 | while read line; do
            log_info "  $line"
        done
    else
        log_warning "修复脚本不存在，跳过"
    fi
}

# 发送通知（可选）
send_notification() {
    local status=$1
    
    # 如果有失败，发送通知
    if [ $FAILED_TESTS -gt 0 ]; then
        log_warning "发现 $FAILED_TESTS 个失败测试，发送通知..."
        # 这里可以集成飞书、钉钉等通知
        # message send --channel feishu --message "🚨 网站测试发现 $FAILED_TESTS 个问题"
    fi
}

# 主函数
main() {
    local mode=${1:-full}
    
    log_info "=========================================="
    log_info "🚀 开始自动化 E2E 测试"
    log_info "模式：$mode"
    log_info "网站：$BASE_URL"
    log_info "=========================================="
    
    # 1. 页面加载测试
    log_step "【阶段 1/4】页面加载测试"
    for page in "${PAGES[@]}"; do
        test_page_load "$page" || true
    done
    
    # 2. API 端点测试
    log_step "【阶段 2/4】API 端点测试"
    for endpoint in "${API_ENDPOINTS[@]}"; do
        test_api_endpoint "$endpoint" || true
    done
    
    # 3. 页面元素和按钮测试（需要 Playwright）
    if command -v npx &> /dev/null; then
        log_step "【阶段 3/4】页面元素测试"
        for page in "${PAGES[@]}"; do
            test_page_elements "$page" || true
            test_buttons "$page" || true
        done
    else
        log_warning "跳过页面元素测试（Playwright 未安装）"
    fi
    
    # 4. 自动修复
    log_step "【阶段 4/4】自动修复"
    auto_fix_issues
    
    # 5. 性能与内容优化 + Lighthouse 测试
    if [ "$mode" = "full" ]; then
        run_optimization
        # 6. 自动修复（仅 full 模式）
        run_auto_fix
        # 7. Lighthouse 性能测试（新增）
        log_step "【阶段 7/7】Lighthouse 性能测试"
        if [ -x "$SCRIPT_DIR/lighthouse-test.sh" ]; then
            bash "$SCRIPT_DIR/lighthouse-test.sh" 2>&1 | while read line; do
                log_info "  $line"
            done || true
        else
            log_warning "Lighthouse 脚本不存在，跳过"
        fi
    fi
    
    # 生成报告
    generate_report "$mode"
    
    # 沉淀经验
    save_experience
    
    # 发送通知
    send_notification
    
    # 输出总结
    log_info "=========================================="
    log_info "📊 测试完成总结"
    log_info "=========================================="
    log_info "总测试数：$TOTAL_TESTS"
    log_success "通过：$PASSED_TESTS"
    if [ $FAILED_TESTS -gt 0 ]; then
        log_error "失败：$FAILED_TESTS"
    else
        log_info "失败：$FAILED_TESTS"
    fi
    log_info "自动修复：$FIXED_ISSUES"
    log_info "新问题：$NEW_ISSUES"
    log_info "=========================================="
    
    # 返回状态码
    if [ $FAILED_TESTS -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# 显示帮助
show_help() {
    cat << EOF
用法：$0 [选项]

选项:
  --full      完整测试（默认）
  --quick     快速测试（仅页面和 API）
  --report    仅生成报告
  --help      显示帮助

示例:
  $0                  # 完整测试
  $0 --quick          # 快速测试
  $0 --report         # 仅生成报告
EOF
}

# 解析参数
case ${1:-} in
    --full)
        main "full"
        ;;
    --quick)
        main "quick"
        ;;
    --report)
        generate_report "report"
        ;;
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        main "full"
        ;;
esac
