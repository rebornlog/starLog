# 📦 starLog 部署指南

> 完整的生产环境部署教程 | 包含 Docker、PM2、云服务器部署

---

## 🎯 部署方式选择

| 部署方式 | 难度 | 适用场景 | 推荐指数 |
|---------|------|---------|---------|
| **Docker** | ⭐ | 快速部署、测试环境 | ⭐⭐⭐⭐⭐ |
| **PM2** | ⭐⭐ | 生产环境、VPS | ⭐⭐⭐⭐⭐ |
| **手动部署** | ⭐⭐⭐ | 学习、自定义配置 | ⭐⭐⭐ |
| **云平台** | ⭐⭐ | 企业级、高可用 | ⭐⭐⭐⭐ |

---

## 方式一：Docker 部署（最简单）

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 1. 检查 Docker 环境

```bash
# 检查 Docker 版本
docker --version
docker-compose --version

# 如果未安装，参考官方文档：
# https://docs.docker.com/get-docker/
```

### 2. 克隆项目

```bash
git clone https://github.com/rebornlog/starLog.git
cd starLog
```

### 3. 配置环境变量

```bash
# 复制环境变量文件
cp .env.example .env.local

# 编辑配置文件
vim .env.local
# 或
nano .env.local
```

**最小化配置**:
```bash
# 数据库连接
DATABASE_URL="postgresql://postgres:starlog123@postgres:5432/starlog"

# Redis（可选）
REDIS_URL="redis://redis:6379"
```

### 4. 启动服务

```bash
# 一键启动所有服务
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5. 初始化数据库

```bash
# 进入应用容器
docker-compose exec app sh

# 生成 Prisma 客户端
npx prisma generate

# 执行数据库迁移
npx prisma migrate deploy

# 退出容器
exit
```

### 6. 访问应用

```
http://localhost:3000
```

### 7. 常用命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f app

# 进入容器
docker-compose exec app sh

# 重新构建
docker-compose build --no-cache
```

---

## 方式二：PM2 部署（生产环境推荐）

### 前置要求

- Node.js 18+
- PostgreSQL 12+
- Redis 6+ (可选)
- PM2

### 1. 安装 Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Mac
brew install node@18

# 验证安装
node --version
npm --version
```

### 2. 安装 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install -y postgresql-server postgresql-contrib

# 初始化数据库
sudo postgresql-setup --initdb

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. 创建数据库

```bash
# 切换到 postgres 用户
sudo -i -u postgres

# 进入 PostgreSQL
psql

# 创建数据库和用户
CREATE DATABASE starlog;
CREATE USER starlog_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE starlog TO starlog_user;
\q

# 退出
exit
```

### 4. 安装 Redis（可选）

```bash
# Ubuntu/Debian
sudo apt-get install -y redis-server

# CentOS/RHEL
sudo yum install -y redis

# 启动服务
sudo systemctl start redis
sudo systemctl enable redis
```

### 5. 克隆项目

```bash
git clone https://github.com/rebornlog/starLog.git
cd starLog
```

### 6. 安装依赖

```bash
npm install
```

### 7. 配置环境变量

```bash
cp .env.example .env.local
vim .env.local
```

**生产环境配置**:
```bash
# 数据库连接
DATABASE_URL="postgresql://starlog_user:your_password@localhost:5432/starlog"

# Redis
REDIS_URL="redis://localhost:6379"

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL="http://your-domain.com"
PORT=3000
```

### 8. 构建项目

```bash
# 生成 Prisma 客户端
npx prisma generate

# 执行数据库迁移
npx prisma migrate deploy

# 构建生产版本
npm run build
```

### 9. 安装 PM2

```bash
npm install -g pm2
```

### 10. 启动服务

```bash
# 启动应用
pm2 start npm --name "starlog" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status

# 查看日志
pm2 logs starlog

# 监控
pm2 monit
```

### 11. 配置 Nginx（可选）

```bash
# 安装 Nginx
sudo apt-get install -y nginx  # Ubuntu
sudo yum install -y nginx      # CentOS

# 创建配置文件
sudo vim /etc/nginx/sites-available/starlog
```

**Nginx 配置**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /_next/static {
        alias /path/to/starLog/.next/static;
        expires 365d;
        access_log off;
    }
}
```

