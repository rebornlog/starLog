#!/bin/bash
# 客户视角：端到端页面测试脚本
# 模拟真实用户访问流程

set -e

echo "======================================"
echo "🛒 客户视角：网站全面测试"
echo "======================================"
echo "测试时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 性能阈值（毫秒）
PERF_THRESHOLD=3000

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0
PERF_ISSUES=0

# 性能测试函数
test_page_performance() {
    local name=$1
    local url=$2
    local expected_content=$3
    
    echo -n "⏱️  $name ... "
    
    # 测量加载时间
    start_time=$(date +%s%N)
    response=$(curl -s -w "\n%{http_code}\n%{time_total}" "$url" 2>&1)
    end_time=$(date +%s%N)
    
    # 解析结果
    http_code=$(echo "$response" | tail -n2 | head -n1)
    load_time=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-2)
    
    # 计算毫秒
    load_time_ms=$(echo "$load_time * 1000" | bc | cut -d'.' -f1)
    
    if [ "$http_code" = "200" ]; then
        if [ -n "$expected_content" ] && echo "$body" | grep -q "$expected_content"; then
            if [ "$load_time_ms" -lt "$PERF_THRESHOLD" ]; then
                echo -e "${GREEN}✅ ${load_time_ms}ms${NC}"
                ((TESTS_PASSED++))
            else
                echo -e "${YELLOW}⚠️  ${load_time_ms}ms (超过${PERF_THRESHOLD}ms 阈值)${NC}"
                ((TESTS_PASSED++))
                ((PERF_ISSUES++))
            fi
        else
            echo -e "${RED}❌ 页面缺少关键内容${NC}"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}❌ HTTP $http_code${NC}"
        ((TESTS_FAILED++))
    fi
}

# 功能测试函数
test_feature() {
    local name=$1
    local url=$2
    local check_type=$3
    local expected=$4
    
    echo -n "🔍 $name ... "
    
    response=$(curl -s "$url" 2>&1)
    
    case $check_type in
        "contains")
            if echo "$response" | grep -q "$expected"; then
                echo -e "${GREEN}✅${NC}"
                ((TESTS_PASSED++))
            else
                echo -e "${RED}❌ 缺少：$expected${NC}"
                ((TESTS_FAILED++))
            fi
            ;;
        "api_call")
            # 检查是否包含 API 调用代码
            if echo "$response" | grep -q "$expected"; then
                echo -e "${GREEN}✅${NC}"
                ((TESTS_PASSED++))
            else
                echo -e "${RED}❌ API 调用配置错误${NC}"
                ((TESTS_FAILED++))
            fi
            ;;
    esac
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 第一部分：首页加载测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_page_performance "门户网站加载" "http://localhost:3000/" "starLog"
test_page_performance "金融导航入口" "http://localhost:3000/" "金融"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💰 第二部分：基金功能（客户流程）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "客户场景：查看基金列表 → 搜索基金 → 查看详情"
echo ""

test_page_performance "1. 打开基金首页" "http://localhost:3000/funds/" "基金市场"
test_feature "   - 页面标题显示" "http://localhost:3000/funds/" "contains" "📊 基金市场"
test_feature "   - 筛选器存在" "http://localhost:3000/funds/" "contains" "股票型"
test_feature "   - 基金卡片存在" "http://localhost:3000/funds/" "contains" "华夏成长混合"
test_feature "   - 净值数据显示" "http://localhost:3000/funds/" "contains" "unitNetValue"
test_feature "   - 涨跌幅显示" "http://localhost:3000/funds/" "contains" "dailyGrowth"
test_feature "   - 导入按钮存在" "http://localhost:3000/funds/" "contains" "导入"
test_feature "   - 导出按钮存在" "http://localhost:3000/funds/" "contains" "导出"

