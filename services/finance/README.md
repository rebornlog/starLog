# Python 金融数据服务 - A 股数据

基于 AkShare 和新浪财经的 A 股数据服务，无需 API Key。

## 安装

```bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install fastapi uvicorn akshare requests pandas redis
```

## 启动服务

```bash
# 开发模式
uvicorn main:app --reload --port 8000

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API 文档

启动后访问：http://localhost:8000/docs
