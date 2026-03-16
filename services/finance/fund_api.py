"""
金融数据服务 - 基金实时 API
数据源：天天基金网
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import requests
import redis
import json
import re
from datetime import datetime
import asyncio

app = FastAPI(
    title="starLog Fund API",
    description="天天基金实时数据接口",
    version="1.0.0"
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

CACHE_TTL = 2700  # 基金数据 45 分钟缓存（减少 API 调用）

# 热门基金列表
POPULAR_FUNDS = [
    {"code": "005827", "name": "易方达蓝筹精选混合", "type": "股票型"},
    {"code": "003096", "name": "中欧医疗健康混合 A", "type": "股票型"},
    {"code": "260108", "name": "景顺长城新兴成长混合", "type": "股票型"},
    {"code": "161725", "name": "招商中证白酒指数", "type": "指数型"},
    {"code": "110011", "name": "易方达中小盘混合", "type": "股票型"},
    {"code": "007119", "name": "睿远成长价值混合 A", "type": "股票型"},
    {"code": "000083", "name": "汇添富消费行业混合", "type": "股票型"},
    {"code": "001938", "name": "中欧时代先锋股票 A", "type": "股票型"},
    {"code": "001763", "name": "广发多因子混合", "type": "股票型"},
    {"code": "166002", "name": "中欧新蓝筹混合 A", "type": "混合型"},
    {"code": "000041", "name": "富国天惠成长混合 A", "type": "混合型"},
    {"code": "000171", "name": "易方达裕丰回报债券", "type": "债券型"},
    {"code": "000198", "name": "易方达天天理财货币 A", "type": "货币型"},
    {"code": "000055", "name": "广发纳斯达克 100ETF 联接", "type": "QDII"},
    {"code": "510300", "name": "华泰柏瑞沪深 300ETF", "type": "指数型"},
    {"code": "510500", "name": "南方中证 500ETF", "type": "指数型"},
    {"code": "159915", "name": "易方达创业板 ETF", "type": "指数型"},
    {"code": "513050", "name": "易方达中证海外互联 ETF", "type": "指数型"},
    {"code": "512880", "name": "国泰中证全指证券公司 ETF", "type": "指数型"},
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
    return {"status": "healthy", "version": "1.0.0", "timestamp": datetime.now().isoformat(), "redis": "connected" if REDIS_AVAILABLE else "disconnected"}

def fetch_fund_netvalue(code: str) -> Optional[Dict[str, Any]]:
    """
    获取基金实时净值（同步版本）
    """
    url = f"http://fundgz.1234567.com.cn/js/{code}.js"
    headers = {
        "Referer": "http://fund.eastmoney.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        content = response.text
        
        # 解析 jsonp 数据
        json_match = re.search(r'jsonpgz\((.+?)\)', content)
        if json_match:
            fund_data = json.loads(json_match.group(1))
            
            return {
                "code": fund_data.get("fundcode", ""),
                "name": fund_data.get("name", ""),
                "netValue": float(fund_data.get("gsz", 0) or 0),
                "unitNetValue": float(fund_data.get("dwjz", 0) or 0),
                "accNetValue": float(fund_data.get("dwjz", 0) or 0),
                "change": float(fund_data.get("gszzl", 0) or 0),
                "changePercent": float(fund_data.get("gszzl", 0) or 0),
                "updateTime": fund_data.get("gztime", ""),
                "lastUpdateTime": fund_data.get("jzrq", ""),
            }
    except Exception as e:
        print(f"获取基金 {code} 净值失败：{e}")
    
    return None

# ========== 路由定义顺序很重要！具体路由必须在参数路由之前 ==========

@app.get("/api/funds/list")
async def get_fund_list(
    fund_type: str = Query("all", description="基金类型"),
    limit: int = Query(50, ge=1, le=100)
):
    """
    获取基金列表（实时数据）
    """
    cache_key = f"funds:list:{fund_type}:{limit}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    # 筛选基金
    if fund_type != "all":
        filtered = [f for f in POPULAR_FUNDS if f.get("type") == fund_type]
    else:
        filtered = POPULAR_FUNDS
    
    # 获取实时数据
    funds = []
    for fund in filtered[:limit]:
        try:
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(None, fetch_fund_netvalue, fund["code"])
            
            if data:
                funds.append({
                    **fund,
                    **data
                })
            else:
                # API 获取失败，使用基本信息
                funds.append({
                    **fund,
                    "netValue": 0,
                    "change": 0,
                    "changePercent": 0,
                    "updateTime": ""
                })
        except Exception as e:
            print(f"获取基金 {fund['code']} 失败：{e}")
            funds.append({
                **fund,
                "netValue": 0,
                "change": 0,
                "changePercent": 0,
                "updateTime": ""
            })
    
    result = {"success": True, "funds": funds, "count": len(funds), "type": fund_type}
    set_cache(cache_key, result, 300)  # 5 分钟缓存
    return result

@app.post("/api/funds/batch")
async def get_funds_batch(codes: List[str]):
    """
    批量获取基金净值
    """
    if not codes or len(codes) > 50:
        raise HTTPException(status_code=400, detail="基金代码数量必须在 1-50 之间")
    
    results = []
    for code in codes:
        try:
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(None, fetch_fund_netvalue, code)
            
            if data:
                results.append(data)
        except Exception as e:
            print(f"批量获取基金 {code} 失败：{e}")
    
    return {"success": True, "count": len(results), "data": results}

def fetch_fund_history(code: str, page: int = 1, size: int = 20) -> List[Dict[str, Any]]:
    """
    获取基金历史净值（同步版本）
    数据源：天天基金网
    """
    url = f"http://api.fund.eastmoney.com/f10/lsjz"
    params = {
        "fundCode": code,
        "pageIndex": page,
        "pageSize": size,
        "startDate": "",
        "endDate": "",
        "_": int(datetime.now().timestamp() * 1000)
    }
    headers = {
        "Referer": f"http://fund.eastmoney.com/{code}.html",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        content = response.json()
        
        if content and "Data" in content and "LSJZList" in content["Data"]:
            history_list = content["Data"]["LSJZList"]
            result = []
            
            for item in history_list:
                result.append({
                    "date": item.get("FSRQ", ""),  # 日期
                    "netValue": float(item.get("DWJZ", 0) or 0),  # 单位净值
                    "accNetValue": float(item.get("LJJZ", 0) or 0),  # 累计净值
                    "change": float(item.get("JZZZL", 0) or 0),  # 日增长率
                    "changePercent": float(item.get("JZZZL", 0) or 0),  # 涨跌幅
                })
            
            return result
    except Exception as e:
        print(f"获取基金 {code} 历史净值失败：{e}")
    
    return []

@app.get("/api/funds/{code}/history")
async def get_fund_history(
    code: str,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
):
    """
    获取基金历史净值
    """
    cache_key = f"fund:history:{code}:{page}:{size}"
    cached = get_cache(cache_key)
    if cached:
        return {"success": True, "data": cached, "source": "cache"}
    
    # 获取历史数据
    loop = asyncio.get_event_loop()
    history_data = await loop.run_in_executor(None, fetch_fund_history, code, page, size)
    
    result = {
        "success": True,
        "data": history_data,
        "page": page,
        "size": size,
        "total": len(history_data),
        "code": code
    }
    
    if history_data:
        set_cache(cache_key, history_data, 3600)  # 1 小时缓存
    
    return result

@app.get("/api/funds/{code}")
async def get_fund_detail(code: str):
    """
    获取基金详情（实时数据）
    """
    cache_key = f"fund:detail:{code}"
    cached = get_cache(cache_key)
    if cached:
        return {"success": True, "data": cached, "source": "cache"}
    
    # 获取实时数据
    loop = asyncio.get_event_loop()
    realtime_data = await loop.run_in_executor(None, fetch_fund_netvalue, code)
    
    if not realtime_data:
        raise HTTPException(status_code=404, detail="基金数据不存在")
    
    set_cache(cache_key, realtime_data)
    
    return {"success": True, "data": realtime_data, "source": "realtime"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 启动基金 API 服务...")
    print("💰 基金接口：http://localhost:8082/api/funds/...")
    uvicorn.run(app, host="0.0.0.0", port=8082)
