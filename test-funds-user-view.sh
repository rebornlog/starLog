#!/bin/bash
# 用户视角的基金功能测试脚本
# 模拟真实用户访问流程

set -e

echo "======================================"
echo "🧪 用户视角：基金功能全面测试"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
test_api() {
    local name=$1
    local url=$2
    local expected_field=$3
    
    echo -n "📍 测试：$name ... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        if [ -n "$expected_field" ] && echo "$body" | grep -q "$expected_field"; then
            echo -e "${GREEN}✅ 通过${NC}"
            ((TESTS_PASSED++))
            return 0
        elif [ -z "$expected_field" ]; then
            echo -e "${GREEN}✅ 通过${NC}"
            ((TESTS_PASSED++))
            return 0
        else
            echo -e "${RED}❌ 失败：缺少字段 $expected_field${NC}"
            ((TESTS_FAILED++))
            return 1
        fi
    else
        echo -e "${RED}❌ 失败：HTTP $http_code${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

test_frontend() {
    local name=$1
    local url=$2
    local expected_text=$3
    
    echo -n "🌐 测试：$name ... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        if echo "$body" | grep -q "$expected_text"; then
            echo -e "${GREEN}✅ 通过${NC}"
            ((TESTS_PASSED++))
            return 0
        else
            echo -e "${RED}❌ 失败：页面缺少 $expected_text${NC}"
            ((TESTS_FAILED++))
            return 1
        fi
    else
        echo -e "${RED}❌ 失败：HTTP $http_code${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# 1. API 层面测试
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 第一部分：API 接口测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_api "基金列表接口" "http://localhost:8081/api/funds/list" "success"
test_api "基金详情接口 (000001)" "http://localhost:8081/api/funds/000001" "unitNetValue"
test_api "批量获取基金" "http://localhost:8081/api/funds/batch?codes=000001,110001" "funds"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 第二部分：前端页面测试（通过 Next.js 代理）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_frontend "基金首页加载" "http://localhost:3000/funds/" "基金市场"
test_frontend "基金页面包含 API 调用" "http://localhost:3000/funds/" "/api/funds/list"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 第三部分：配置验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查前端代码是否使用相对路径
echo -n "📝 检查：前端 API 配置使用相对路径 ... "
if grep -q "const API_BASE = '/api'" /home/admin/.openclaw/workspace/starLog/app/funds/page.tsx; then
    echo -e "${GREEN}✅ 通过${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ 失败：前端仍使用硬编码地址${NC}"
    ((TESTS_FAILED++))
fi

# 检查 Next.js 代理配置
echo -n "📝 检查：Next.js rewrites 配置 ... "
if grep -q "source: '/api/funds/:path\*'" /home/admin/.openclaw/workspace/starLog/next.config.js; then
    echo -e "${GREEN}✅ 通过${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ 失败：缺少 API 代理配置${NC}"
    ((TESTS_FAILED++))
fi

# 检查 CORS 配置
echo -n "📝 检查：CORS 配置支持生产环境 ... "
if grep -q "starlog.dev" /home/admin/.openclaw/workspace/starLog/services/finance/main.py; then
    echo -e "${GREEN}✅ 通过${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ 失败：CORS 配置不完整${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 测试结果汇总"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "✅ 通过：${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ 失败：${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！用户视角验证完成！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  存在失败的测试，请检查修复！${NC}"
    exit 1
fi
