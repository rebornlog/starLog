#!/bin/bash
# smart-monitor.sh - 智能监控脚本（增强版）
# 用法：./smart-monitor.sh [--check|--alert|--recover|--report]

LOG_FILE="/tmp/smart-monitor.log"
ALERT_LOG="/tmp/smart-monitor-alerts.log"
FRONTEND_URL="http://localhost:3000"
FINANCE_URL="http://localhost:8081/health"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="starlog"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

alert() {
    local message="$1"
    echo -e "${RED}[ALERT]$(date '+%Y-%m-%d %H:%M:%S') $message${NC}" | tee -a $ALERT_LOG
    
    # 飞书通知（如果配置了 webhook）
    if [ -n "$FEISHU_WEBHOOK" ]; then
        curl -s -X POST "$FEISHU_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
                \"msg_type\": \"text\",
                \"content\": {
                    \"text\": \"🚨 starLog 告警\\n时间：$(date '+%Y-%m-%d %H:%M:%S')\\n内容：$message\"
                }
            }" > /dev/null
        log "📱 飞书通知已发送"
    fi
}

# 检查前端服务
check_frontend() {
    log "🔍 检查前端服务..."
    response=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL --connect-timeout 5)
    
    if [ "$response" = "200" ]; then
        log "${GREEN}✅ 前端服务正常 (HTTP $response)${NC}"
        return 0
    else
        alert "❌ 前端服务异常 (HTTP $response)"
        return 1
    fi
}

# 检查金融 API
check_finance() {
    log "🔍 检查金融 API..."
    response=$(curl -s -o /dev/null -w "%{http_code}" $FINANCE_URL --connect-timeout 5)
    
    if [ "$response" = "200" ]; then
        log "${GREEN}✅ 金融 API 正常 (HTTP $response)${NC}"
        return 0
    else
        alert "❌ 金融 API 异常 (HTTP $response)"
        return 1
    fi
}

# 检查数据库
check_database() {
    log "🔍 检查数据库..."
    if command -v psql &> /dev/null; then
        result=$(PGPASSWORD=starlog123 psql -h $DB_HOST -p $DB_PORT -U starlog -d $DB_NAME -c "SELECT 1" 2>&1)
        if [[ $result == *"1"* ]]; then
            log "${GREEN}✅ 数据库连接正常${NC}"
            return 0
        else
            alert "❌ 数据库连接失败：$result"
            return 1
        fi
    else
        log "${YELLOW}⚠️  psql 未安装，跳过数据库检查${NC}"
        return 0
    fi
}

# 检查 Redis
check_redis() {
    log "🔍 检查 Redis..."
    if command -v redis-cli &> /dev/null; then
        result=$(redis-cli ping 2>&1)
        if [ "$result" = "PONG" ]; then
            log "${GREEN}✅ Redis 正常${NC}"
            return 0
        else
            alert "❌ Redis 异常：$result"
            return 1
        fi
    else
        log "${YELLOW}⚠️  redis-cli 未安装，跳过 Redis 检查${NC}"
        return 0
    fi
}

# 检查磁盘空间
check_disk() {
    log "🔍 检查磁盘空间..."
    usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 80 ]; then
        log "${GREEN}✅ 磁盘使用率正常 (${usage}%)${NC}"
        return 0
    elif [ "$usage" -lt 90 ]; then
        log "${YELLOW}⚠️  磁盘使用率较高 (${usage}%)${NC}"
        return 0
    else
        alert "❌ 磁盘使用率过高 (${usage}%)"
        return 1
    fi
}

# 检查内存
check_memory() {
    log "🔍 检查内存..."
    usage=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
    
    if [ "$usage" -lt 80 ]; then
        log "${GREEN}✅ 内存使用率正常 (${usage}%)${NC}"
        return 0
    elif [ "$usage" -lt 90 ]; then
        log "${YELLOW}⚠️  内存使用率较高 (${usage}%)${NC}"
        return 0
    else
        alert "❌ 内存使用率过高 (${usage}%)"
        return 1
    fi
}

# 自动恢复服务
recover_service() {
    local service=$1
    log "🔄 尝试恢复服务：$service"
    
    case $service in
        frontend)
            log "重启 Next.js 前端..."
            # 查找并终止现有进程
            pkill -f "next start" 2>/dev/null
            sleep 2
            # 清理 .next 缓存
            rm -rf /home/admin/.openclaw/workspace/starLog/.next
            # 重启服务
            cd /home/admin/.openclaw/workspace/starLog
            nohup npm start > /tmp/starlog-frontend.log 2>&1 &
            log "${GREEN}✅ 前端服务已重启${NC}"
            ;;
        finance)
            log "重启金融 API..."
            pkill -f "uvicorn.*8081" 2>/dev/null
            sleep 2
            cd /home/admin/.openclaw/workspace/starLog/services/finance
            nohup python main.py > /tmp/starlog-finance.log 2>&1 &
            log "${GREEN}✅ 金融 API 已重启${NC}"
            ;;
        *)
            log "${YELLOW}⚠️  未知服务：$service${NC}"
            return 1
            ;;
    esac
    
    return 0
}

# 生成报告
generate_report() {
    log "📊 生成监控报告..."
    
    cat << EOF
════════════════════════════════════════
📈 starLog 系统监控报告
🕐 时间：$(date '+%Y-%m-%d %H:%M:%S')
════════════════════════════════════════

✅ 服务状态:
  - 前端：$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL --connect-timeout 5)
  - 金融 API: $(curl -s -o /dev/null -w "%{http_code}" $FINANCE_URL --connect-timeout 5)
  - 数据库：$(PGPASSWORD=starlog123 psql -h $DB_HOST -p $DB_PORT -U starlog -d $DB_NAME -c "SELECT 1" 2>&1 | grep -q "1" && echo "正常" || echo "异常")
  - Redis: $(redis-cli ping 2>&1)

💾 资源使用:
  - 磁盘：$(df -h / | tail -1 | awk '{print $3"/"$2" ("$5")"}')
  - 内存：$(free -h | grep Mem | awk '{print $3"/"$2" ("int($3/$2*100)"%)"}')

📋 最近告警:
$(tail -5 $ALERT_LOG 2>/dev/null || echo "无告警")

════════════════════════════════════════
EOF
}

# 主函数
main() {
    case ${1:---check} in
        --check)
            log "🔍 开始全面检查..."
            check_frontend
            check_finance
            check_database
            check_redis
            check_disk
            check_memory
            log "✅ 检查完成"
            ;;
        --alert)
            log "📋 查看最近告警..."
            tail -20 $ALERT_LOG
            ;;
        --recover)
            recover_service ${2:-frontend}
            ;;
        --report)
            generate_report
            ;;
        *)
            echo "用法：$0 [--check|--alert|--recover|--report]"
            echo "  --check    全面检查"
            echo "  --alert    查看告警"
            echo "  --recover  恢复服务 (frontend|finance)"
            echo "  --report   生成报告"
            exit 1
            ;;
    esac
}

main "$@"
