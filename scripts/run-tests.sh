#!/bin/bash
# run-tests.sh - 自动化测试脚本
# 用法：./run-tests.sh [--unit|--integration|--e2e|--all]

LOG_FILE="/tmp/test-results.log"
RESULTS_DIR="/tmp/test-results"
mkdir -p $RESULTS_DIR

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 前端单元测试
run_frontend_unit() {
    log "🧪 运行前端单元测试..."
    
    cd /home/admin/.openclaw/workspace/starLog
    
    if command -v npm &> /dev/null; then
        npm test -- --coverage --reporters=default --reporters=jest-junit 2>&1 | tee $RESULTS_DIR/frontend-unit.log
        
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            log "${GREEN}✅ 前端单元测试通过${NC}"
            return 0
        else
            log "${RED}❌ 前端单元测试失败${NC}"
            return 1
        fi
    else
        log "${YELLOW}⚠️  npm 未安装，跳过前端测试${NC}"
        return 0
    fi
}

# 后端单元测试
run_backend_unit() {
    log "🧪 运行后端单元测试..."
    
    cd /home/admin/.openclaw/workspace/starLog/services/finance
    
    if command -v pytest &> /dev/null; then
        pytest --cov=. --cov-report=html -v 2>&1 | tee $RESULTS_DIR/backend-unit.log
        
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            log "${GREEN}✅ 后端单元测试通过${NC}"
            return 0
        else
            log "${RED}❌ 后端单元测试失败${NC}"
            return 1
        fi
    else
        log "${YELLOW}⚠️  pytest 未安装，跳过后端测试${NC}"
        return 0
    fi
}

