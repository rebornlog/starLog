#!/bin/bash
#
# starLog 服务监控脚本
# 检查所有关键服务状态，异常时发送告警
#
# 使用方法：
# 1. 添加到 crontab: */5 * * * * /path/to/monitor-services.sh
# 2. 或手动执行：./monitor-services.sh

set -e

# 配置
LOG_FILE="/tmp/service-monitor.log"
ALERT_LOG="/tmp/service-alerts.log"

# 告警 Webhook 配置（三选一）
# 钉钉：https://oapi.dingtalk.com/robot/send?access_token=XXX
# 企业微信：https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=XXX
# 飞书：https://open.feishu.cn/open-apis/bot/v2/hook/XXX
WEBHOOK_URL=""  # ⚠️ 请在此填写你的 Webhook URL

# 告警渠道类型：dingtalk | wecom | feishu
WEBHOOK_TYPE="dingtalk"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] $1" | tee -a "$LOG_FILE"
}

alert() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local message="$1"
    echo -e "[$timestamp] 🚨 ALERT: $message" | tee -a "$ALERT_LOG"
    
    # 如果配置了 Webhook，发送告警
    if [ -n "$WEBHOOK_URL" ]; then
        case "$WEBHOOK_TYPE" in
            "dingtalk")
                # 钉钉格式
                curl -s -X POST "$WEBHOOK_URL" \
                    -H "Content-Type: application/json" \
                    -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"🚨 starLog 告警\\n时间：$timestamp\\n内容：$message\"}}" \
                    > /dev/null 2>&1
                ;;
            "wecom")
                # 企业微信格式
                curl -s -X POST "$WEBHOOK_URL" \
                    -H "Content-Type: application/json" \
                    -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"🚨 starLog 告警\\n时间：$timestamp\\n内容：$message\"}}" \
                    > /dev/null 2>&1
                ;;
            "feishu")
                # 飞书格式（富文本卡片）
                curl -s -X POST "$WEBHOOK_URL" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"msg_type\": \"interactive\",
                        \"card\": {
                            \"config\": {\"wide_screen_mode\": true},
                            \"header\": {
                                \"template\": \"red\",
                                \"title\": {\"content\": \"🚨 starLog 告警\", \"tag\": \"plain_text\"}
                            },
                            \"elements\": [
                                {
                                    \"tag\": \"div\",
                                    \"text\": {
                                        \"content\": \"**时间：** $timestamp\\n**内容：** $message\",
                                        \"tag\": \"lark_md\"
                                    }
                                }
                            ]
                        }
                    }" \
                    > /dev/null 2>&1
                ;;
        esac
    fi
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log "❌ 命令不存在：$1"
        return 1
    fi
    return 0
}

# 检查 PM2 进程（如果使用了 PM2）
check_pm2_process() {
    local process_name=$1
    
    # 检查 PM2 是否可用
    if ! command -v pm2 &> /dev/null; then
        log "⚠️  PM2 未安装，跳过 $process_name 检查"
        return 0
    fi
    
    # 检查 PM2 是否有进程
    if pm2 list 2>/dev/null | grep -q "$process_name"; then
        local status=$(pm2 list | grep "$process_name" | grep -o "online\|stopped\|errored" | head -1)
        if [ "$status" = "online" ]; then
            log "✅ $process_name: 运行中"
            return 0
        else
            alert "$process_name 服务异常！状态：${status:-unknown}"
            return 1
        fi
    else
        log "⚠️  PM2 中未找到 $process_name，跳过检查"
        return 0
    fi
}

# 检查进程是否存在（通用方法）
check_process_exists() {
    local pattern=$1
    local name=$2
    
    if pgrep -f "$pattern" > /dev/null 2>&1; then
        log "✅ $name: 进程存在"
        return 0
    else
        alert "$name 服务异常！进程未找到"
        return 1
    fi
}

# 检查 HTTP 端点
check_http_endpoint() {
    local url=$1
    local name=$2
    local timeout=${3:-5}
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        log "✅ $name: HTTP $response"
        return 0
    else
        alert "$name 服务异常！HTTP 状态码：$response"
        return 1
    fi
}

# 检查 Redis 连接
check_redis() {
    if redis-cli ping > /dev/null 2>&1; then
        log "✅ Redis: 连接正常"
        return 0
    else
        alert "Redis 服务异常！无法连接"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    local threshold=${1:-90}
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt "$threshold" ]; then
        log "✅ 磁盘空间：${usage}% (阈值：${threshold}%)"
        return 0
    else
        alert "磁盘空间不足！使用率：${usage}%"
        return 1
    fi
}

# 检查内存使用
check_memory() {
    local threshold=${1:-90}
    local usage=$(free | awk 'NR==2 {printf "%.0f", $3*100/$2}')
    
    if [ "$usage" -lt "$threshold" ]; then
        log "✅ 内存使用：${usage}% (阈值：${threshold}%)"
        return 0
    else
        alert "内存使用过高！使用率：${usage}%"
        return 1
    fi
}

# 主函数
main() {
    log "========================================"
    log "🔍 starLog 服务健康检查"
    log "========================================"
    
    local error_count=0
    
    # 1. 检查进程（通用方法，不依赖 PM2）
    log "\n📊 检查服务进程..."
    check_process_exists "next.*dev" "前端服务" || ((error_count++))
    check_process_exists "uvicorn.*main:app" "金融 API" || ((error_count++))
    
    # 2. 检查 PM2 进程（如果使用了 PM2）
    if pm2 list >/dev/null 2>&1 && [ $(pm2 list 2>/dev/null | grep -c "online") -gt 0 ]; then
        log "\n📊 检查 PM2 进程..."
        check_pm2_process "starlog-frontend" || ((error_count++))
        check_pm2_process "finance-api" || ((error_count++))
    fi
    
    # 3. 检查 HTTP 端点
    log "\n🌐 检查 HTTP 端点..."
    check_http_endpoint "http://localhost:3000" "前端服务" || ((error_count++))
    check_http_endpoint "http://localhost:8081/health" "金融 API" || ((error_count++))
    check_http_endpoint "http://localhost:8081/api/funds/list?limit=1" "基金数据 API" 10 || ((error_count++))
    
    # 3. 检查 Redis
    log "\n📦 检查 Redis..."
    check_redis || ((error_count++))
    
    # 4. 检查系统资源
    log "\n💻 检查系统资源..."
    check_disk_space 90 || ((error_count++))
    check_memory 90 || ((error_count++))
    
    # 汇总
    log "\n========================================"
    if [ $error_count -eq 0 ]; then
        log "✅ 所有检查通过！"
    else
        log "❌ 发现 $error_count 个问题，请检查告警日志"
        alert "健康检查发现 $error_count 个问题"
    fi
    log "========================================"
    
    return $error_count
}

# 执行
main
exit $?
