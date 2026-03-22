#!/bin/bash
# 基金/金融板块全面验证脚本
# 验证每个 API 接口和前端页面

set -e

echo "======================================"
echo "🧪 基金/金融板块全面验证"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0

# API 基础 URL
API_BASE="http://localhost:8081"
FRONTEND_BASE="http://localhost:3000"

# 测试函数
test_api() {
    local name=$1
    local url=$2
    local expected_field=$3
    
    echo -n "📡 $name ... "
    
    response=$(curl -s -w "\n%{http_code}" --connect-timeout 5 "$url" 2>&1)
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
    
    echo -n "🌐 $name ... "
    
    response=$(curl -s -w "\n%{http_code}" --connect-timeout 5 "$url" 2>&1)
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

check_file() {
    local name=$1
    local file=$2
    local pattern=$3
    
    echo -n "📝 $name ... "
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅ 通过${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ 失败：未找到 $pattern${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 第一部分：基金 API 测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_api "基金列表接口" "$API_BASE/api/funds/list" "success"
test_api "基金详情接口 (000001)" "$API_BASE/api/funds/000001" "unitNetValue"
test_api "基金历史接口 (000001)" "$API_BASE/api/funds/000001/history?page=1&size=10" "data"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 第二部分：股票 API 测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_api "股票列表接口" "$API_BASE/api/stocks/list" "success"
test_api "股票详情接口 (000001)" "$API_BASE/api/stocks/000001" "price"
test_api "股票 K 线接口 (000001)" "$API_BASE/api/stocks/000001/kline?period=day" "klines"
test_api "大盘指数接口" "$API_BASE/api/market/index" "success"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 第三部分：前端页面测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_frontend "基金首页加载" "$FRONTEND_BASE/funds/" "基金市场"
test_frontend "基金详情页 (000001)" "$FRONTEND_BASE/funds/000001/" "华夏成长混合"
test_frontend "股票首页加载" "$FRONTEND_BASE/stocks/" "股票"
test_frontend "股票详情页 (000001)" "$FRONTEND_BASE/stocks/000001/" "StockChart"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 第四部分：代码配置验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查基金页面使用相对路径
check_file "基金首页 API 配置" "/home/admin/.openclaw/workspace/starLog/app/funds/page.tsx" "const API_BASE = '/api'"
check_file "基金详情页 API 配置" "/home/admin/.openclaw/workspace/starLog/app/funds/\[code\]/page.tsx" "fetch(\`/api/funds/"
check_file "基金对比页 API 配置" "/home/admin/.openclaw/workspace/starLog/app/funds/compare/page.tsx" "fetch('/api/funds/"

# 检查股票页面使用相对路径
check_file "股票详情页 API 配置" "/home/admin/.openclaw/workspace/starLog/app/stocks/\[code\]/page.tsx" "fetch(\`/api/stocks/"

# 检查 Next.js 代理配置
check_file "Next.js rewrites 配置" "/home/admin/.openclaw/workspace/starLog/next.config.js" "source: '/api/funds/"
check_file "Next.js rewrites 配置" "/home/admin/.openclaw/workspace/starLog/next.config.js" "source: '/api/stocks/"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 第五部分：K 线图组件验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查 K 线图组件
if [ -f "/home/admin/.openclaw/workspace/starLog/components/StockChart.tsx" ]; then
    echo -e "📈 ${GREEN}✅ 股票 K 线图组件存在${NC}"
    ((TESTS_PASSED++))
else
    echo -e "📈 ${RED}❌ 股票 K 线图组件不存在${NC}"
    ((TESTS_FAILED++))
fi

if [ -f "/home/admin/.openclaw/workspace/starLog/components/funds/FundChart.tsx" ]; then
    echo -e "💰 ${GREEN}✅ 基金图表组件存在${NC}"
    ((TESTS_PASSED++))
else
    echo -e "💰 ${RED}❌ 基金图表组件不存在${NC}"
    ((TESTS_FAILED++))
fi

# 检查 lightweight-charts 库
if grep -q "lightweight-charts" "/home/admin/.openclaw/workspace/starLog/package.json" 2>/dev/null; then
    echo -e "📚 ${GREEN}✅ lightweight-charts 库已安装${NC}"
    ((TESTS_PASSED++))
else
    echo -e "📚 ${RED}❌ lightweight-charts 库未安装${NC}"
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
    echo -e "${GREEN}🎉 所有测试通过！基金/金融板块验证完成！${NC}"
    echo ""
    echo "✅ 验证范围："
    echo "  - 基金 API 接口（列表/详情/历史）"
    echo "  - 股票 API 接口（列表/详情/K 线/指数）"
    echo "  - 前端页面（基金首页/详情页/对比页，股票首页/详情页）"
    echo "  - 代码配置（API 地址/代理配置）"
    echo "  - K 线图组件（StockChart/FundChart）"
    exit 0
else
    echo -e "${RED}⚠️  存在失败的测试，请检查修复！${NC}"
    exit 1
fi
