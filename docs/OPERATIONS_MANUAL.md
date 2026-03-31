# 📚 starLog 运维手册

## 快速启动

### 启动所有服务

```bash
cd /home/admin/.openclaw/workspace/starLog
./start-services.sh
```

**脚本功能：**
1. 清理占用端口的进程
2. 检查并清理僵尸进程
3. 停止现有 PM2 服务
4. 清理 Next.js 缓存
5. 使用 PM2 启动所有服务
6. 保存 PM2 配置
7. 验证服务健康状态

---

## 服务架构

### 端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| starlog-frontend | 3000 | Next.js 前端 |
| finance-api | 8081 | Python 金融 API |
| fund-api | 8082 | Python 基金 API |
| api-proxy | 3001 | Node.js API 代理 |
| PostgreSQL | 5432 | 数据库（Docker） |
| Redis | 6379 | 缓存 |

### PM2 服务列表

```bash
pm2 list
```

**服务 ID 对应：**
- 0: starlog-frontend
- 1: finance-api
- 2: fund-api
- 3: api-proxy

---

## 常用命令

### PM2 管理

```bash
# 查看所有服务
pm2 list

# 查看详细信息
pm2 show <service-name>

# 重启服务
pm2 restart all
pm2 restart starlog-frontend

# 停止服务
pm2 stop all
pm2 stop starlog-frontend

# 删除服务
pm2 delete all
pm2 delete starlog-frontend

# 查看日志
pm2 logs
pm2 logs starlog-frontend --lines 50

# 监控状态
pm2 monit

# 保存配置（开机自启）
pm2 save

# 加载配置
pm2 resurrect
```

### 端口清理

```bash
# 清理特定端口
./scripts/cleanup-port.sh 3000

# 清理所有服务端口
./scripts/cleanup-port.sh 3000
./scripts/cleanup-port.sh 8081
./scripts/cleanup-port.sh 8082
```

### 健康检查

```bash
# 运行健康检查脚本
./scripts/performance-check.sh

# 手动检查
curl -I http://localhost:3000
curl http://localhost:8081/health
curl http://localhost:8082/api/funds/list
redis-cli ping
docker ps | grep postgres
```

---

## 故障排查

### 问题 1：前端服务无法启动

**现象：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**原因：** 端口 3000 被占用

**解决：**
```bash
# 1. 查找占用进程
netstat -tlnp | grep 3000

# 2. 终止进程
kill -9 <PID>

# 3. 或使用清理脚本
./scripts/cleanup-port.sh 3000

# 4. 重启服务
pm2 restart starlog-frontend
```

**预防：**
- 禁止手动运行 `npm start` 或 `npm run dev`
- 所有服务必须通过 PM2 启动
- 使用 `start-services.sh` 统一启动

---

### 问题 2：服务频繁重启

**现象：**
```
pm2 list 显示重启次数 > 50
```

**排查步骤：**

1. **查看日志**
   ```bash
   pm2 logs <service-name> --lines 100
   ```

2. **检查错误**
   ```bash
   pm2 logs <service-name> --err --lines 100
   ```

3. **检查资源**
   ```bash
   pm2 monit
   free -h
   df -h
   ```

4. **常见原因**
   - 端口占用 → 清理端口
   - 内存不足 → 增加内存限制
   - 数据库连接失败 → 检查数据库
   - 代码错误 → 查看错误日志

---

### 问题 3：数据库连接失败

**现象：**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决：**
```bash
# 1. 检查 Docker 容器
docker ps | grep postgres

# 2. 重启容器
docker restart starlog-postgres

# 3. 查看容器日志
docker logs starlog-postgres --tail 50

# 4. 检查数据库连接
docker exec -it starlog-postgres psql -U starlog -c "SELECT 1"
```

---

### 问题 4：Redis 连接失败

**现象：**
```
Error: Redis connection failed
```

**解决：**
```bash
# 1. 检查 Redis 状态
redis-cli ping

# 2. 启动 Redis
sudo systemctl start redis

# 3. 查看 Redis 日志
sudo journalctl -u redis --tail 50
```

---

## 监控告警

### 系统监控

**监控脚本：** `scripts/monitor-alert.sh`

**运行频率：** 每 5 分钟（cron 自动执行）

**检查项：**
- 内存使用率（>80% 告警）
- CPU 负载（>90% 告警）
- 磁盘空间（>85% 告警）
- 服务端口（3000, 8081, 8082, 3001）
- Redis 连接
- PostgreSQL 容器
- PM2 重启次数（>50 次告警）

**日志位置：**
- `/tmp/starlog-monitor.log` - 检查日志
- `/tmp/starlog-alerts.log` - 告警日志

---

### 数据库备份

**备份脚本：** `scripts/backup-db.sh`

**运行频率：** 每天 3:00（cron 自动执行）

**备份位置：** `/home/admin/.openclaw/workspace/starLog/backups/`

