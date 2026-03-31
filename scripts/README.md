# starLog 运维脚本

## 📋 脚本列表

### 1. monitor-alert.sh - 监控告警脚本

**功能：** 每 5 分钟自动检查系统资源和服务状态

**检查项：**
- ✅ 内存使用率（阈值：80%）
- ✅ CPU 负载（阈值：90%）
- ✅ 磁盘空间（阈值：85%）
- ✅ 服务端口（3000, 8081, 8082, 3001）
- ✅ Redis 连接
- ✅ PostgreSQL 容器状态
- ✅ PM2 重启次数（阈值：50 次）

**自动修复：** 服务宕机时自动尝试重启

**日志位置：**
- 检查日志：`/tmp/starlog-monitor.log`
- 告警日志：`/tmp/starlog-alerts.log`

**手动执行：**
```bash
/home/admin/.openclaw/workspace/starLog/scripts/monitor-alert.sh
```

---

### 2. backup-db.sh - 数据库备份脚本

**功能：** 每天凌晨 3 点自动备份 PostgreSQL 数据库

**备份策略：**
- 全量备份（pg_dump + gzip 压缩）
- 保留最近 7 天备份
- 自动清理过期备份

**备份位置：** `/home/admin/.openclaw/workspace/starLog/backups/`

**日志位置：** `/tmp/starlog-backup.log`

**手动执行：**
```bash
/home/admin/.openclaw/workspace/starLog/scripts/backup-db.sh
```

**恢复数据库：**
```bash
# 解压备份文件
gunzip /home/admin/.openclaw/workspace/starLog/backups/starlog_20260325_030000.sql.gz

# 恢复到数据库
docker exec -i starlog-postgres psql -U starlog -d starlog < /home/admin/.openclaw/workspace/starLog/backups/starlog_20260325_030000.sql
```

---

## ⏰ 定时任务配置

查看当前 cron 配置：
```bash
crontab -l
```

**配置说明：**
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

## 🚨 告警处理流程

1. **查看告警日志**
   ```bash
   tail -50 /tmp/starlog-alerts.log
   ```

2. **检查服务状态**
   ```bash
   pm2 list
   pm2 logs <service-name> --lines 50
   ```

3. **手动重启服务**
   ```bash
   pm2 restart <service-name>
   ```

4. **验证服务恢复**
   ```bash
   curl -I http://localhost:3000
   curl -I http://localhost:8081/health
   curl -I http://localhost:8082/api/funds/list
   ```

---

## 📊 监控指标说明

### 内存使用
- **正常：** < 70%
- **警告：** 70-80%
- **危险：** > 80%（触发告警）

### CPU 负载
- **正常：** < 70%
- **警告：** 70-90%
- **危险：** > 90%（触发告警）

### 磁盘空间
- **正常：** < 75%
- **警告：** 75-85%
- **危险：** > 85%（触发告警）

### PM2 重启次数
- **正常：** < 10 次
- **警告：** 10-50 次
- **危险：** > 50 次（触发告警，需排查根因）

---

## 🔧 故障排查

### 前端服务反复重启
```bash
# 查看重启次数
pm2 list | grep starlog-frontend

# 查看错误日志
pm2 logs starlog-frontend --lines 100

# 检查端口占用
fuser -k 3000/tcp

# 清理缓存并重启
cd /home/admin/.openclaw/workspace/starLog
rm -rf .next
pm2 restart starlog-frontend
```

### 数据库连接失败
```bash
# 检查容器状态
docker ps | grep postgres

# 重启容器
docker restart starlog-postgres

# 查看容器日志
docker logs starlog-postgres --tail 50
```

### Redis 连接失败
```bash
# 检查 Redis 状态
redis-cli ping

# 重启 Redis
sudo systemctl restart redis

# 查看 Redis 日志
sudo journalctl -u redis --tail 50
```

---

## 📝 维护记录

每次执行维护操作后，请在下方记录：

```markdown
### 2026-03-25
- [ ] 监控脚本部署
- [ ] 备份脚本部署
- [ ] 定时任务配置
- [ ] 首次完整测试
```
