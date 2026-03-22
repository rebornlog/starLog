#!/bin/bash
# starLog 服务守护脚本
# 每 5 分钟检查一次，确保服务运行

LOG_FILE="/tmp/service-watchdog.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 检查金融 API
if ! curl -s --max-time 3 http://localhost:8081/health | grep -q "healthy"; then
    log "⚠️  金融 API 无响应，尝试重启..."
    
    # 停止旧进程
    pkill -f "uvicorn.*8081" 2>/dev/null
    sleep 2
    
    # 启动新进程
    cd /home/admin/.openclaw/workspace/starLog/services/finance
    source venv/bin/activate
    nohup python -m uvicorn main:app --host 0.0.0.0 --port 8081 > /tmp/finance-api.log 2>&1 &
    
    sleep 5
    
    # 验证
    if curl -s --max-time 3 http://localhost:8081/health | grep -q "healthy"; then
        log "✅ 金融 API 已恢复"
    else
        log "❌ 金融 API 重启失败"
    fi
else
    log "✅ 金融 API 正常"
fi

# 检查前端
if ! curl -s --max-time 3 http://localhost:3000 -o /dev/null; then
    log "⚠️  前端服务无响应"
fi
