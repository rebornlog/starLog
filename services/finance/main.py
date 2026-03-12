"""
金融数据服务 - 免费开源版
数据源：新浪财经 + 东方财富（无需 AKShare）
功能：股票行情、基金净值（暂时禁用）
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import requests
import redis
import json
from datetime import datetime, time
import random

app = FastAPI(
    title="starLog Finance API",
    description="免费开源金融数据服务 - 股票行情",
    version="2.0.1"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081", "http://47.79.20.10:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis 配置
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    REDIS_AVAILABLE = redis_client.ping()
except:
    redis_client = None
    REDIS_AVAILABLE = False

CACHE_TTL = 300  # 5 分钟缓存

# 热门股票列表（固定）
POPULAR_STOCKS = [
    {"code": "600519", "name": "贵州茅台"}, {"code": "000858", "name": "五粮液"},
    {"code": "000568", "name": "泸州老窖"}, {"code": "600809", "name": "山西汾酒"},
    {"code": "002304", "name": "洋河股份"}, {"code": "600036", "name": "招商银行"},
    {"code": "600030", "name": "中信证券"}, {"code": "600000", "name": "浦发银行"},
    {"code": "000001", "name": "平安银行"}, {"code": "601318", "name": "中国平安"},
    {"code": "600276", "name": "恒瑞医药"}, {"code": "600031", "name": "三一重工"},
    {"code": "000333", "name": "美的集团"}, {"code": "000651", "name": "格力电器"},
    {"code": "000002", "name": "万科 A"}, {"code": "600028", "name": "中国石化"},
    {"code": "601857", "name": "中国石油"}, {"code": "601398", "name": "工商银行"},
    {"code": "601939", "name": "建设银行"}, {"code": "002415", "name": "海康威视"},
    {"code": "002230", "name": "科大讯飞"}, {"code": "300059", "name": "东方财富"},
    {"code": "601888", "name": "中国中免"}, {"code": "600900", "name": "长江电力"},
    {"code": "601012", "name": "隆基股份"}, {"code": "300750", "name": "宁德时代"},
    {"code": "002594", "name": "比亚迪"}, {"code": "600588", "name": "用友网络"},
    {"code": "600048", "name": "保利发展"}, {"code": "601166", "name": "兴业银行"},
]

def get_cache(key: str) -> Optional[Any]:
    if not REDIS_AVAILABLE:
        return None
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except:
        return None

def set_cache(key: str, data: Any, ttl: int = CACHE_TTL) -> None:
    if not REDIS_AVAILABLE:
        return
    try:
        redis_client.setex(key, ttl, json.dumps(data, ensure_ascii=False))
    except:
        pass

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.1", "timestamp": datetime.now().isoformat(), "redis": "connected" if REDIS_AVAILABLE else "disconnected"}

@app.get("/stocks/popular")
async def get_popular_stocks():
    """获取热门股票列表"""
    return POPULAR_STOCKS

@app.get("/stocks/{stock_code}")
async def get_stock_quote(stock_code: str):
    """获取股票实时行情（腾讯财经接口）"""
    cache_key = f"stock:{stock_code}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        # 腾讯财经接口
        prefix = "sh" if stock_code.startswith("6") else "sz"
        url = f"http://qt.gtimg.cn/q={prefix}{stock_code}"
        resp = requests.get(url, timeout=5)
        data = resp.content.decode('gbk')
        
        if not data or "=" not in data:
            raise HTTPException(status_code=404, detail="股票数据不存在")
        
        parts = data.split('"')[1].split('~') if '"' in data else []
        if len(parts) < 8:
            raise HTTPException(status_code=404, detail="数据解析失败")
        
        current = float(parts[3]) if len(parts) > 3 else 0
        prev_close = float(parts[4]) if len(parts) > 4 else 0
        change = current - prev_close
        change_pct = (change / prev_close * 100) if prev_close else 0
        
        result = {
            "code": stock_code,
            "name": parts[1] if len(parts) > 1 else "Unknown",
            "price": current,
            "change": round(change, 2),
            "change_percent": round(change_pct, 2),
            "open": float(parts[5]) if len(parts) > 5 else 0,
            "high": float(parts[6]) if len(parts) > 6 else 0,
            "low": float(parts[7]) if len(parts) > 7 else 0,
            "volume": float(parts[32]) if len(parts) > 32 else 0,
            "turnover": float(parts[33]) if len(parts) > 33 else 0,
            "timestamp": datetime.now().isoformat()
        }
        
        set_cache(cache_key, result)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取股票数据失败：{str(e)}")

@app.get("/market/overview")
async def get_market_overview():
    """获取大盘指数"""
    cache_key = "market:overview"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    indices = {
        "上证指数": "sh000001",
        "深证成指": "sz399001",
        "创业板指": "sz399006",
        "沪深 300": "sh000300"
    }
    
    result = {}
    for name, code in indices.items():
        try:
            url = f"http://qt.gtimg.cn/q={code}"
            resp = requests.get(url, timeout=5)
            data = resp.content.decode('gbk')
            if '"' in data:
                parts = data.split('"')[1].split('~')
                if len(parts) > 4:
                    current = float(parts[3])
                    prev = float(parts[4])
                    change = ((current - prev) / prev * 100) if prev else 0
                    result[name] = {"price": round(current, 2), "change": round(change, 2)}
        except:
            continue
    
    set_cache(cache_key, result, ttl=60)
    return result

# 基金 API 暂时返回空列表（AKShare 不兼容 Python 3.6）
@app.get("/api/funds/list")
async def get_fund_list(fund_type: str = "混合基金", limit: int = 50):
    """获取基金列表（暂时禁用）"""
    return {"funds": [], "count": 0, "type": fund_type, "note": "基金功能暂时禁用，等待 Python 升级"}

@app.get("/api/funds/{fund_id}")
async def get_fund_detail(fund_id: str):
    """获取基金详情（暂时禁用）"""
    raise HTTPException(status_code=503, detail="基金功能暂时禁用，等待 Python 升级")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
