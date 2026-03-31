#!/bin/bash
# generate-report.sh - 业务报告自动生成脚本
# 用法：./generate-report.sh [--daily|--weekly|--monthly]

REPORT_DIR="/tmp/business-reports"
mkdir -p $REPORT_DIR

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 获取 Umami 统计数据
get_umami_stats() {
    local start=$1
    local end=$2
    
    if [ -z "$UMAMI_WEBSITE_ID" ]; then
        log "${YELLOW}⚠️  UMAMI_WEBSITE_ID 未配置${NC}"
        return 1
    fi
    
    # 获取统计数据
    stats=$(curl -s "${UMAMI_API_URL}/websites/${UMAMI_WEBSITE_ID}/stats?start=${start}&end=${end}" \
        -H "Authorization: Bearer ${UMAMI_API_KEY}" 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        log "${RED}❌ 获取 Umami 数据失败${NC}"
        return 1
    fi
    
    echo "$stats"
}

# 获取数据库统计
get_database_stats() {
    log "📊 获取数据库统计..."
    
    # 基金查询次数（示例）
    fund_count=$(PGPASSWORD=starlog123 psql -h localhost -p 5432 -U starlog -d starlog -t -c \
        "SELECT COUNT(*) FROM fund_quotes WHERE created_at > NOW() - INTERVAL '7 days'" 2>/dev/null | tr -d ' ')
    
    # 用户总数
    user_count=$(PGPASSWORD=starlog123 psql -h localhost -p 5432 -U starlog -d starlog -t -c \
        "SELECT COUNT(*) FROM users" 2>/dev/null | tr -d ' ')
    
    echo "fund_queries: ${fund_count:-0}"
    echo "total_users: ${user_count:-0}"
}

# 生成日报
generate_daily_report() {
    log "📊 生成日报..."
    
    local today=$(date +%Y-%m-%d)
    local yesterday=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)
    
    local report_file="$REPORT_DIR/daily_report_${today}.md"
    
    cat << EOF > $report_file
# 📊 starLog 业务日报

**日期：** $today  
**生成时间：** $(date '+%Y-%m-%d %H:%M:%S')

---

## 📈 核心指标

### 流量统计（昨日）
- 总访问量：$(get_umami_stats $yesterday $today | jq -r '.pageviews // 0')
- 独立访客：$(get_umami_stats $yesterday $today | jq -r '.visitors // 0')
- 跳出率：$(get_umami_stats $yesterday $today | jq -r '.bounces // 0')

### 业务数据
$(get_database_stats)

---

## 🔝 热门页面

EOF

    # 添加热门页面
    echo "TODO: 从 Umami API 获取热门页面数据" >> $report_file
    
    cat << EOF >> $report_file

---

## 💡 建议

1. 关注跳出率变化
2. 优化热门页面性能
3. 分析低流量页面原因

---

**报告位置：** $report_file
EOF

    log "${GREEN}✅ 日报已生成：$report_file${NC}"
}

# 生成周报
generate_weekly_report() {
    log "📊 生成周报..."
    
    local today=$(date +%Y-%m-%d)
    local last_week=$(date -d "7 days ago" +%Y-%m-%d 2>/dev/null || date -v-7d +%Y-%m-%d)
    
    local report_file="$REPORT_DIR/weekly_report_${today}.md"
    
    cat << EOF > $report_file
# 📊 starLog 业务周报

**周期：** $last_week 至 $today  
**生成时间：** $(date '+%Y-%m-%d %H:%M:%S')

---

## 📈 核心指标

### 流量统计（过去 7 天）
- 总访问量：$(get_umami_stats $last_week $today | jq -r '.pageviews // 0')
- 独立访客：$(get_umami_stats $last_week $today | jq -r '.visitors // 0')
- 跳出率：$(get_umami_stats $last_week $today | jq -r '.bounces // 0')
- 平均停留时间：$(get_umami_stats $last_week $today | jq -r '.totaltime // 0') 秒

### 业务数据
$(get_database_stats)

---

## 📊 趋势分析

TODO: 添加周环比数据

---

## 🔝 热门页面 Top 10

TODO: 从 Umami API 获取

---

## 💡 建议

1. 分析流量高峰时段
2. 优化低性能页面
3. 关注用户反馈

---

**报告位置：** $report_file
EOF

    log "${GREEN}✅ 周报已生成：$report_file${NC}"
}

# 发送飞书通知
send_feishu_notification() {
    local report_type=$1
    local report_file=$2
    
    if [ -z "$FEISHU_WEBHOOK" ]; then
        log "${YELLOW}⚠️  FEISHU_WEBHOOK 未配置${NC}"
        return 0
    fi
    
    local title=""
    if [ "$report_type" = "daily" ]; then
        title="📊 starLog 日报"
    else
        title="📊 starLog 周报"
    fi
    
    curl -s -X POST "$FEISHU_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{
            \"msg_type\": \"text\",
            \"content\": {
                \"text\": \"$title\\n\\n报告已生成\\n查看位置：$report_file\"
            }
        }" > /dev/null
    
    log "📱 飞书通知已发送"
}

# 清理旧报告
cleanup_old_reports() {
    log "🧹 清理旧报告..."
    find $REPORT_DIR -name "*.md" -mtime +30 -delete 2>/dev/null
    log "✅ 清理完成"
}

# 主函数
main() {
    # 加载环境变量
    if [ -f ~/.bashrc ]; then
        source ~/.bashrc
    fi
    
    case ${1:---daily} in
        --daily)
            generate_daily_report
            send_feishu_notification "daily" "$report_file"
            ;;
        --weekly)
            generate_weekly_report
            send_feishu_notification "weekly" "$report_file"
            ;;
        --clean)
            cleanup_old_reports
            ;;
        *)
            echo "用法：$0 [--daily|--weekly|--clean]"
            echo "  --daily   生成日报"
            echo "  --weekly  生成周报"
            echo "  --clean   清理旧报告"
            exit 1
            ;;
    esac
}

main "$@"
