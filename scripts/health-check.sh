#!/bin/bash
# 服务健康检查与告警脚本
# 每 5 分钟执行一次

set -e

LOG_FILE="/tmp/service-health.log"
ALERT_FILE="/tmp/service-alerts.log"
WEBHOOK_URL="${SERVICE_ALERT_WEBHOOK:-}"

# 检查服务状态
check_service() {
    local name=$1
    local url=$2
    local timeout=${3:-5}
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $timeout "$url" 2>/dev/null || echo "000")
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$response" = "200" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $name: $response (${duration}ms)" >> "$LOG_FILE"
        return 0
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $name: $response (${duration}ms)" >> "$LOG_FILE"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚨 告警：$name 服务异常 (HTTP $response)" >> "$ALERT_FILE"
        
        # 发送飞书告警
        if [ -n "$WEBHOOK_URL" ]; then
            curl -s -X POST "$WEBHOOK_URL" \
                -H "Content-Type: application/json" \
                -d "{
                    \"msg_type\": \"text\",
                    \"content\": {
                        \"text\": \"🚨 服务告警：$name 服务异常 (HTTP $response, ${duration}ms)\\n时间：$(date '+%Y-%m-%d %H:%M:%S')\"
                    }
                }" >> "$LOG_FILE" 2>&1
        fi
        
        return 1
    fi
}

echo "=== 服务健康检查开始 ===" >> "$LOG_FILE"

# 检查各项服务
check_service "前端服务" "http://localhost:3000" 5 || true
check_service "金融 API" "http://localhost:8081/health" 5 || true
check_service "Redis" "redis://localhost:6379" 2 || true

# 检查 PM2 进程
pm2_status=$(pm2 list --json 2>/dev/null)
online_count=$(echo "$pm2_status" | jq -r '[.[] | select(.status == "online")] | length')
total_count=$(echo "$pm2_status" | jq -r 'length')

if [ "$online_count" != "$total_count" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚨 告警：PM2 进程异常 ($online_count/$total_count 在线)" >> "$ALERT_FILE"
fi

echo "=== 服务健康检查结束 ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
