#!/bin/bash

# starLog 部署前检查清单
# 用法：./deploy-check.sh

set -e

PASS=0
FAIL=0
WARN=0

check_pass() {
    echo "✅ $1"
    PASS=$((PASS + 1))
}

check_fail() {
    echo "❌ $1"
    FAIL=$((FAIL + 1))
}

check_warn() {
    echo "⚠️  $1"
    WARN=$((WARN + 1))
}

echo ""
echo "📋 starLog 部署前检查清单"
echo "========================"
echo ""

# 1. 检查是否在正确的目录
if [ -f "package.json" ] && [ -d "app" ]; then
    check_pass "项目目录正确"
else
    check_fail "不在 starLog 项目目录"
    exit 1
fi

# 2. 检查 Node 版本
NODE_VERSION=$(node -v 2>/dev/null || echo "未知")
echo "ℹ️  Node 版本：$NODE_VERSION"
check_pass "Node.js 已安装"

# 3. 检查依赖是否安装
if [ -d "node_modules" ]; then
    check_pass "依赖已安装 (node_modules 存在)"
else
    check_warn "依赖未安装，运行：yarn install"
fi

# 4. 检查 .env 文件
if [ -f ".env.local" ] || [ -f ".env" ]; then
    check_pass "环境配置文件存在"
else
    check_warn "缺少 .env.local 或 .env 文件"
fi

# 5. 检查生产构建
echo ""
echo "🔨 执行生产构建测试..."
if npm run build > /tmp/build-test.log 2>&1; then
    check_pass "生产构建成功"
else
    check_fail "生产构建失败，查看日志：/tmp/build-test.log"
fi

# 6. 检查 API 路径配置（避免 localhost 硬编码）
echo ""
echo "🔍 检查 API 路径配置..."
LOCALHOST_COUNT=$(grep -r "localhost:8081" app/ 2>/dev/null | wc -l || echo "0")
if [ "$LOCALHOST_COUNT" -gt 0 ]; then
    check_fail "发现 localhost 硬编码 ($LOCALHOST_COUNT 处)"
    echo "   建议：使用相对路径 /api 或环境变量"
else
    check_pass "未发现 localhost 硬编码"
fi

# 7. 检查数据库连接
echo ""
echo "🗄️  检查数据库状态..."
if docker ps | grep -q starlog-db; then
    check_pass "PostgreSQL 容器运行中"
else
    check_warn "PostgreSQL 容器未运行"
fi

# 8. 检查磁盘空间
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    check_pass "磁盘空间充足 (${DISK_USAGE}%)"
else
    check_fail "磁盘空间不足 (${DISK_USAGE}%)"
fi

# 9. 检查内存状态
MEMORY_AVAILABLE=$(free -h | awk 'NR==2 {print $7}' | sed 's/Gi//')
if [ "${MEMORY_AVAILABLE%.*}" -gt 1 ]; then
    check_pass "内存充足 (${MEMORY_AVAILABLE}GB 可用)"
else
    check_warn "内存紧张 (${MEMORY_AVAILABLE}GB 可用)"
fi

# 10. 检查记忆是否更新
echo ""
echo "🧠 检查记忆更新..."
TODAY=$(date +%Y-%m-%d)
if [ -f ~/.openclaw/workspace/memory/${TODAY}.md ]; then
    check_pass "今日记忆文件已创建"
else
    check_warn "今日记忆文件未创建"
fi

# 11. 检查 Git 状态
echo ""
echo "📦 检查 Git 状态..."
if git status --porcelain | grep -q "^ M"; then
    check_warn "有未提交的修改"
    git status --porcelain | head -5 | sed 's/^/   /'
else
    check_pass "Git 工作区干净"
fi

# 12. 检查备份
echo ""
echo "💾 检查备份..."
if [ -d "backups" ] && [ "$(ls -A backups 2>/dev/null)" ]; then
    LATEST_BACKUP=$(ls -t backups | head -1)
    check_pass "存在备份 (最新：$LATEST_BACKUP)"
else
    check_warn "备份目录为空或不存在"
fi

# 总结
echo ""
echo "========================"
echo "📊 检查结果总结"
echo "========================"
echo "通过：$PASS"
echo "警告：$WARN"
echo "失败：$FAIL"
echo ""

if [ $FAIL -gt 0 ]; then
    echo "❌ 部署检查失败！请修复上述问题后再部署。"
    exit 1
elif [ $WARN -gt 0 ]; then
    echo "⚠️  部署检查通过，但有警告项。"
    echo "   建议处理警告项后再部署。"
else
    echo "✅ 部署检查通过！可以安全部署。"
fi

echo ""
