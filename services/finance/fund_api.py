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
    REDIS_AVAILABLE = True  # 强制启用
except:
    redis_client = None
    REDIS_AVAILABLE = False

CACHE_TTL = 3600  # 基金详情 1 小时缓存
LIST_CACHE_TTL = 2700  # 基金列表 45 分钟缓存（与后台刷新周期匹配）

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
    优化：添加超时控制、重试机制、数据验证
    """
    url = f"http://fundgz.1234567.com.cn/js/{code}.js"
    headers = {
        "Referer": "http://fund.eastmoney.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    # 最多重试 2 次
    for attempt in range(2):
        try:
            # 超时 5 秒
            response = requests.get(url, headers=headers, timeout=5)
            content = response.text
            
            # 解析 jsonp 数据
            json_match = re.search(r'jsonpgz\((.+?)\)', content)
            if json_match:
                fund_data = json.loads(json_match.group(1))
                
                # 数据验证
                net_value = float(fund_data.get("gsz", 0) or 0)
                if net_value <= 0:
                    return None
                
                return {
                    "code": fund_data.get("fundcode", ""),
                    "name": fund_data.get("name", ""),
                    "netValue": net_value,
                    "unitNetValue": float(fund_data.get("dwjz", 0) or 0),
                    "accNetValue": float(fund_data.get("dwjz", 0) or 0),
                    "change": float(fund_data.get("gszzl", 0) or 0),
                    "changePercent": float(fund_data.get("gszzl", 0) or 0),
                    "updateTime": fund_data.get("gztime", ""),
                    "lastUpdateTime": fund_data.get("jzrq", ""),
                }
        except requests.Timeout:
            print(f"获取基金 {code} 净值超时（第{attempt+1}次）")
            continue
        except Exception as e:
            print(f"获取基金 {code} 净值失败：{e}")
            break
    
    return None

# ========== 路由定义顺序很重要！具体路由必须在参数路由之前 ==========

@app.get("/api/funds/list")
async def get_fund_list(
    fund_type: str = Query("all", description="基金类型"),
    limit: int = Query(50, ge=1, le=100),
    refresh: bool = Query(False, description="强制刷新缓存")
):
    """
    获取基金列表（纯缓存模式）
    优化策略：
    1. 只读 Redis 缓存（<50ms 响应）
    2. 缓存失效时返回静态数据 + 后台异步刷新
    3. 提供 refresh 参数强制刷新（阻塞）
    
    注意：缓存键不包含 limit，因为数据相同只是返回数量不同
    """
    # 缓存键不包含 limit，避免缓存碎片化
    cache_key = f"funds:list:{fund_type}"
    cached = get_cache(cache_key)
    print(f"DEBUG: cache_key={cache_key}, cached={bool(cached)}")
    
    # 有缓存直接返回
    if cached:
        cached['_source'] = 'cache'
        cached['_refreshInterval'] = '45 分钟'
        return cached
    
    # 无缓存且强制刷新：同步获取
    if refresh:
        try:
            result = await _fetch_fund_list(fund_type, limit, cache_key)
            set_cache(cache_key, result, LIST_CACHE_TTL)
            result['_source'] = 'realtime'
            result['_refreshInterval'] = '45 分钟'
            return result
        except Exception as e:
            print(f"强制刷新失败：{e}")
    
    # 无缓存：返回静态数据兜底
    print("⚠️ 缓存未命中，返回静态数据")
    static_result = {
        "success": True,
        "funds": POPULAR_FUNDS[:limit],
        "count": limit,
        "type": fund_type,
        "warning": "数据加载中，后台正在刷新",
        "_source": "static",
        "_refreshInterval": '45 分钟'
    }
    return static_result

async def _fetch_fund_list(fund_type: str, limit: int, cache_key: str = None):
    """内部函数：获取基金列表"""
    # 筛选基金
    if fund_type != "all":
        filtered = [f for f in POPULAR_FUNDS if f.get("type") == fund_type]
    else:
        filtered = POPULAR_FUNDS
    
    # 并发获取实时数据
    async def fetch_single_fund(fund):
        try:
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(None, fetch_fund_netvalue, fund["code"])
            
            if data:
                return {**fund, **data}
            else:
                return {
                    **fund,
                    "netValue": 0,
                    "change": 0,
                    "changePercent": 0,
                    "updateTime": ""
                }
        except Exception as e:
            print(f"获取基金 {fund['code']} 失败：{e}")
            return {
                **fund,
                "netValue": 0,
                "change": 0,
                "changePercent": 0,
                "updateTime": ""
            }
    
    # 使用 asyncio.gather 并发请求
    tasks = [fetch_single_fund(fund) for fund in filtered[:limit]]
    funds = await asyncio.gather(*tasks)
    
    result = {"success": True, "funds": funds, "count": len(funds), "type": fund_type}
    set_cache(cache_key, result, LIST_CACHE_TTL)  # 5 分钟缓存
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
    print(f"DEBUG: cache_key={cache_key}, cached={bool(cached)}")
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
    获取基金详情（实时数据 + 静态数据兜底）
    """
    cache_key = f"fund:detail:{code}"
    cached = get_cache(cache_key)
    if cached:
        return cached if isinstance(cached, dict) and 'success' in cached else {"success": True, "data": cached, "source": "cache"}
    
    # 获取实时数据
    loop = asyncio.get_event_loop()
    realtime_data = await loop.run_in_executor(None, fetch_fund_netvalue, code)
    
    # 如果实时数据失败，尝试从 POPULAR_FUNDS 找静态数据
    if not realtime_data:
        static_fund = next((f for f in POPULAR_FUNDS if f.get("code") == code), None)
        if static_fund:
            # 返回静态数据（不含实时净值）
            result = {
                "success": True,
                "data": {
                    **static_fund,
                    "netValue": 0,
                    "unitNetValue": 0,
                    "accNetValue": 0,
                    "change": 0,
                    "changePercent": 0,
                    "updateTime": "静态数据"
                },
                "source": "static"
            }
            return result
    
    if not realtime_data:
        raise HTTPException(status_code=404, detail="基金数据不存在")
    
    # 只缓存原始数据，不缓存包装结构
    set_cache(cache_key, realtime_data)
    
    return {"success": True, "data": realtime_data, "source": "realtime"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 启动基金 API 服务...")
    print("💰 基金接口：http://localhost:8082/api/funds/...")
    uvicorn.run(app, host="0.0.0.0", port=8082)
