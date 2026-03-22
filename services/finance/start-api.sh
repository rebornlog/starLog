#!/bin/bash
# starLog 金融 API 启动脚本
# 使用方法：./start-finance-api.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 激活虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# 停止旧进程
pkill -f "uvicorn.*8081" 2>/dev/null || true
sleep 2

# 启动服务
echo "🚀 启动金融 API..."
nohup python -m uvicorn main:app \
    --host 0.0.0.0 \
    --port 8081 \
    > /tmp/finance-api.log 2>&1 &

echo "✅ 金融 API 已启动 (PID: $!)"

# 等待启动
sleep 5

# 验证
echo ""
echo "=== 验证服务 ==="
if curl -s http://localhost:8081/health | grep -q "healthy"; then
    echo "✅ 服务运行正常"
else
    echo "❌ 服务启动失败，查看日志：tail /tmp/finance-api.log"
    exit 1
fi
