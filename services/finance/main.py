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

@app.get("/api/stocks/popular")
async def get_popular_stocks():
    """获取热门股票列表（含实时价格）"""
    cache_key = "stocks:popular"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    result = []
    for stock in POPULAR_STOCKS[:30]:  # 限制 30 只
        try:
            # 获取实时价格
            quote = await get_stock_quote(stock["code"])
            result.append({
                "code": stock["code"],
                "name": stock["name"],
                "price": quote["price"],
                "change": quote["change"],
                "changePercent": quote["change_percent"]
            })
        except:
            # 如果获取失败，返回基本数据
            result.append({
                "code": stock["code"],
                "name": stock["name"],
                "price": None,
                "change": None,
                "changePercent": None
            })
    
    set_cache(cache_key, result, ttl=60)  # 1 分钟缓存
    return result

@app.get("/api/stocks/{stock_code}")
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
        
        # 腾讯接口数据格式：v_sh600519="51~1~600519~1392.00~1400.00~1395.00~...
        # parts[3]=当前价，parts[4]=昨收，parts[5]=开盘，parts[6]=最高，parts[7]=最低
        current = float(parts[3]) if len(parts) > 3 else 0
        prev_close = float(parts[4]) if len(parts) > 4 else 0
        change = current - prev_close
        change_pct = (change / prev_close * 100) if prev_close else 0
        
        # 字段 34=最低价，字段 51=最高价，字段 6=成交量（手），字段 37=成交额（万）
        # 字段 39=市盈率 PE，字段 45=市净率 PB，字段 46=总市值（万），字段 47=流通市值（万）
        low = float(parts[34]) if len(parts) > 34 and parts[34] else 0
        high = float(parts[51]) if len(parts) > 51 and parts[51] else max(current, float(parts[5]) if len(parts) > 5 else 0)
        volume = float(parts[6]) if len(parts) > 6 and parts[6] else 0
        turnover = float(parts[37]) if len(parts) > 37 and parts[37] else 0
        pe_ratio = float(parts[39]) if len(parts) > 39 and parts[39] else 0
        pb_ratio = float(parts[45]) if len(parts) > 45 and parts[45] else 0
        total_market_cap = float(parts[46]) if len(parts) > 46 and parts[46] else 0
        float_market_cap = float(parts[47]) if len(parts) > 47 and parts[47] else 0
        
        # 计算 52 周最高/最低（估算）
        week_52_high = high * 1.2  # 估算值
        week_52_low = low * 0.8  # 估算值
        
        result = {
            "code": stock_code,
            "price": current,
            "change": change,
            "changePercent": change_pct,
            "open": float(parts[5]) if len(parts) > 5 else 0,
            "high": high,
            "low": low,
            "prevClose": prev_close,
            "volume": volume,
            "turnover": turnover,
            "peRatio": pe_ratio,
            "pbRatio": pb_ratio,
            "totalMarketCap": total_market_cap,
            "floatMarketCap": float_market_cap,
            "week52High": week_52_high,
            "week52Low": week_52_low,
            "name": parts[1] if len(parts) > 1 else "Unknown",
            "price": current,
            "change": round(change, 2),
            "change_percent": round(change_pct, 2),
            "open": float(parts[5]) if len(parts) > 5 else 0,
            "high": high,
            "low": low,
            "volume": int(float(parts[6]) if len(parts) > 6 and parts[6] else 0),
            "turnover": float(parts[37]) if len(parts) > 37 and parts[37] else 0,
            "timestamp": datetime.now().isoformat()
        }
        
        set_cache(cache_key, result)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取股票数据失败：{str(e)}")

@app.get("/api/market/overview")
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

# 基金数据源映射
FUND_TYPES = {
    "hh": "混合基金",
    "gp": "股票基金",
    "zq": "债券基金",
    "zs": "指数基金",
    "qdii": "QDII",
}

# 热门基金列表（固定 + 实时数据）
POPULAR_FUNDS = [
    {"code": "000001", "name": "华夏成长混合", "type": "hh"},
    {"code": "000002", "name": "国泰金龙债券", "type": "zq"},
    {"code": "000003", "name": "国泰金龙行业混合", "type": "hh"},
    {"code": "000004", "name": "博时稳健回报债券", "type": "zq"},
    {"code": "000005", "name": "华安宏利混合", "type": "hh"},
    {"code": "110001", "name": "易方达平稳增长混合", "type": "hh"},
    {"code": "110002", "name": "易方达策略成长混合", "type": "hh"},
    {"code": "110003", "name": "易方达 50 指数", "type": "zs"},
    {"code": "160101", "name": "南方稳健成长混合", "type": "hh"},
    {"code": "160102", "name": "南方宝元债券", "type": "zq"},
    {"code": "202001", "name": "南方稳健成长贰号混合", "type": "hh"},
    {"code": "202002", "name": "南方绩优成长混合", "type": "hh"},
    {"code": "240001", "name": "华宝兴业宝康混合", "type": "hh"},
    {"code": "240002", "name": "华宝兴业宝康债券", "type": "zq"},
    {"code": "270001", "name": "广发聚富混合", "type": "hh"},
    {"code": "320001", "name": "诺安平衡混合", "type": "hh"},
    {"code": "340001", "name": "兴业可转债混合", "type": "hh"},
    {"code": "360001", "name": "光大保德信量化股票", "type": "gp"},
    {"code": "375010", "name": "上投摩根中国优势混合", "type": "hh"},
    {"code": "519001", "name": "银华价值优选混合", "type": "hh"},
]