**保留策略：** 最近 7 天

**手动备份：**
```bash
./scripts/backup-db.sh
```

**恢复数据库：**
```bash
# 1. 解压备份
gunzip backups/starlog_20260325_030000.sql.gz

# 2. 恢复数据
docker exec -i starlog-postgres psql -U starlog -d starlog < backups/starlog_20260325_030000.sql
```

---

## 定时任务

### Cron 配置

```bash
crontab -l
```

**当前配置：**
```bash
# 每 5 分钟执行一次监控告警
*/5 * * * * /home/admin/.openclaw/workspace/starLog/scripts/monitor-alert.sh

# 每天凌晨 3 点执行数据库备份
0 3 * * * /home/admin/.openclaw/workspace/starLog/scripts/backup-db.sh

# 每周日凌晨 2 点清理 PM2 日志
0 2 * * 0 pm2 flush

# 每天凌晨 4 点重启前端服务（预防内存泄漏）
0 4 * * * pm2 restart starlog-frontend
```

---

## 性能优化

### 图片优化

```bash
# 转换所有图片为 WebP
./scripts/optimize-images.sh
```

**效果：** 体积减少 30-50%

---

### 性能检查

```bash
# 运行性能检查
./scripts/performance-check.sh
```

**检查项：**
- 网站响应时间
- 图片优化状态
- 缓存配置
- 服务状态
- 数据库连接
- 系统资源

---

## 最佳实践

### ✅ 应该做的

1. **统一使用 PM2 管理所有服务**
   - 启动：`pm2 start <service>`
   - 重启：`pm2 restart <service>`
   - 停止：`pm2 stop <service>`

2. **使用启动脚本**
   - `./start-services.sh` - 完整启动流程
   - 自动清理端口和僵尸进程

3. **定期检查**
   - `pm2 list` - 服务状态
   - `pm2 logs` - 查看日志
   - `pm2 monit` - 监控资源

4. **备份重要数据**
   - 数据库每日自动备份
   - 记忆文件定期备份

5. **记录运维日志**
   - 使用 memory-tool.sh 记录操作
   - 重要决策写入 MEMORY.md

---

### ❌ 禁止行为

1. **禁止手动启动服务**
   - ❌ `npm start`
   - ❌ `npm run dev`
   - ❌ `node server.js`

2. **禁止绕过 PM2**
   - 所有服务必须由 PM2 管理
   - 不要直接运行进程

3. **禁止忽略告警**
   - 监控告警立即处理
   - 重启次数异常要排查

4. **禁止不查看日志**
   - 故障先查日志
   - 不要盲目重启

---

## 工具脚本

### 脚本列表

| 脚本 | 功能 | 使用说明 |
|------|------|----------|
| `start-services.sh` | 启动所有服务 | `./start-services.sh` |
| `monitor-alert.sh` | 监控告警 | 自动执行（每 5 分钟） |
| `backup-db.sh` | 数据库备份 | 自动执行（每天 3:00） |
| `cleanup-port.sh` | 清理端口 | `./cleanup-port.sh 3000` |
| `optimize-images.sh` | 图片优化 | `./optimize-images.sh` |
| `performance-check.sh` | 性能检查 | `./performance-check.sh` |
| `memory-tool.sh` | 记忆管理 | `./memory-tool.sh status` |

---

## 故障案例

### 案例 1：前端重启 133 次

**时间：** 2026-03-25 08:16

**现象：**
- PM2 显示重启 133 次
- 错误：`EADDRINUSE: address already in use :::3000`

**根因：**
- 僵尸进程（PID 349782）占用端口 3000
- 该进程在 04:00 启动，不受 PM2 管理

**解决：**
```bash
# 终止僵尸进程
kill -9 349782

# 重启 PM2 服务
pm2 restart starlog-frontend
```

**预防：**
- 启动脚本增加僵尸进程检查
- 禁止手动启动 Next.js 服务

---

## 参考资源

### 文档

- [运维脚本说明](scripts/README.md)
- [SEO 优化指南](docs/SEO_OPTIMIZATION.md)
- [Umami 配置](docs/UMAMI_SETUP.md)
- [CDN 配置](docs/CLOUDFLARE_CDN.md)
- [记忆增强指南](skills/MEMORY_ENHANCEMENT_GUIDE.md)

### 日志位置

| 日志类型 | 位置 |
|----------|------|
| PM2 日志 | `~/.pm2/logs/` |
| 监控日志 | `/tmp/starlog-monitor.log` |
| 告警日志 | `/tmp/starlog-alerts.log` |
| 备份日志 | `/tmp/starlog-backup.log` |
| 图片优化 | `/tmp/starlog-image-optimize.log` |

---

## 联系支持

- **GitHub:** https://github.com/rebornlog/starLog
- **Email:** 944183654@qq.com
- **文档:** https://starlog.dev

---

**最后更新：** 2026-03-25 08:21