# API 集成测试
run_api_integration() {
    log "🔌 运行 API 集成测试..."
    
    endpoints=(
        "http://localhost:8081/health"
        "http://localhost:8081/api/funds/list"
        "http://localhost:8081/api/stocks/list"
    )
    
    passed=0
    failed=0
    
    for endpoint in "${endpoints[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" $endpoint --connect-timeout 5)
        
        if [ "$response" = "200" ]; then
            log "${GREEN}✅ $endpoint - OK${NC}"
            ((passed++))
        else
            log "${RED}❌ $endpoint - $response${NC}"
            ((failed++))
        fi
    done
    
    log "📊 API 测试结果：$passed 通过，$failed 失败"
    
    if [ $failed -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# 前端页面测试
run_frontend_pages() {
    log "📄 运行前端页面测试..."
    
    pages=(
        "http://localhost:3000"
        "http://localhost:3000/funds"
        "http://localhost:3000/stocks"
        "http://localhost:3000/blog"
    )
    
    passed=0
    failed=0
    
    for page in "${pages[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" $page --connect-timeout 5)
        
        if [ "$response" = "200" ]; then
            log "${GREEN}✅ $page - OK${NC}"
            ((passed++))
        else
            log "${RED}❌ $page - $response${NC}"
            ((failed++))
        fi
    done
    
    log "📊 页面测试结果：$passed 通过，$failed 失败"
    
    if [ $failed -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# Lighthouse 性能测试
run_lighthouse() {
    log "💡 运行 Lighthouse 性能测试..."
    
    urls=(
        "http://localhost:3000"
        "http://localhost:3000/funds"
    )
    
    for url in "${urls[@]}"; do
        log "📊 测试：$url"
        
        if command -v lighthouse &> /dev/null; then
            lighthouse $url \
                --output json \
                --output-path "$RESULTS_DIR/lighthouse-$(echo $url | md5sum | cut -d' ' -f1).json" \
                --quiet \
                --chrome-flags="--headless" 2>/dev/null
            
            if [ $? -eq 0 ]; then
                log "${GREEN}✅ Lighthouse 测试完成${NC}"
            else
                log "${YELLOW}⚠️  Lighthouse 测试失败${NC}"
            fi
        else
            log "${YELLOW}⚠️  Lighthouse 未安装，使用 npx...${NC}"
            npx -y lighthouse $url \
                --output json \
                --output-path "$RESULTS_DIR/lighthouse-$(echo $url | md5sum | cut -d' ' -f1).json" \
                --quiet 2>/dev/null
        fi
    done
}

# 数据库连接测试
run_database_test() {
    log "🗄️  运行数据库连接测试..."
    
    if command -v psql &> /dev/null; then
        result=$(PGPASSWORD=starlog123 psql -h localhost -p 5432 -U starlog -d starlog -c "SELECT 1" 2>&1)
        
        if [[ $result == *"1"* ]]; then
            log "${GREEN}✅ 数据库连接正常${NC}"
            return 0
        else
            log "${RED}❌ 数据库连接失败：$result${NC}"
            return 1
        fi
    else
        log "${YELLOW}⚠️  psql 未安装，跳过数据库测试${NC}"
        return 0
    fi
}

# 生成测试报告
generate_report() {
    log "📊 生成测试报告..."
    
    report_file="$RESULTS_DIR/test-report-$(date +%Y-%m-%d-%H%M%S).md"
    
    cat << EOF > $report_file
# 📊 自动化测试报告

**日期：** $(date '+%Y-%m-%d %H:%M:%S')

---

## 📋 测试概览

EOF

    # 统计结果
    total_tests=0
    passed_tests=0
    
    for log_file in $RESULTS_DIR/*.log; do
        if [ -f "$log_file" ]; then
            file_passed=$(grep -c "✅" "$log_file" 2>/dev/null || echo "0")
            file_failed=$(grep -c "❌" "$log_file" 2>/dev/null || echo "0")
            total_tests=$((total_tests + file_passed + file_failed))
            passed_tests=$((passed_tests + file_passed))
        fi
    done
    
    failed_tests=$((total_tests - passed_tests))
    pass_rate=$((total_tests > 0 ? passed_tests * 100 / total_tests : 0))
    
    cat << EOF >> $report_file
- 总测试数：$total_tests
- 通过：$passed_tests
- 失败：$failed_tests
- 通过率：${pass_rate}%

---

## 📄 详细结果

EOF

    for log_file in $RESULTS_DIR/*.log; do
        if [ -f "$log_file" ]; then
            echo "### $(basename $log_file)" >> $report_file
            echo "" >> $report_file
            echo '```' >> $report_file
            tail -50 "$log_file" >> $report_file
            echo '```' >> $report_file
            echo "" >> $report_file
        fi
    done
    
    cat << EOF >> $report_file
---

## 💡 建议

1. 修复所有失败的测试
2. 提高测试覆盖率
3. 优化性能瓶颈
4. 定期运行测试

---

**报告位置：** $report_file
EOF

    log "✅ 测试报告已生成：$report_file"
}

# 清理测试文件
cleanup() {
    log "🧹 清理测试文件..."
    find $RESULTS_DIR -name "*.log" -mtime +7 -delete 2>/dev/null
    log "✅ 清理完成"
}

# 主函数
main() {
    case ${1:---all} in
        --unit)
            run_frontend_unit
            run_backend_unit
            ;;
        --integration)
            run_api_integration
            run_frontend_pages
            run_database_test
            ;;
        --e2e)
            run_lighthouse
            ;;
        --all)
            log "🚀 开始完整测试流程..."
            run_frontend_unit
            run_backend_unit
            run_api_integration
            run_frontend_pages
            run_database_test
            run_lighthouse
            generate_report
            cleanup
            ;;
        --clean)
            cleanup
            ;;
        *)
            echo "用法：$0 [--unit|--integration|--e2e|--all|--clean]"
            echo "  --unit        单元测试"
            echo "  --integration 集成测试"
            echo "  --e2e         E2E 测试"
            echo "  --all         完整测试"
            echo "  --clean       清理测试文件"
            exit 1
            ;;
    esac
}

main "$@"
