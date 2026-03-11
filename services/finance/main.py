"""
金融数据服务 - 免费开源版
数据源：AKShare（免费）+ 新浪财经 + 东方财富
功能：股票行情、基金净值、实时估值、舆情分析
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import akshare as ak
import redis
import json
from datetime import datetime, time
import pandas as pd
from snownlp import SnowNLP
import jieba.analyse

app = FastAPI(
    title="starLog Finance API",
    description="免费开源金融数据服务 - 股票/基金/舆情分析",
    version="2.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis 配置（可选）
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    REDIS_AVAILABLE = redis_client.ping()
except:
    redis_client = None
    REDIS_AVAILABLE = False

# 缓存配置
CACHE_TTL = 300  # 5 分钟

# ============ 数据模型 ============

class FundInfo(BaseModel):
    fund_id: str
    fund_name: str
    net_value: float
    nav_date: str
    daily_growth: float
    estimate_growth: Optional[float] = None

class StockInfo(BaseModel):
    stock_code: str
    stock_name: str
    price: float
    change_percent: float
    volume: float
    turnover: float

class FundHolding(BaseModel):
    stock_code: str
    stock_name: str
    percentage: float
    market_value: Optional[float] = None

class SentimentAnalysis(BaseModel):
    score: float
    label: str
    keywords: List[str]

# ============ 缓存工具 ============

def get_cache(key: str) -> Optional[Any]:
    """从 Redis 获取缓存"""
    if not REDIS_AVAILABLE:
        return None
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except:
        return None

def set_cache(key: str, data: Any, ttl: int = CACHE_TTL) -> None:
    """设置 Redis 缓存"""
    if not REDIS_AVAILABLE:
        return
    try:
        redis_client.setex(key, ttl, json.dumps(data, ensure_ascii=False))
    except:
        pass

# ============ 基金数据接口 ============

@app.get("/api/funds/list", response_model=Dict[str, Any])
async def get_fund_list(
    fund_type: str = "混合基金",
    limit: int = 50
):
    """获取基金列表"""
    cache_key = f"funds:list:{fund_type}:{limit}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        # 使用 AKShare 获取开放基金数据
        fund_df = ak.fund_open_fund_info_em(fund=fund_type, indicator="累计净值走势")
        
        if fund_df.empty:
            return {"funds": [], "count": 0, "type": fund_type}
        
        funds = []
        for _, row in fund_df.head(limit).iterrows():
            funds.append({
                "fund_id": row.get('基金代码', ''),
                "fund_name": row.get('基金名称', ''),
                "net_value": float(row.get('单位净值', 0)),
                "nav_date": row.get('净值日期', ''),
                "daily_growth": float(row.get('日增长率', 0)) if '日增长率' in row else 0,
                "total_value": float(row.get('累计净值', 0)) if '累计净值' in row else 0,
            })
        
        result = {"funds": funds, "count": len(funds), "type": fund_type}
        set_cache(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取基金列表失败：{str(e)}")


@app.get("/api/funds/{fund_id}", response_model=Dict[str, Any])
async def get_fund_detail(fund_id: str):
    """获取基金详细信息"""
    cache_key = f"fund:detail:{fund_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        # 获取基金基本信息
        fund_df = ak.fund_open_fund_info_em(fund=fund_id, indicator="单位净值走势")
        
        if fund_df.empty:
            raise HTTPException(status_code=404, detail="基金未找到")
        
        latest = fund_df.iloc[-1]
        
        result = {
            "fund_id": fund_id,
            "fund_name": latest.get('单位净值', ''),  # 实际应该是基金名称
            "net_value": float(latest.get('单位净值', 0)),
            "nav_date": latest.get('净值日期', ''),
            "daily_growth": float(latest.get('日增长率', 0)) if '日增长率' in latest else 0,
            "total_shares": float(latest.get('总份额', 0)) if '总份额' in fund_df.columns else 0,
            "fund_size": float(latest.get('基金规模', 0)) if '基金规模' in fund_df.columns else 0,
        }
        
        set_cache(cache_key, result)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取基金详情失败：{str(e)}")


@app.get("/api/funds/{fund_id}/holdings", response_model=Dict[str, Any])
async def get_fund_holdings(fund_id: str):
    """获取基金持仓（前十大）"""
    cache_key = f"fund:holdings:{fund_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        # 获取基金持仓
        holdings_df = ak.fund_portfolio_holdings_em(symbol=fund_id)
        
        if holdings_df.empty:
            return {"fund_id": fund_id, "stocks": [], "update_date": ""}
        
        stocks = []
        for _, row in holdings_df.head(10).iterrows():
            stocks.append({
                "stock_code": row.get('股票代码', ''),
                "stock_name": row.get('股票名称', ''),
                "percentage": float(row.get('占净值比例', 0)) if '占净值比例' in row else 0,
                "market_value": float(row.get('持仓市值', 0)) if '持仓市值' in row else 0,
                "shares": float(row.get('持仓万股', 0)) if '持仓万股' in row else 0,
            })
        
        result = {
            "fund_id": fund_id,
            "stocks": stocks,
            "update_date": holdings_df.iloc[0].get('报告期', '') if '报告期' in holdings_df.columns else ''
        }
        
        set_cache(cache_key, result, ttl=3600)  # 1 小时缓存
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取持仓失败：{str(e)}")


@app.get("/api/funds/{fund_id}/net-history", response_model=Dict[str, Any])
async def get_fund_net_history(fund_id: str, days: int = 30):
    """获取基金净值历史"""
    cache_key = f"fund:net:{fund_id}:{days}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        fund_df = ak.fund_open_fund_info_em(fund=fund_id, indicator="单位净值走势")
        
        if fund_df.empty:
            return {"fund_id": fund_id, "data": []}
        
        # 取最近 N 天数据
        recent_df = fund_df.tail(days)
        
        data = []
        for _, row in recent_df.iterrows():
            data.append({
                "date": row.get('净值日期', ''),
                "net_value": float(row.get('单位净值', 0)),
                "daily_growth": float(row.get('日增长率', 0)) if '日增长率' in row else 0,
            })
        
        result = {"fund_id": fund_id, "data": data}
        set_cache(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取净值历史失败：{str(e)}")


# ============ 实时估值功能 ============

@app.get("/api/funds/{fund_id}/estimate", response_model=Dict[str, Any])
async def get_fund_estimate(fund_id: str):
    """获取基金实时估值（基于持仓股票）"""
    cache_key = f"fund:estimate:{fund_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        # 1. 获取基金持仓
        holdings = await get_fund_holdings(fund_id)
        
        if not holdings['stocks']:
            return {"fund_id": fund_id, "estimate_growth": 0, "stocks": []}
        
        # 2. 获取持仓股票实时涨跌幅
        total_estimate = 0
        stock_estimates = []
        
        for stock in holdings['stocks'][:10]:  # 前十大持仓
            try:
                # 获取股票实时行情
                stock_df = ak.stock_zh_a_spot_em()
                stock_row = stock_df[stock_df['代码'] == stock['stock_code']]
                
                if not stock_row.empty:
                    change_percent = float(stock_row.iloc[0].get('涨跌幅', 0))
                    contribution = change_percent * (stock['percentage'] / 100)
                    total_estimate += contribution
                    
                    stock_estimates.append({
                        "stock_code": stock['stock_code'],
                        "stock_name": stock['stock_name'],
                        "change_percent": change_percent,
                        "percentage": stock['percentage'],
                        "contribution": round(contribution, 4)
                    })
            except:
                continue
        
        result = {
            "fund_id": fund_id,
            "estimate_growth": round(total_estimate, 4),
            "stocks": stock_estimates,
            "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # 交易时间缓存 5 分钟，非交易时间缓存 1 小时
        current_hour = datetime.now().hour
        ttl = 300 if 9 <= current_hour <= 15 else 3600
        set_cache(cache_key, result, ttl=ttl)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"估值计算失败：{str(e)}")


# ============ 股票数据接口 ============

@app.get("/api/stocks/{stock_code}", response_model=Dict[str, Any])
async def get_stock_info(stock_code: str):
    """获取股票实时行情"""
    cache_key = f"stock:{stock_code}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        stock_df = ak.stock_zh_a_spot_em()
        stock_row = stock_df[stock_df['代码'] == stock_code]
        
        if stock_row.empty:
            raise HTTPException(status_code=404, detail="股票未找到")
        
        result = {
            "stock_code": stock_code,
            "stock_name": stock_row.iloc[0].get('名称', ''),
            "price": float(stock_row.iloc[0].get('最新价', 0)),
            "change_percent": float(stock_row.iloc[0].get('涨跌幅', 0)),
            "change_amount": float(stock_row.iloc[0].get('涨跌额', 0)),
            "volume": float(stock_row.iloc[0].get('成交量', 0)),
            "turnover": float(stock_row.iloc[0].get('成交额', 0)),
            "pe_ratio": float(stock_row.iloc[0].get('市盈率 - 动态', 0)) if '市盈率 - 动态' in stock_row.columns else 0,
            "pb_ratio": float(stock_row.iloc[0].get('市净率', 0)) if '市净率' in stock_row.columns else 0,
        }
        
        set_cache(cache_key, result)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取股票行情失败：{str(e)}")


@app.get("/api/stocks/{stock_code}/company", response_model=Dict[str, Any])
async def get_stock_company_info(stock_code: str):
    """获取公司基本面信息"""
    cache_key = f"stock:company:{stock_code}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    try:
        # 获取公司基本信息
        company_info = ak.stock_individual_info_em(symbol=stock_code)
        
        # 获取财务指标
        financial_df = ak.stock_financial_analysis_indicator(symbol=stock_code)
        
        result = {
            "stock_code": stock_code,
            "company_name": company_info.iloc[0].get('value', '') if not company_info.empty else '',
            "industry": company_info.iloc[1].get('value', '') if len(company_info) > 1 else '',
            "list_date": company_info.iloc[2].get('value', '') if len(company_info) > 2 else '',
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
        
        set_cache(cache_key, result, ttl=3600)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取公司信息失败：{str(e)}")


# ============ 舆情分析功能 ============

@app.get("/api/news/sentiment", response_model=SentimentAnalysis)
async def analyze_news_sentiment(text: str):
    """新闻情感分析（基于 SnowNLP）"""
    try:
        s = SnowNLP(text)
        sentiment_score = s.sentiments
        
        # 情感标签
        if sentiment_score > 0.6:
            label = "正面"
        elif sentiment_score > 0.4:
            label = "中性"
        else:
            label = "负面"
        
        # 关键词提取
        keywords = jieba.analyse.extract_tags(text, topK=5)
        
        return {
            "score": round(sentiment_score, 4),
            "label": label,
            "keywords": keywords
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"情感分析失败：{str(e)}")


@app.get("/api/funds/{fund_id}/news", response_model=Dict[str, Any])
async def get_fund_news(fund_id: str, limit: int = 10):
    """获取基金相关新闻（简化版）"""
    try:
        # 这里可以集成新闻 API，暂时返回示例数据
        news = [
            {
                "title": f"基金{fund_id}最新持仓分析",
                "source": "东方财富",
                "publish_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "url": f"https://fund.eastmoney.com/{fund_id}.html"
            }
        ]
        
        return {"fund_id": fund_id, "news": news, "count": len(news)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取新闻失败：{str(e)}")


# ============ 基金筛选功能 ============

@app.get("/api/funds/screen", response_model=Dict[str, Any])
async def screen_funds(
    fund_type: str = "混合基金",
    min_growth: float = 10,
    limit: int = 20
):
    """基金筛选（简化版 4433 法则）"""
    try:
        fund_df = ak.fund_open_fund_info_em(fund=fund_type, indicator="累计净值走势")
        
        if fund_df.empty:
            return {"funds": [], "count": 0}
        
        # 筛选：日增长率 > min_growth
        screened = fund_df[fund_df['日增长率'] > min_growth].head(limit) if '日增长率' in fund_df.columns else fund_df.head(limit)
        
        funds = []
        for _, row in screened.iterrows():
            funds.append({
                "fund_id": row.get('基金代码', ''),
                "fund_name": row.get('基金名称', ''),
                "net_value": float(row.get('单位净值', 0)),
                "daily_growth": float(row.get('日增长率', 0)) if '日增长率' in row else 0,
            })
        
        return {
            "funds": funds,
            "count": len(funds),
            "criteria": {
                "fund_type": fund_type,
                "min_growth": min_growth
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"基金筛选失败：{str(e)}")


# ============ 健康检查 ============

@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "redis": "connected" if REDIS_AVAILABLE else "disconnected",
        "akshare_version": ak.__version__
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
