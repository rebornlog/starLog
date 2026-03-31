#!/bin/bash

# PostgreSQL 自动备份脚本
# 功能：每日自动备份数据库，保留最近 7 天备份

set -e

# === 配置区域 ===
BACKUP_DIR="/home/admin/.openclaw/workspace/starLog/backups"
DB_NAME="starlog"
DB_USER="starlog"
DB_HOST="localhost"
DB_PORT="5432"
RETENTION_DAYS=7
LOG_FILE="/tmp/starlog-backup.log"

# === 函数定义 ===
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

alert() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚨 BACKUP ALERT: $message" | tee -a "$LOG_FILE"
}

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 生成备份文件名
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/starlog_${TIMESTAMP}.sql.gz"

log "=========================================="
log "🚀 开始数据库备份"
log "=========================================="
log "📦 数据库：$DB_NAME"
log "💾 备份文件：$BACKUP_FILE"

# 检查 PostgreSQL 容器是否运行
if ! docker ps | grep -q "starlog-postgres"; then
    alert "PostgreSQL 容器未运行，备份失败"
    exit 1
fi

# 执行备份
log "📝 执行数据库导出..."
if docker exec starlog-postgres pg_dump -U "$DB_USER" -h localhost "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "✅ 备份成功：$BACKUP_FILE (大小：$BACKUP_SIZE)"
else
    alert "备份失败：pg_dump 执行错误"
    exit 1
fi

# 验证备份文件
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    log "✅ 备份文件验证通过"
else
    alert "备份文件为空或不存在"
    exit 1
fi

# 清理过期备份
log "🧹 清理 ${RETENTION_DAYS} 天前的旧备份..."
find "$BACKUP_DIR" -name "starlog_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
REMAINING=$(ls -1 "$BACKUP_DIR"/starlog_*.sql.gz 2>/dev/null | wc -l)
log "✅ 保留 $REMAINING 个备份文件"

# 列出所有备份
log "📋 当前备份列表："
ls -lh "$BACKUP_DIR"/starlog_*.sql.gz 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}' || log "   无备份文件"

log "=========================================="
log "✅ 数据库备份完成"
log "=========================================="

# 可选：上传到云存储（预留接口）
# log "☁️ 上传到云存储..."
# aws s3 cp "$BACKUP_FILE" "s3://your-bucket/backups/" || true

exit 0
