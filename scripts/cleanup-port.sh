#!/bin/bash

# 端口清理脚本
# 功能：清理占用指定端口的进程，防止 PM2 重启失败

set -e

echo "🧹 端口清理工具"
echo "==============="
echo ""

PORT="${1:-3000}"

# 检查端口占用
echo "📡 检查端口 $PORT 占用情况..."

# 使用 netstat 查找占用进程
PID=$(netstat -tlnp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1)

if [ -z "$PID" ]; then
    echo "✅ 端口 $PORT 未被占用"
    exit 0
fi

# 获取进程信息
PROCESS_INFO=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")

echo "⚠️  发现占用进程:"
echo "   PID: $PID"
echo "   进程：$PROCESS_INFO"
echo "   端口：$PORT"
echo ""

# 判断是否为 PM2 管理的进程
PM2_ID=$(pm2 list | grep "$PID" | awk '{print $1}' 2>/dev/null)

if [ -n "$PM2_ID" ]; then
    echo "ℹ️  该进程由 PM2 管理，建议先停止 PM2 应用"
    echo ""
    read -p "是否强制终止？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 操作已取消"
        exit 1
    fi
fi

# 终止进程
echo "🔨 终止进程 $PID..."
if kill -9 $PID 2>/dev/null; then
    echo "✅ 进程已终止"
    
    # 等待端口释放
    echo "⏳ 等待端口释放..."
    sleep 2
    
    # 验证端口已释放
    if netstat -tlnp 2>/dev/null | grep -q ":$PORT "; then
        echo "⚠️  端口仍然被占用，可能有其他进程"
        exit 1
    else
        echo "✅ 端口 $PORT 已释放"
    fi
else
    echo "❌ 终止失败，可能需要 sudo 权限"
    exit 1
fi

echo ""
echo "💡 建议："
echo "1. 检查 PM2 配置，确保没有重复启动"
echo "2. 使用 start-services.sh 统一启动服务"
echo "3. 定期检查 pm2 list 状态"
