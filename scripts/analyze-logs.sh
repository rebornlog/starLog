#!/bin/bash
# analyze-logs.sh - 日志分析脚本
# 用法：./analyze-logs.sh [--daily|--weekly|--realtime|--report]

LOG_DIR="/home/admin/.openclaw/workspace/starLog"
OUTPUT_DIR="/tmp/log-analysis"
mkdir -p $OUTPUT_DIR

# 颜色
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 聚合日志文件
aggregate_logs() {
    log "📂 聚合日志文件..."
    
    # 前端日志
    if [ -f "/tmp/starlog-frontend.log" ]; then
        cat /tmp/starlog-frontend.log >> $OUTPUT_DIR/all.log
    fi
    
    # 后端日志
    if [ -f "/tmp/starlog-finance.log" ]; then
        cat /tmp/starlog-finance.log >> $OUTPUT_DIR/all.log
    fi
    
    # Nginx 日志（如果有）
    if [ -f "/var/log/nginx/starlog.error.log" ]; then
        cat /var/log/nginx/starlog.error.log >> $OUTPUT_DIR/all.log
    fi
    
    # 系统日志
    if [ -f "/tmp/service-monitor.log" ]; then
        cat /tmp/service-monitor.log >> $OUTPUT_DIR/all.log
    fi
    
    total_lines=$(wc -l < $OUTPUT_DIR/all.log 2>/dev/null || echo "0")
    log "✅ 已聚合 $total_lines 行日志"
}

# 提取错误
extract_errors() {
    log "🔍 提取错误日志..."
    
    if [ ! -f $OUTPUT_DIR/all.log ]; then
        log "⚠️  未找到聚合日志文件"
        return 1
    fi
    
    # 提取错误关键词
    grep -iE "error|exception|fail|critical|fatal" $OUTPUT_DIR/all.log > $OUTPUT_DIR/errors.log 2>/dev/null
    
    error_count=$(wc -l < $OUTPUT_DIR/errors.log 2>/dev/null || echo "0")
    log "✅ 发现 $error_count 个错误"
}

# 分析错误 Top 10
analyze_top_errors() {
    log "📊 分析错误 Top 10..."
    
    if [ ! -f $OUTPUT_DIR/errors.log ]; then
        log "⚠️  未找到错误日志文件"
        return 1
    fi
    
    echo "════════════════════════════════════════" > $OUTPUT_DIR/top_errors.txt
    echo "📈 错误 Top 10 分析" >> $OUTPUT_DIR/top_errors.txt
    echo "🕐 时间：$(date '+%Y-%m-%d %H:%M:%S')" >> $OUTPUT_DIR/top_errors.txt
    echo "════════════════════════════════════════" >> $OUTPUT_DIR/top_errors.txt
    echo "" >> $OUTPUT_DIR/top_errors.txt
    
    # 按错误类型统计
    echo "📋 错误类型统计:" >> $OUTPUT_DIR/top_errors.txt
    echo "" >> $OUTPUT_DIR/top_errors.txt
    
    grep -oE "[A-Z]+Error|[A-Z]+Exception" $OUTPUT_DIR/errors.log 2>/dev/null | \
        sort | uniq -c | sort -rn | head -10 >> $OUTPUT_DIR/top_errors.txt
    
    echo "" >> $OUTPUT_DIR/top_errors.txt
    echo "════════════════════════════════════════" >> $OUTPUT_DIR/top_errors.txt
    
    # 最新错误（最近 20 条）
    echo "" >> $OUTPUT_DIR/top_errors.txt
    echo "🕐 最新错误（最近 20 条）:" >> $OUTPUT_DIR/top_errors.txt
    echo "" >> $OUTPUT_DIR/top_errors.txt
    
    tail -20 $OUTPUT_DIR/errors.log >> $OUTPUT_DIR/top_errors.txt
    
    log "✅ 错误分析完成"
}

# 按服务分类错误
categorize_errors() {
    log "📂 按服务分类错误..."
    
    if [ ! -f $OUTPUT_DIR/errors.log ]; then
        return 1
    fi
    
    # 前端错误
    grep -iE "next.js|react|frontend|3000" $OUTPUT_DIR/errors.log > $OUTPUT_DIR/frontend_errors.log 2>/dev/null
    frontend_count=$(wc -l < $OUTPUT_DIR/frontend_errors.log 2>/dev/null || echo "0")
    
    # 后端错误
    grep -iE "fastapi|uvicorn|finance|8081" $OUTPUT_DIR/errors.log > $OUTPUT_DIR/backend_errors.log 2>/dev/null
    backend_count=$(wc -l < $OUTPUT_DIR/backend_errors.log 2>/dev/null || echo "0")
    
    # 数据库错误
    grep -iE "postgres|database|connection|query" $OUTPUT_DIR/errors.log > $OUTPUT_DIR/database_errors.log 2>/dev/null
    db_count=$(wc -l < $OUTPUT_DIR/database_errors.log 2>/dev/null || echo "0")
    
    # 其他错误
    grep -viE "next.js|react|frontend|3000|fastapi|uvicorn|finance|8081|postgres|database|connection|query" \
        $OUTPUT_DIR/errors.log > $OUTPUT_DIR/other_errors.log 2>/dev/null
    other_count=$(wc -l < $OUTPUT_DIR/other_errors.log 2>/dev/null || echo "0")
    
    echo "════════════════════════════════════════" > $OUTPUT_DIR/categorized.txt
    echo "📂 错误分类统计" >> $OUTPUT_DIR/categorized.txt
    echo "════════════════════════════════════════" >> $OUTPUT_DIR/categorized.txt
    echo "" >> $OUTPUT_DIR/categorized.txt
    echo "  前端错误：$frontend_count" >> $OUTPUT_DIR/categorized.txt
    echo "  后端错误：$backend_count" >> $OUTPUT_DIR/categorized.txt
    echo "  数据库错误：$db_count" >> $OUTPUT_DIR/categorized.txt
    echo "  其他错误：$other_count" >> $OUTPUT_DIR/categorized.txt
    echo "" >> $OUTPUT_DIR/categorized.txt
    
    log "✅ 错误分类完成"
}