**启用配置**:
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/starlog /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 12. 配置 HTTPS（推荐）

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx  # Ubuntu
sudo yum install -y certbot python3-certbot-nginx      # CentOS

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 3 * * * certbot renew --quiet
```

---

## 方式三：云服务器部署

### 阿里云 ECS

#### 1. 购买实例

- 选择 Ubuntu 20.04 或 CentOS 7+
- 2 核 4G 起步
- 开放端口：80, 443, 3000

#### 2. 安全组配置

```
入方向规则：
- HTTP: 80
- HTTPS: 443
- 自定义：3000
```

#### 3. 部署步骤

参考 **方式二：PM2 部署**

---

### 腾讯云 CVM

#### 1. 购买实例

- 选择 Ubuntu 20.04 或 CentOS 7+
- 2 核 4G 起步
- 开放端口：80, 443, 3000

#### 2. 安全组配置

```
入方向规则：
- HTTP: 80
- HTTPS: 443
- 自定义：3000
```

#### 3. 部署步骤

参考 **方式二：PM2 部署**

---

## 📊 性能优化建议

### 1. 启用 Redis 缓存

```bash
# .env.local
REDIS_URL="redis://localhost:6379"
```

### 2. 配置 CDN

将静态资源托管到 CDN：
- 阿里云 OSS
- 腾讯云 COS
- Cloudflare

### 3. 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_category ON posts(category);
```

### 4. 启用 Gzip 压缩

**Nginx 配置**:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/json application/javascript;
```

---

## 🔍 监控与日志

### 1. PM2 监控

```bash
# 实时监控
pm2 monit

# 查看日志
pm2 logs starlog

# 查看状态
pm2 status
```

### 2. 系统监控

```bash
# 安装 htop
sudo apt-get install -y htop

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 3. 日志管理

```bash
# PM2 日志轮转
pm2 install pm2-logrotate

# 配置日志大小
pm2 set pm2-logrotate:max_size 10M

# 配置保留数量
pm2 set pm2-logrotate:retain 7
```

---

## 🐛 故障排查

### 1. 应用无法启动

```bash
# 查看 PM2 日志
pm2 logs starlog --lines 100

# 查看端口占用
lsof -i :3000

# 重启应用
pm2 restart starlog
```

### 2. 数据库连接失败

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 测试连接
psql -h localhost -U starlog_user -d starlog

# 查看 PostgreSQL 日志
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### 3. 内存不足

```bash
# 查看内存使用
free -h

# 增加 Swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 4. 磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 清理 NPM 缓存
npm cache clean --force

# 清理旧版本
pm2 flush
```

---

## 📈 备份与恢复

### 1. 数据库备份

```bash
# 备份数据库
pg_dump -U starlog_user starlog > backup_$(date +%Y%m%d).sql

# 恢复数据库
psql -U starlog_user starlog < backup_20260309.sql
```

### 2. 定时备份

```bash
# 创建备份脚本
vim /usr/local/bin/backup-starlog.sh

#!/bin/bash
BACKUP_DIR="/backup/starlog"
DATE=$(date +%Y%m%d)
pg_dump -U starlog_user starlog > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

# 添加执行权限
chmod +x /usr/local/bin/backup-starlog.sh

# 添加定时任务
crontab -e
# 每天凌晨 3 点备份
0 3 * * * /usr/local/bin/backup-starlog.sh
```

---

## ✅ 部署检查清单

- [ ] Node.js 18+ 已安装
- [ ] PostgreSQL 12+ 已安装并运行
- [ ] Redis 已安装并运行（可选）
- [ ] 项目代码已克隆
- [ ] 依赖已安装
- [ ] 环境变量已配置
- [ ] 数据库已初始化
- [ ] 项目已构建
- [ ] 服务已启动
- [ ] 防火墙已配置
- [ ] Nginx 已配置（可选）
- [ ] HTTPS 已配置（可选）
- [ ] 监控已配置
- [ ] 备份已配置

---

## 📞 获取帮助

- 📖 文档：[README.md](README.md)
- 🐛 Issue: [GitHub Issues](https://github.com/rebornlog/starLog/issues)
- 📧 Email: 944183654@qq.com

---

**🎉 部署成功！享受你的 starLog 吧！**
