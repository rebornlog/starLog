#!/bin/bash
# test-github-actions.sh - GitHub Actions 本地测试脚本
# 用法：./test-github-actions.sh

echo "🔍 GitHub Actions 本地预检查"
echo "════════════════════════════════════════"
echo ""

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 检查 1：工作流文件
echo "📄 检查工作流文件..."
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
echo ""

# 检查 2：Git 仓库
echo "🔧 检查 Git 仓库..."
if [ -d ".git" ]; then
    check_pass "Git 仓库存在"
    
    # 检查当前分支
    branch=$(git rev-parse --abbrev-ref HEAD)
    echo "   当前分支：$branch"
    
    # 检查远程仓库
    remote=$(git remote get-url origin 2>/dev/null)
    if [ -n "$remote" ]; then
        check_pass "远程仓库已配置"
        echo "   远程地址：$remote"
    else
        check_warn "远程仓库未配置"
        echo "   添加：git remote add origin <your-repo-url>"
    fi
else
    check_fail "不是 Git 仓库"
    echo "   初始化：git init"
fi
echo ""

# 检查 3：Node.js 环境
echo "🟢 检查 Node.js 环境..."
if command -v node &> /dev/null; then
    node_version=$(node -v)
    check_pass "Node.js 已安装 ($node_version)"
else
    check_fail "Node.js 未安装"
fi

if command -v npm &> /dev/null; then
    npm_version=$(npm -v)
    check_pass "npm 已安装 ($npm_version)"
else
    check_fail "npm 未安装"
fi
echo ""

# 检查 4：Python 环境
echo "🐍 检查 Python 环境..."
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version)
    check_pass "Python 已安装 ($python_version)"
else
    check_fail "Python 未安装"
fi

if command -v pytest &> /dev/null; then
    check_pass "pytest 已安装"
else
    check_warn "pytest 未安装（API 测试需要）"
    echo "   安装：cd services/finance && pip install pytest pytest-cov"
fi
echo ""

# 检查 5：Docker（可选）
echo "🐳 检查 Docker（可选）..."
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    check_pass "Docker 已安装 ($docker_version)"
else
    check_warn "Docker 未安装（GitHub Actions 不需要）"
fi
echo ""

# 总结
echo "════════════════════════════════════════"
echo "📋 启用步骤："
echo "════════════════════════════════════════"
echo ""
echo "1. 访问 GitHub 仓库"
echo "   https://github.com/[你的用户名]/starLog"
echo ""
echo "2. 启用 Actions"
echo "   Settings → Actions → General"
echo "   选择「Allow all actions and reusable workflows」"
echo "   点击「Save」"
echo ""
echo "3. 验证工作流"
echo "   点击「Actions」标签"
echo "   应该看到「Lighthouse CI」和「API Tests」"
echo ""
echo "4. 触发第一次测试"
echo "   提交代码到 main 或 develop 分支"
echo "   或创建 Pull Request"
echo ""
echo "5. 查看测试结果"
echo "   在 Actions 页面查看执行状态"
echo "   下载 Lighthouse 报告 artifacts"
echo ""
echo "📖 详细指南：docs/GITHUB_ACTIONS_SETUP.md"
echo ""