# 生成日报
generate_daily_report() {
    log "📊 生成日报..."
    
    report_file="$OUTPUT_DIR/daily_report_$(date +%Y-%m-%d).md"
    
    cat << EOF > $report_file
# 📈 日志分析日报

**日期：** $(date '+%Y-%m-%d')  
**生成时间：** $(date '+%Y-%m-%d %H:%M:%S')

---

## 📊 概览

EOF

    if [ -f $OUTPUT_DIR/all.log ]; then
        total_lines=$(wc -l < $OUTPUT_DIR/all.log)
        error_count=$(wc -l < $OUTPUT_DIR/errors.log 2>/dev/null || echo "0")
        echo "- 总日志行数：$total_lines" >> $report_file
        echo "- 错误总数：$error_count" >> $report_file
    else
        echo "- 无日志数据" >> $report_file
    fi
    
    cat << EOF >> $report_file

---

## 📋 错误分类

EOF

    if [ -f $OUTPUT_DIR/categorized.txt ]; then
        cat $OUTPUT_DIR/categorized.txt >> $report_file
    fi
    
    cat << EOF >> $report_file

---

## 🔝 错误 Top 10

EOF

    if [ -f $OUTPUT_DIR/top_errors.txt ]; then
        cat $OUTPUT_DIR/top_errors.txt >> $report_file
    fi
    
    cat << EOF >> $report_file

---

## 💡 建议

1. 优先处理高频错误
2. 检查数据库连接池配置
3. 查看前端资源加载失败原因
4. 监控内存使用趋势

---

**报告位置：** $report_file
EOF

    log "✅ 日报已生成：$report_file"
}

# 实时监控（简化版）
monitor_realtime() {
    log "🔍 开始实时监控（Ctrl+C 停止）..."
    
    tail -f $OUTPUT_DIR/all.log 2>/dev/null | \
        grep --line-buffered -iE "error|exception|fail" | \
        while read line; do
            echo -e "${RED}[REALTIME]${NC} $line"
        done
}

# 生成完整报告
generate_report() {
    log "📊 生成完整报告..."
    
    aggregate_logs
    extract_errors
    analyze_top_errors
    categorize_errors
    generate_daily_report
    
    echo ""
    echo "════════════════════════════════════════"
    echo "📈 日志分析报告"
    echo "════════════════════════════════════════"
    echo ""
    
    if [ -f $OUTPUT_DIR/categorized.txt ]; then
        cat $OUTPUT_DIR/categorized.txt
    fi
    
    echo ""
    echo "📄 详细报告位置:"
    echo "  - 错误分析：$OUTPUT_DIR/top_errors.txt"
    echo "  - 分类统计：$OUTPUT_DIR/categorized.txt"
    echo "  - 日报：$OUTPUT_DIR/daily_report_*.md"
    echo ""
    echo "════════════════════════════════════════"
}

# 清理旧日志
cleanup_old_logs() {
    log "🧹 清理 7 天前的日志..."
    find $OUTPUT_DIR -name "*.log" -mtime +7 -delete 2>/dev/null
    find $OUTPUT_DIR -name "daily_report_*.md" -mtime +30 -delete 2>/dev/null
    log "✅ 清理完成"
}

# 主函数
main() {
    case ${1:---report} in
        --aggregate)
            aggregate_logs
            ;;
        --errors)
            extract_errors
            ;;
        --top)
            analyze_top_errors
            cat $OUTPUT_DIR/top_errors.txt
            ;;
        --categorize)
            categorize_errors
            cat $OUTPUT_DIR/categorized.txt
            ;;
        --daily)
            generate_daily_report
            ;;
        --realtime)
            aggregate_logs
            monitor_realtime
            ;;
        --report)
            generate_report
            ;;
        --clean)
            cleanup_old_logs
            ;;
        *)
            echo "用法：$0 [--aggregate|--errors|--top|--categorize|--daily|--realtime|--report|--clean]"
            echo "  --aggregate   聚合日志"
            echo "  --errors      提取错误"
            echo "  --top         错误 Top 10"
            echo "  --categorize  分类统计"
            echo "  --daily       生成日报"
            echo "  --realtime    实时监控"
            echo "  --report      完整报告"
            echo "  --clean       清理旧日志"
            exit 1
            ;;
    esac
}

main "$@"
