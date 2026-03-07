# 📦 starLog 生产环境部署指南

---

## 🚀 快速部署（推荐）

### 方式 1: 使用部署脚本

```bash
# SSH 登录生产服务器
ssh admin@47.79.20.10

# 进入项目目录
cd /home/admin/starLog

# 执行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 方式 2: 手动部署

```bash
# 1. SSH 登录
ssh admin@47.79.20.10

# 2. 进入目录
cd /home/admin/starLog

# 3. 拉取代码
git pull

# 4. 安装依赖
npm install --production

# 5. 构建
npm run build

# 6. 重启服务
pm2 restart starlog

# 7. 验证
curl -I http://localhost:3000/
```

---

## 📋 部署前检查清单

- [ ] 本地构建成功 (`npm run build` ✓)
- [ ] 所有测试通过 (参考 `DELIVERY_CHECKLIST.md`)
- [ ] Git 代码已提交
- [ ] 生产环境可 SSH 访问
- [ ] PM2 服务正常运行

---

## 🔍 部署后验证

### 1. 检查服务状态
```bash
pm2 status starlog
```

**期望输出**:
```
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ...  │ status    │ cpu      │ mem      │ user     │ watching │
├────┼───────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ starlog   │ default     │ 1.0.0   │ fork    │ 12345    │ 10s    │ ...  │ online    │ 0%       │ 150MB    │ admin    │ disabled │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### 2. 测试页面访问
```bash
# 首页
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/

# 星座页面
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/zodiac

# 问卦页面
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/iching

# 饮食页面
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/diet
```

**期望输出**: `200` (所有页面)

### 3. 浏览器访问测试
- [ ] http://47.79.20.10:3000/ - 首页正常
- [ ] http://47.79.20.10:3000/zodiac - 星座页面正常
- [ ] http://47.79.20.10:3000/iching - 问卦页面正常
- [ ] http://47.79.20.10:3000/diet - 饮食页面正常

### 4. 检查日志
```bash
# 查看实时日志
pm2 logs starlog --lines 50

# 查看错误日志
pm2 logs starlog --err --lines 50
```

**期望**: 无红色错误日志

---

## 🛠️ 故障排查

### 问题 1: 构建失败
```bash
# 清理缓存重新构建
rm -rf node_modules/.cache
rm -rf .next
npm run build
```

### 问题 2: 服务无法启动
```bash
# 查看 PM2 日志
pm2 logs starlog --err

# 检查端口占用
lsof -i :3000

# 强制重启
pm2 delete starlog
pm2 start npm --name starlog -- start
```

### 问题 3: 页面 500 错误
```bash
# 查看应用日志
pm2 logs starlog --lines 100

# 检查环境变量
cat .env.local

# 重启服务
pm2 restart starlog
```

### 问题 4: 内存不足
```bash
# 查看内存使用
pm2 monit

# 限制最大内存
pm2 restart starlog --max-memory-restart 500M
```

---

## 📊 性能监控

### 实时监控
```bash
pm2 monit
```

### 查看统计
```bash
pm2 show starlog
```

### 设置开机自启
```bash
pm2 startup
pm2 save
```

---

## 🔄 回滚方案

如部署后发现问题，立即回滚：

```bash
# 1. 回滚 Git 代码
cd /home/admin/starLog
git reset --hard HEAD~1

# 2. 重新构建
npm run build

# 3. 重启服务
pm2 restart starlog
```

---

## 📝 部署记录模板

每次部署后填写：

```markdown
## 部署记录 - YYYY-MM-DD

**部署时间**: HH:mm
**部署人**: [姓名]
**部署版本**: [Git commit hash]

### 变更内容
- [功能 1]
- [功能 2]

### 部署结果
- [ ] 构建成功
- [ ] 服务重启成功
- [ ] 页面访问正常
- [ ] 功能测试通过

### 问题记录
[如有问题，记录在此]

### 验证人
[签名]
```

---

## 🎯 本次部署信息

**部署日期**: 2026-03-08
**部署内容**: 
- ✨ 星座运势功能
- ☯ 易经问卦功能
- 🥗 能量饮食功能

**测试状态**: ✅ 本地构建通过
**部署状态**: ⏳ 待执行

---

**最后更新**: 2026-03-08
