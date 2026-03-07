#!/bin/bash

# starLog 生产环境部署脚本
# 使用方法：./deploy.sh

set -e

echo "🚀 开始部署 starLog 到生产环境..."

# 1. 进入项目目录
cd /home/admin/.openclaw/workspace/starLog

echo "📦 步骤 1/5: 拉取最新代码..."
git pull origin main || git pull

echo "📦 步骤 2/5: 安装依赖..."
npm install --production

echo "📦 步骤 3/5: 构建生产版本..."
npm run build

echo "📦 步骤 4/5: 重启 PM2 服务..."
pm2 restart starlog || pm2 start npm --name starlog -- start

echo "📦 步骤 5/5: 验证服务..."
sleep 3

# 检查服务状态
pm2 status starlog

# 测试 HTTP 响应
echo ""
echo "🌐 测试服务响应..."
curl -s -o /dev/null -w "HTTP 状态码：%{http_code}\n响应时间：%{time_total}s\n" http://localhost:3000/

echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 访问地址:"
echo "  - 首页：http://47.79.20.10:3000/"
echo "  - 星座：http://47.79.20.10:3000/zodiac"
echo "  - 问卦：http://47.79.20.10:3000/iching"
echo "  - 饮食：http://47.79.20.10:3000/diet"
echo ""
echo "📝 查看日志：pm2 logs starlog"
echo "🛑 停止服务：pm2 stop starlog"
echo "🔄 重启服务：pm2 restart starlog"
