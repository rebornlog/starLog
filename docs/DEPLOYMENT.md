# starLog 部署文档

## 📋 系统要求

- Node.js >= 18.x
- Python >= 3.6
- Redis >= 6.0
- PM2 >= 5.0
- 内存：>= 2GB
- 磁盘：>= 10GB

---

## 🚀 快速部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd starLog
```

### 2. 安装前端依赖

```bash
npm install
# 或
yarn install
```

### 3. 安装 Python 依赖

```bash
cd services/finance
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. 配置环境变量

```bash
# 复制示例配置
cp .env.example .env

# 编辑配置
vim .env
```

**必要配置：**
```env
# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# API 配置
API_BASE_URL=http://localhost:8081
FRONTEND_URL=http://localhost:3000

# 可选：告警 Webhook
ALERT_WEBHOOK_URL=https://hooks.example.com/alert
```

### 5. 启动服务

```bash
# 使用 PM2 启动所有服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs
```

---

## 🔧 服务说明

| 服务名 | 端口 | 说明 |
|--------|------|------|
| starlog-frontend | 3000 | Next.js 前端应用 |
| finance-api | 8081 | FastAPI 金融数据服务 |
| fund-api | 8082 | 基金数据 API（备用） |
| api-proxy | 8080 | API 代理网关 |
| data-refresh | - | 后台数据刷新脚本 |

---

## 📊 监控与告警

### 1. 配置监控脚本

```bash
# 编辑监控脚本
vim scripts/monitor-services.sh

# 配置告警 Webhook（可选）
WEBHOOK_URL="https://hooks.example.com/alert"
```

### 2. 添加定时任务

```bash
crontab -e

# 每 5 分钟检查一次服务状态
*/5 * * * * /path/to/starLog/scripts/monitor-services.sh

# 开盘前数据预取（交易日 9:25）
25 9 * * 1-5 /path/to/starLog/scripts/pre-market-refresh.py
```

### 3. 查看监控日志

```bash
# 实时监控日志
tail -f /tmp/service-monitor.log

# 查看告警记录
tail -f /tmp/service-alerts.log
```

---

## 🔄 更新部署

### 1. 拉取最新代码

```bash
git pull origin main
```

### 2. 安装新依赖

```bash
# 前端
npm install

# Python
source services/finance/venv/bin/activate
pip install -r requirements.txt
```

### 3. 重启服务

```bash
pm2 restart all
# 或重启特定服务
pm2 restart finance-api
pm2 restart starlog-frontend
```

---

## 🐛 故障排查

### 服务无法启动

```bash
# 查看 PM2 日志
pm2 logs <service-name>

# 查看错误日志
cat /tmp/<service-name>-error.log
```

### API 响应慢

```bash
# 检查 Redis 连接
redis-cli ping

# 检查缓存命中率
curl http://localhost:8081/health

# 查看 API 日志
pm2 logs finance-api
```

### 数据不更新

```bash
# 手动触发刷新
curl http://localhost:8081/api/funds/list?refresh=true

# 检查后台刷新脚本
pm2 logs data-refresh

# 查看刷新日志
cat /tmp/refresh-all-data.log
```

---

## 📈 性能优化

### 1. Redis 缓存优化

```bash
# 查看缓存使用情况
redis-cli INFO memory

# 清理过期缓存
redis-cli KEYS "funds:*" | xargs redis-cli DEL
```

### 2. 数据库优化

```bash
# 定期清理旧数据
python scripts/cleanup-old-data.py

# 优化索引
psql -d starlog -c "VACUUM ANALYZE"
```

### 3. 前端优化

```bash
# 构建优化版本
npm run build

# 分析包大小
npm run analyze
```

---

## 🔒 安全建议

### 1. 防火墙配置

```bash
# 只开放必要端口
ufw allow 3000/tcp  # 前端
ufw allow 8081/tcp  # API
ufw enable
```

### 2. HTTPS 配置

```bash
# 使用 Nginx 反向代理
# 配置 Let's Encrypt 证书
certbot --nginx -d your-domain.com
```

### 3. 访问控制

```bash
# 配置 API 限流
# 编辑 services/finance/main.py
# 添加 rate limiting 中间件
```

---

## 📞 技术支持

- **文档：** `/docs` 目录
- **日志：** `/tmp/*.log`
- **监控：** `scripts/monitor-services.sh`
- **备份：** `scripts/backup-db.sh`

---

**最后更新：** 2026-03-19  
**版本：** 2.4.0
