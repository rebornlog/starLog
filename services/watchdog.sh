#!/bin/bash

# 服务看门狗 - 每 30 秒检查一次
# ⚠️ 2026-03-24 修复：改用 PM2 管理，禁止直接使用 npm run dev

LOG_FILE="/tmp/watchdog.log"
PORT=3000

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

check_service() {
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT --connect-timeout 5 | grep -q "200\|308"; then
    return 0
  fi
  return 1
}

restart_service() {
  log "⚠️  服务异常，使用 PM2 重启..."
  
  # 使用 PM2 重启（生产模式）
  cd /home/admin/.openclaw/workspace/starLog
  pm2 restart starlog-frontend --update-env
  
  sleep 15
  if check_service; then
    log "✅ 服务重启成功（PM2 生产模式）"
  else
    log "❌ 服务重启失败，检查 PM2 状态"
    pm2 status >> $LOG_FILE 2>&1
  fi
}

while true; do
  if ! check_service; then
    restart_service
  fi
  sleep 30
done
