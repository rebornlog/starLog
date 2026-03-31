#!/bin/bash

echo "🚀 开始启动服务..."

# 1. 清理占用端口的进程（防止端口冲突）
echo "📋 清理占用端口的进程..."

# 增强版端口清理函数
cleanup_port() {
    local port=$1
    local service_name=$2
    
    # 检查端口占用
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "   ⚠️  端口 $port 被占用，清理中..."
        
        # 获取占用进程 PID
        local pid=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
        
        if [ -n "$pid" ]; then
            # 检查是否为 PM2 管理的进程
            local pm2_id=$(pm2 list | grep "$pid" | awk '{print $1}' 2>/dev/null)
            
            if [ -n "$pm2_id" ]; then
                echo "   ℹ️  进程由 PM2 管理，先停止 PM2 应用"
                pm2 stop $pm2_id 2>/dev/null || true
            else
                echo "   🔨 终止非 PM2 进程 (PID: $pid)"
                kill -9 $pid 2>/dev/null || true
            fi
            
            sleep 2
            
            # 验证端口已释放
            if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
                echo "   ❌ 端口 $port 仍然被占用，请手动检查"
                return 1
            else
                echo "   ✅ 端口 $port 已释放"
            fi
        fi
    else
        echo "   ✅ 端口 $port 未被占用"
    fi
}

# 清理所有服务端口
cleanup_port 3000 "starlog-frontend"
cleanup_port 8081 "finance-api"
cleanup_port 8082 "fund-api"
cleanup_port 6379 "redis"

sleep 2

# 2. 检查并清理僵尸进程
echo "🧹 检查僵尸进程..."

# 检查是否有非 PM2 管理的 Next.js 进程
ZOMBIE_PIDS=$(ps aux | grep "next-server" | grep -v "grep" | grep -v "pm2" | awk '{print $2}')

if [ -n "$ZOMBIE_PIDS" ]; then
    echo "   ⚠️  发现非 PM2 管理的 Next.js 进程："
    for pid in $ZOMBIE_PIDS; do
        echo "   - PID: $pid"
        kill -9 $pid 2>/dev/null && echo "   ✅ 已终止 PID $pid"
    done
    sleep 2
else
    echo "   ✅ 未发现僵尸进程"
fi

# 3. 停止所有 PM2 服务（确保干净启动）
echo "🛑 停止现有 PM2 服务..."

# 先检查 PM2 是否运行
if ! pm2 list &>/dev/null; then
    echo "   ⚠️  PM2 未运行，跳过停止步骤"
else
    pm2 stop all 2>/dev/null
    pm2 delete all 2>/dev/null
    echo "   ✅ PM2 服务已清理"
fi
sleep 2

# 4. 清理 Next.js 缓存（生产模式必须）
echo "🧹 清理构建缓存..."
cd /home/admin/.openclaw/workspace/starLog
rm -rf .next
echo "   ✅ 缓存已清理"

# 5. 使用 PM2 统一启动所有服务（生产模式）
echo "🚀 使用 PM2 启动服务（生产模式）..."
cd /home/admin/.openclaw/workspace/starLog
pm2 start ecosystem.config.js

# 6. 保存 PM2 配置（开机自启）
pm2 save

# 7. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 8. 验证服务
echo ""
echo "=== 服务状态 ==="
pm2 status

echo ""
echo "=== 健康检查 ==="

# 前端检查
FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --connect-timeout 10)
if [ "$FRONTEND_CODE" = "200" ]; then
    echo "✅ 前端 (3000): HTTP $FRONTEND_CODE"
else
    echo "❌ 前端 (3000): HTTP $FRONTEND_CODE"
fi

# 金融 API 检查
FINANCE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/health --connect-timeout 10)
if [ "$FINANCE_CODE" = "200" ]; then
    echo "✅ 金融 API (8081): HTTP $FINANCE_CODE"
else
    echo "❌ 金融 API (8081): HTTP $FINANCE_CODE"
fi

# 基金 API 检查
FUND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/api/funds/list --connect-timeout 10)
if [ "$FUND_CODE" = "200" ]; then
    echo "✅ 基金 API (8082): HTTP $FUND_CODE"
else
    echo "❌ 基金 API (8082): HTTP $FUND_CODE"
fi

# Redis 检查
if redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo "✅ Redis: 已连接"
else
    echo "❌ Redis: 未响应"
fi

# PostgreSQL 检查
if docker ps 2>/dev/null | grep -q "starlog-postgres"; then
    echo "✅ PostgreSQL: 容器运行中"
else
    echo "❌ PostgreSQL: 容器未运行"
fi

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "💡 提示："
echo "   - 查看日志：pm2 logs"
echo "   - 监控状态：pm2 monit"
echo "   - 重启服务：pm2 restart all"
echo "   - 清理端口：./scripts/cleanup-port.sh 3000"
echo ""
echo "⚠️  重要提醒："
echo "   - 禁止手动启动 Next.js 服务（必须通过 PM2）"
echo "   - 发现异常先检查 pm2 list"
echo "   - 端口冲突使用 cleanup-port.sh 清理"