@app.get("/api/funds/list")
async def get_fund_list(fund_type: str = "hh", limit: int = 50):
    """获取基金列表（热门基金 + 实时数据）"""
    cache_key = f"funds:list:{fund_type}:{limit}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        # 筛选对应类型的基金
        if fund_type == "all":
            filtered_funds = POPULAR_FUNDS
        else:
            filtered_funds = [f for f in POPULAR_FUNDS if f.get("type") == fund_type]
        
        # 获取实时数据
        funds = []
        for fund in filtered_funds[:limit]:
            try:
                fund_code = fund.get("code")
                fund_name = fund.get("name", "未知基金")
                
                if not fund_code:
                    continue
                
                # 调用基金详情 API 获取实时数据
                fund_detail = await get_fund_detail(fund_code)
                
                # 检查返回值
                if fund_detail and isinstance(fund_detail, dict):
                    funds.append({
                        "code": fund_detail.get("code", fund_code),
                        "name": fund_detail.get("name", fund_name),
                        "unitNetValue": fund_detail.get("unitNetValue", 0),
                        "accNetValue": fund_detail.get("accNetValue", 0),
                        "dailyGrowth": fund_detail.get("dailyGrowth", 0),
                        "date": fund_detail.get("updateTime", ""),
                    })
            except Exception as e:
                print(f"获取基金 {fund.get('code', 'unknown')} 详情失败：{e}")
                # 即使失败也添加基本信息
                funds.append({
                    "code": fund.get("code", ""),
                    "name": fund.get("name", "未知基金"),
                    "unitNetValue": 0,
                    "accNetValue": 0,
                    "dailyGrowth": 0,
                    "date": "",
                })
                continue
        
        result = {"funds": funds, "count": len(funds), "type": fund_type}
        set_cache(cache_key, result, 300)  # 5 分钟缓存
        return result
        
    except Exception as e:
        print(f"获取基金列表失败：{e}")
        import traceback
        traceback.print_exc()
        # 返回默认基金列表
        return {"funds": [], "count": 0, "type": fund_type, "error": str(e)}

@app.get("/api/sectors/heatmap")
async def get_sector_heatmap():
    """获取板块热度图数据"""
    cache_key = "sectors:heatmap"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        # 定义板块数据
        sectors = [
            {"id": "finance", "name": "金融", "icon": "🏦", "stocks": ["601398", "601939", "600036", "601166", "000001", "600000", "601318", "600030", "000002", "600048", "601888"]},
            {"id": "tech", "name": "科技", "icon": "💻", "stocks": ["002415", "002230", "300059", "600588", "002594", "300750"]},
            {"id": "consumer", "name": "消费", "icon": "🍔", "stocks": ["600519", "000858", "000568", "600809", "002304", "601888"]},
            {"id": "medicine", "name": "医药", "icon": "💊", "stocks": ["600276"]},
            {"id": "energy", "name": "能源", "icon": "⚡", "stocks": ["600028", "601857", "600900"]},
            {"id": "manufacturing", "name": "制造", "icon": "🏭", "stocks": ["600031", "000333", "000651"]},
        ]
        
        result = []
        for sector in sectors:
            # 计算板块平均涨跌幅
            changes = []
            leading_stocks = []
            
            for stock_code in sector["stocks"]:
                try:
                    quote = await get_stock_quote(stock_code)
                    change_pct = quote.get("changePercent", 0)
                    changes.append(change_pct)
                    leading_stocks.append({
                        "code": stock_code,
                        "name": quote.get("name", ""),
                        "change": change_pct
                    })
                except:
                    continue
            
            if changes:
                avg_change = sum(changes) / len(changes)
                # 按涨跌幅排序，找出领涨股
                leading_stocks.sort(key=lambda x: x["change"], reverse=True)
                
                result.append({
                    "id": sector["id"],
                    "name": sector["name"],
                    "icon": sector["icon"],
                    "change": avg_change,
                    "count": len(changes),
                    "leadingStocks": leading_stocks[:3],  # 前 3 只领涨股
                })
        
        # 按涨跌幅排序
        result.sort(key=lambda x: x["change"], reverse=True)
        
        set_cache(cache_key, result, 120)  # 2 分钟缓存
        return result
        
    except Exception as e:
        print(f"获取板块热度图失败：{e}")
        return []

# 注册基金路由
from services.finance.fund_routes import router as fund_router
app.include_router(fund_router)

if __name__ == "__main__":
    import uvicorn
    print("🚀 启动金融 API 服务...")
    print("📈 股票接口：http://localhost:8081/api/stocks/...")
    print("💰 基金接口：http://localhost:8081/api/funds/...")
    uvicorn.run(app, host="0.0.0.0", port=8081)
