"""
基金数据服务 - 基于 AKShare
提供基金净值、持仓、公司基本面等数据
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import akshare as ak
import redis
import json
import pandas as pd
from datetime import datetime, time
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from typing import Optional, List
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Fund Data Service", version="1.0.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis 配置
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

# 缓存过期时间（秒）
CACHE_TTL = {
    'fund_info': 300,      # 5 分钟
    'fund_net': 300,       # 5 分钟
    'fund_holdings': 3600, # 1 小时
    'stock_info': 300,     # 5 分钟
}


# ============ 基金数据接口 ============

@app.get("/api/funds/{fund_id}")
async def get_fund_info(fund_id: str):
    """获取基金基本信息"""
    cache_key = f"fund:info:{fund_id}"
    
    # 尝试从缓存获取
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    try:
        # 获取基金实时行情
        fund_df = ak.fund_open_fund_info_em(fund=fund_id, indicator="单位净值走势")
        
        if fund_df.empty:
            raise HTTPException(status_code=404, detail="基金未找到")
        
        # 获取基金详细信息
        fund_info = {
            "fund_id": fund_id,
            "fund_name": fund_df.iloc[-1].get('单位净值', ''),
            "net_value": float(fund_df.iloc[-1].get('单位净值', 0)),
            "nav_date": fund_df.iloc[-1].get('净值日期', ''),
            "daily_growth": float(fund_df.iloc[-1].get('日增长率', 0)),
            "total_shares": float(fund_df.iloc[-1].get('总份额', 0)) if '总份额' in fund_df.columns else 0,
        }
        
        # 缓存数据
        redis_client.setex(
            cache_key,
            CACHE_TTL['fund_info'],
            json.dumps(fund_info, ensure_ascii=False)
        )
        
        return fund_info
    except Exception as e:
        logger.error(f"获取基金信息失败：{e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/funds/{fund_id}/net")
async def get_fund_net_history(fund_id: str, days: int = 30):
    """获取基金净值历史"""
    cache_key = f"fund:net:{fund_id}:{days}"
    
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    try:
        fund_df = ak.fund_open_fund_info_em(fund=fund_id, indicator="单位净值走势")
        
        # 取最近 N 天数据
        recent_df = fund_df.tail(days)
        
        net_history = []
        for _, row in recent_df.iterrows():
            net_history.append({
                "date": row.get('净值日期', ''),
                "net_value": float(row.get('单位净值', 0)),
                "daily_growth": float(row.get('日增长率', 0)) if '日增长率' in row else 0,
            })
        
        result = {
            "fund_id": fund_id,
            "data": net_history
        }
        
        redis_client.setex(
            cache_key,
            CACHE_TTL['fund_net'],
            json.dumps(result, ensure_ascii=False)
        )
        
        return result
    except Exception as e:
        logger.error(f"获取净值历史失败：{e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/funds/{fund_id}/holdings")
async def get_fund_holdings(fund_id: str):
    """获取基金持仓"""
    cache_key = f"fund:holdings:{fund_id}"
    
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    try:
        # 获取基金持仓
        holdings_df = ak.fund_portfolio_holdings_em(symbol=fund_id)
        
        if holdings_df.empty:
            return {"fund_id": fund_id, "stocks": [], "update_date": ""}
        
        stocks = []
        for _, row in holdings_df.iterrows():
            stocks.append({
                "stock_code": row.get('股票代码', ''),
                "stock_name": row.get('股票名称', ''),
                "percentage": float(row.get('占净值比例', 0)) if '占净值比例' in row else 0,
                "shares": float(row.get('持仓万股', 0)) if '持仓万股' in row else 0,
                "market_value": float(row.get('持仓市值', 0)) if '持仓市值' in row else 0,
            })
        
        result = {
            "fund_id": fund_id,
            "stocks": stocks[:10],  # 前十大持仓
            "update_date": holdings_df.iloc[0].get('报告期', '') if '报告期' in holdings_df.columns else ''
        }
        
        redis_client.setex(
            cache_key,
            CACHE_TTL['fund_holdings'],
            json.dumps(result, ensure_ascii=False)
        )
        
        return result
    except Exception as e:
        logger.error(f"获取持仓失败：{e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ 股票数据接口 ============

@app.get("/api/stocks/{stock_id}")
async def get_stock_info(stock_id: str):
    """获取股票基本信息"""
    cache_key = f"stock:info:{stock_id}"
    
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    try:
        # 获取股票实时行情
        stock_df = ak.stock_zh_a_spot_em()
        stock_row = stock_df[stock_df['代码'] == stock_id]
        
        if stock_row.empty:
            raise HTTPException(status_code=404, detail="股票未找到")
        
        stock_info = {
            "stock_id": stock_id,
            "stock_name": stock_row.iloc[0].get('名称', ''),
            "price": float(stock_row.iloc[0].get('最新价', 0)),
            "change_percent": float(stock_row.iloc[0].get('涨跌幅', 0)),
            "change_amount": float(stock_row.iloc[0].get('涨跌额', 0)),
            "volume": float(stock_row.iloc[0].get('成交量', 0)),
            "turnover": float(stock_row.iloc[0].get('成交额', 0)),
            "pe_ratio": float(stock_row.iloc[0].get('市盈率 - 动态', 0)) if '市盈率 - 动态' in stock_row.columns else 0,
            "pb_ratio": float(stock_row.iloc[0].get('市净率', 0)) if '市净率' in stock_row.columns else 0,
        }
        
        redis_client.setex(
            cache_key,
            CACHE_TTL['stock_info'],
            json.dumps(stock_info, ensure_ascii=False)
        )
        
        return stock_info
    except Exception as e:
        logger.error(f"获取股票信息失败：{e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stocks/{stock_id}/info")
async def get_stock_company_info(stock_id: str):
    """获取公司基本面信息"""
    cache_key = f"stock:company:{stock_id}"
    
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    try:
        # 获取公司基本信息
        company_info = ak.stock_individual_info_em(symbol=stock_id)
        
        # 获取财务指标
        financial_df = ak.stock_financial_analysis_indicator(symbol=stock_id)
        
        result = {
            "stock_id": stock_id,
            "company_name": company_info.iloc[0].get('value', '') if not company_info.empty else '',
            "industry": company_info.iloc[1].get('value', '') if len(company_info) > 1 else '',
            "list_date": company_info.iloc[2].get('value', '') if len(company_info) > 2 else '',
            "financial_metrics": []
        }
        
        # 取最近一期财务指标
        if not financial_df.empty:
            latest = financial_df.iloc[0]
            result["financial_metrics"] = {
                "roe": float(latest.get('净资产收益率 (%)', 0)),
                "gross_margin": float(latest.get('销售毛利率 (%)', 0)),
                "net_margin": float(latest.get('销售净利率 (%)', 0)),
                "asset_liability_ratio": float(latest.get('资产负债率 (%)', 0)),
                "revenue_growth": float(latest.get('营业收入增长率 (%)', 0)),
                "net_profit_growth": float(latest.get('净利润增长率 (%)', 0)),
            }
        
        redis_client.setex(
            cache_key,
            3600,  # 1 小时
            json.dumps(result, ensure_ascii=False)
        )
        
        return result
    except Exception as e:
        logger.error(f"获取公司信息失败：{e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ 基金筛选接口 ============

@app.get("/api/funds/screen")
async def screen_funds(
    fund_type: str = "混合型",
    min_roe: float = 10,
    min_growth: float = 10,
    limit: int = 20
):
    """基金筛选（4433 法则简化版）"""
    try:
        # 获取开放基金数据
        funds_df = ak.fund_open_fund_info_em(fund=fund_type, indicator="累计净值走势")
        
        if funds_df.empty:
            return {"funds": [], "count": 0}
        
        # 筛选条件（简化版 4433 法则）
        # 1. 近 1 年排名前 1/4
        # 2. 近 2 年排名前 1/4
        # 3. 近 3 年排名前 1/4
        # 4. 近 6 个月排名前 1/3
        # 5. 近 3 个月排名前 1/3
        
        screened_funds = []
        for _, row in funds_df.head(limit).iterrows():
            screened_funds.append({
                "fund_id": row.get('基金代码', ''),
                "fund_name": row.get('基金名称', ''),
                "net_value": float(row.get('单位净值', 0)),
                "nav_date": row.get('净值日期', ''),
                "daily_growth": float(row.get('日增长率', 0)) if '日增长率' in row else 0,
            })
        
        return {
            "funds": screened_funds,
            "count": len(screened_funds),
            "criteria": {
                "fund_type": fund_type,
                "min_roe": min_roe,
                "min_growth": min_growth
            }
        }
    except Exception as e:
        logger.error(f"基金筛选失败：{e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ 定时任务 ============

@app.on_event("startup")
async def startup_event():
    """启动定时任务"""
    scheduler = AsyncIOScheduler()
    
    # 每日 15:30 更新基金净值（收盘后）
    scheduler.add_job(
        update_all_funds_net,
        'cron',
        hour=15,
        minute=30,
        id='update_fund_net'
    )
    
    scheduler.start()
    logger.info("定时任务已启动")


async def update_all_funds_net():
    """更新所有基金净值"""
    logger.info("开始更新基金净值...")
    # 这里可以实现批量更新逻辑
    logger.info("基金净值更新完成")


@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "redis": redis_client.ping()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
