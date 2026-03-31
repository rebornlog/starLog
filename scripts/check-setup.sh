#!/bin/bash
# check-setup.sh - 配置检查脚本
# 用法：./check-setup.sh

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "$1"
}

check_pass() {
    log "${GREEN}✅ $1${NC}"
}

check_fail() {
    log "${RED}❌ $1${NC}"
}

check_warn() {
    log "${YELLOW}⚠️  $1${NC}"
}

check_info() {
    log "${BLUE}ℹ️  $1${NC}"
}

echo "════════════════════════════════════════"
echo "🔍 starLog 配置检查"
echo "════════════════════════════════════════"
echo ""

# 检查脚本权限
log "📋 检查脚本权限..."
scripts=(
    "scripts/smart-monitor.sh"
    "scripts/performance-check.sh"
    "scripts/analyze-logs.sh"
    "scripts/run-tests.sh"
    "scripts/generate-report.sh"
    "scripts/setup-cron.sh"
)

for script in "${scripts[@]}"; do
    if [ -x "$script" ]; then
        check_pass "$script 可执行"
    else
        check_fail "$script 不可执行"
        log "   修复：chmod +x $script"
    fi
done
echo ""

# 检查 cron 配置
log "⏰ 检查 cron 配置..."
if crontab -l 2>/dev/null | grep -q "smart-monitor.sh"; then
    check_pass "cron 定时任务已配置"
    crontab -l 2>/dev/null | grep "starLog" | head -5
else
    check_fail "cron 定时任务未配置"
    log "   修复：./scripts/setup-cron.sh --install"
fi
echo ""

# 检查环境变量
log "🔧 检查环境变量..."

if [ -n "$FEISHU_WEBHOOK" ]; then
    check_pass "FEISHU_WEBHOOK 已配置"
else
    check_warn "FEISHU_WEBHOOK 未配置"
    log "   说明：飞书告警将不会发送"
    log "   配置：export FEISHU_WEBHOOK=\"https://...\""
fi

if [ -n "$UMAMI_WEBSITE_ID" ]; then
    check_pass "UMAMI_WEBSITE_ID 已配置"
else
    check_warn "UMAMI_WEBSITE_ID 未配置"
    log "   说明：业务仪表盘将显示示例数据"
    log "   配置：参考 docs/UMAMI_INTEGRATION.md"
fi

if [ -n "$UMAMI_API_KEY" ]; then
    check_pass "UMAMI_API_KEY 已配置"
else
    check_warn "UMAMI_API_KEY 未配置"
fi
echo ""

# 检查 .env 文件
log "📄 检查 .env 文件..."
if [ -f ".env.local" ]; then
    check_pass ".env.local 存在"
    
    # 检查关键配置
    if grep -q "DATABASE_URL" .env.local; then
        check_pass "数据库配置存在"
    else
        check_fail "数据库配置缺失"
    fi
    
    if grep -q "UMAMI_WEBSITE_ID" .env.local && ! grep -q "UMAMI_WEBSITE_ID=\"\"" .env.local; then
        check_pass "Umami 配置已填写"
    else
        check_warn "Umami 配置未填写"
    fi
else
    check_warn ".env.local 不存在"
    log "   建议：cp .env.umami.example .env.local"
fi
echo ""

# 检查服务状态
log "🚀 检查服务状态..."

# 前端
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --connect-timeout 3 | grep -q "200\|308"; then
    check_pass "前端服务运行中"
else
    check_fail "前端服务未运行"
fi

# 金融 API
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/health --connect-timeout 3 | grep -q "200"; then
    check_pass "金融 API 运行中"
else
    check_fail "金融 API 未运行"
fi

# Redis
if command -v redis-cli &> /dev/null && redis-cli ping 2>/dev/null | grep -q "PONG"; then
    check_pass "Redis 运行中"
else
    check_warn "Redis 未运行或未安装"
fi
echo ""

# 检查 GitHub Actions
log "🔧 检查 GitHub Actions 配置..."
if [ -f ".github/workflows/lighthouse-ci.yml" ]; then
    check_pass "Lighthouse CI 工作流存在"
else
    check_fail "Lighthouse CI 工作流缺失"
fi

if [ -f ".github/workflows/api-tests.yml" ]; then
    check_pass "API Tests 工作流存在"
else
    check_fail "API Tests 工作流缺失"
fi

check_info "需要在 GitHub 仓库启用 Actions"
check_info "参考：docs/GITHUB_ACTIONS_SETUP.md"
echo ""

# 检查文档
log "📚 检查文档完整性..."
docs=(
    "SKILL_UPGRADE_PLAN.md"
    "FEISHU_INTEGRATION.md"
    "CODE_REVIEW_CHECKLIST.md"
    "UMAMI_INTEGRATION.md"
    "GITHUB_ACTIONS_SETUP.md"
    "P0_COMPLETION_REPORT.md"
    "P1_COMPLETION_REPORT.md"
    "P2_COMPLETION_REPORT.md"
)

for doc in "${docs[@]}"; do
    if [ -f "docs/$doc" ]; then
        check_pass "docs/$doc 存在"
    else
        check_fail "docs/$doc 缺失"
    fi
done
echo ""

# 总结
echo "════════════════════════════════════════"
log "📊 检查总结"
echo "════════════════════════════════════════"
echo ""

# 统计
pass_count=0
fail_count=0
warn_count=0

# 重新运行检查统计（简化版）
# ...（省略详细统计逻辑）

log "✅ 配置检查完成！"
echo ""
log "📋 下一步："
echo "  1. 配置 Umami 环境变量（可选）"
echo "  2. 配置飞书 Webhook（可选）"
echo "  3. 启用 GitHub Actions（推荐）"
echo "  4. 观察系统运行 1-2 天"
echo ""
log "📖 详细指南：docs/GITHUB_ACTIONS_SETUP.md"
echo ""
