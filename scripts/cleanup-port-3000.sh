#!/bin/bash
# 清理端口 3000 的僵尸进程
# 用于 PM2 pre-start 钩子

echo "🧹 检查端口 3000..."

# 查找占用端口 3000 的进程
PIDS=$(lsof -t -i:3000 2>/dev/null || netstat -tlnp 2>/dev/null | grep :3000 | awk '{print $NF}' | cut -d'/' -f1)

if [ -n "$PIDS" ]; then
    echo "⚠️  发现占用端口 3000 的进程：$PIDS"
    echo "🔨 终止进程..."
    echo "$PIDS" | xargs kill -9 2>/dev/null
    sleep 2
    
    # 验证是否清理成功
    REMAINING=$(lsof -t -i:3000 2>/dev/null)
    if [ -n "$REMAINING" ]; then
        echo "❌ 警告：仍有进程占用端口：$REMAINING"
        exit 1
    fi
    echo "✅ 端口 3000 已清理"
else
    echo "✅ 端口 3000 空闲"
fi

exit 0