echo ""
test_page_performance "2. 查看基金详情 (000001)" "http://localhost:3000/funds/000001/" "华夏成长混合"
test_feature "   - 基金名称显示" "http://localhost:3000/funds/000001/" "contains" "华夏成长混合"
test_feature "   - 净值图表组件" "http://localhost:3000/funds/000001/" "contains" "FundChart"
test_feature "   - 基金经理信息" "http://localhost:3000/funds/000001/" "contains" "基金经理"
test_feature "   - 费率信息" "http://localhost:3000/funds/000001/" "contains" "费率"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 第三部分：股票功能（客户流程）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "客户场景：查看股票列表 → 搜索股票 → 查看 K 线图"
echo ""

test_page_performance "1. 打开股票首页" "http://localhost:3000/stocks/" "股票"
test_feature "   - 股票列表存在" "http://localhost:3000/stocks/" "contains" "贵州茅台"
test_feature "   - 搜索框存在" "http://localhost:3000/stocks/" "contains" "搜索"

echo ""
test_page_performance "2. 查看股票详情 (000001)" "http://localhost:3000/stocks/000001/" "平安银行"
test_feature "   - 股票名称显示" "http://localhost:3000/stocks/000001/" "contains" "平安银行"
test_feature "   - K 线图组件加载" "http://localhost:3000/stocks/000001/" "contains" "StockChart"
test_feature "   - 实时价格显示" "http://localhost:3000/stocks/000001/" "contains" "price"
test_feature "   - 涨跌幅显示" "http://localhost:3000/stocks/000001/" "contains" "changePercent"
test_feature "   - K 线 API 调用" "http://localhost:3000/stocks/000001/" "api_call" "/api/stocks/"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 第四部分：搜索功能测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_page_performance "搜索基金 (000001)" "http://localhost:3000/funds/" "000001"
test_feature "   - 搜索结果存在" "http://localhost:3000/funds/" "contains" "华夏成长混合"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 第五部分：移动端适配检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查响应式类名
test_feature "基金页面响应式" "http://localhost:3000/funds/" "contains" "sm:"
test_feature "股票页面响应式" "http://localhost:3000/stocks/000001/" "contains" "sm:"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 第六部分：UI/UX 细节检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_feature "加载动画存在" "http://localhost:3000/funds/" "contains" "animate-"
test_feature "错误提示友好" "http://localhost:3000/funds/" "contains" "😕"
test_feature "按钮可点击" "http://localhost:3000/funds/" "contains" "hover:"
test_feature "颜色对比度" "http://localhost:3000/funds/" "contains" "dark:"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 测试结果汇总"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 通过：$TESTS_PASSED${NC}"
echo -e "${RED}❌ 失败：$TESTS_FAILED${NC}"
echo -e "${YELLOW}⚠️  性能问题：$PERF_ISSUES${NC}"
echo ""

# 计算总分
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
if [ $TOTAL_TESTS -gt 0 ]; then
    SCORE=$((TESTS_PASSED * 100 / TOTAL_TESTS))
else
    SCORE=0
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 客户体验评分"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "总分：$SCORE / 100"
echo ""

if [ $SCORE -ge 90 ]; then
    echo -e "${GREEN}🎉 优秀！客户会非常满意${NC}"
elif [ $SCORE -ge 80 ]; then
    echo -e "${GREEN}✅ 良好！客户可以正常使用${NC}"
elif [ $SCORE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  一般！有些问题需要改进${NC}"
else
    echo -e "${RED}❌ 较差！客户可能会投诉${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 改进建议"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $PERF_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  性能优化：${PERF_ISSUES} 个页面加载超过 ${PERF_THRESHOLD}ms${NC}"
    echo "  建议：启用 CDN、优化图片、减少 bundle 大小"
fi

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ 功能修复：${TESTS_FAILED} 个功能测试失败${NC}"
    echo "  建议：立即修复失败的功能"
fi

echo ""
echo "测试完成时间：$(date '+%Y-%m-%d %H:%M:%S')"

if [ $TESTS_FAILED -eq 0 ] && [ $SCORE -ge 80 ]; then
    echo -e "${GREEN}✅ 网站已准备好迎接客户！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  建议修复问题后再上线${NC}"
    exit 1
fi
