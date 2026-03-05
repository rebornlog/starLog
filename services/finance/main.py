"""
金融数据服务 - A 股数据 (Python 3.6 兼容版)
数据源：东方财富 + 腾讯财经 (备用)
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import requests
import json
from datetime import datetime

app = FastAPI(title="starLog Finance API", description="A 股数据服务")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ 数据模型 ============

class StockQuote(BaseModel):
    symbol: str
    name: str
    price: float
    open: float
    high: float
    low: float
    previousClose: float
    change: float
    changePercent: float
    volume: float
    timestamp: str

# ============ 热门股票列表 ============
POPULAR_STOCKS = [
    {"code": "600519", "name": "贵州茅台"},
    {"code": "000858", "name": "五粮液"},
    {"code": "000568", "name": "泸州老窖"},
    {"code": "600809", "name": "山西汾酒"},
    {"code": "002304", "name": "洋河股份"},
    {"code": "600036", "name": "招商银行"},
    {"code": "600030", "name": "中信证券"},
    {"code": "600000", "name": "浦发银行"},
    {"code": "000001", "name": "平安银行"},
    {"code": "601318", "name": "中国平安"},
    {"code": "600276", "name": "恒瑞医药"},
    {"code": "600031", "name": "三一重工"},
    {"code": "000333", "name": "美的集团"},
    {"code": "000651", "name": "格力电器"},
    {"code": "000002", "name": "万科 A"},
    {"code": "600028", "name": "中国石化"},
    {"code": "601857", "name": "中国石油"},
    {"code": "601398", "name": "工商银行"},
    {"code": "601939", "name": "建设银行"},
    {"code": "002415", "name": "海康威视"},
    {"code": "002230", "name": "科大讯飞"},
    {"code": "300059", "name": "东方财富"},
    {"code": "601888", "name": "中国中免"},
    {"code": "600900", "name": "长江电力"},
    {"code": "601012", "name": "隆基股份"},
    {"code": "300750", "name": "宁德时代"},
    {"code": "002594", "name": "比亚迪"},
    {"code": "600588", "name": "用友网络"},
    {"code": "600048", "name": "保利发展"},
    {"code": "601166", "name": "兴业银行"},
]

# ============ 工具函数 ============

def get_tencent_code(symbol: str) -> str:
    """转换腾讯股票代码格式"""
    symbol = str(symbol).strip()
    if symbol.startswith(('sh', 'sz')):
        return symbol.lower()
    elif symbol.startswith('6'):
        return "sh{}".format(symbol)
    else:
        return "sz{}".format(symbol)

def parse_tencent_stock(code: str, data: str) -> Optional[StockQuote]:
    """解析腾讯财经数据"""
    try:
        # 格式：v_sh600519="51~name~code~current~prev_close~open~high~low..."
        if '"' not in data:
            return None
        parts = data.split('"')[1].split('~')
        if len(parts) < 4:
            return None
        
        # 腾讯数据格式索引:
        # 0=status, 1=name, 2=code, 3=current, 4=prev_close, 5=open, 6=high, 7=low
        current = float(parts[3]) if len(parts) > 3 and parts[3] else 0
        previous_close = float(parts[4]) if len(parts) > 4 and parts[4] else 0
        open_price = float(parts[5]) if len(parts) > 5 and parts[5] else 0
        high = float(parts[6]) if len(parts) > 6 and parts[6] else 0
        low = float(parts[7]) if len(parts) > 7 and parts[7] else 0
        
        change = current - previous_close
        change_percent = (change / previous_close) * 100 if previous_close and previous_close != 0 else 0
        
        return StockQuote(
            symbol=code,
            name=parts[1] if len(parts) > 1 and parts[1] else "Unknown",
            price=current,
            open=open_price,
            high=high,
            low=low,
            previousClose=previous_close,
            change=round(change, 2),
            changePercent=round(change_percent, 2),
            volume=0,
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
    except Exception as e:
        print("Parse error {}: {}".format(code, e))
        import traceback
        traceback.print_exc()
        return None

# ============ API 接口 ============

@app.get("/")
def root():
    return {"status": "ok", "service": "starLog Finance API", "source": "腾讯财经"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/stock/{symbol}", response_model=StockQuote)
def get_stock_quote(symbol: str):
    """获取单个股票实时行情"""
    tencent_code = get_tencent_code(symbol)
    url = "http://qt.gtimg.cn/q={}".format(tencent_code)
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        content = response.text
        if "=" not in content:
            raise HTTPException(status_code=404, detail="股票不存在")
        
        quote = parse_tencent_stock(symbol, content)
        if not quote:
            raise HTTPException(status_code=404, detail="数据解析失败")
        
        return quote
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail="数据获取失败：{}".format(str(e)))

@app.get("/stock/{symbol}/detail")
def get_stock_detail(symbol: str):
    """获取股票详细信息"""
    tencent_code = get_tencent_code(symbol)
    url = "http://qt.gtimg.cn/q={}".format(tencent_code)
    
    try:
        response = requests.get(url, timeout=5)
        content = response.text
        
        if "=" not in content:
            raise HTTPException(status_code=404, detail="股票不存在")
        
        quote = parse_tencent_stock(symbol, content)
        if not quote:
            raise HTTPException(status_code=404, detail="数据解析失败")
        
        return {
            "symbol": symbol,
            "name": quote.name,
            "quote": quote.dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="数据获取失败：{}".format(str(e)))

@app.get("/market/overview")
def get_market_overview():
    """获取市场概览（大盘指数）"""
    indices = {
        "上证指数": "sh000001",
        "深证成指": "sz399001",
        "创业板指": "sz399006",
        "沪深 300": "sh000300"
    }
    
    result = {}
    for name, code in indices.items():
        try:
            url = "http://qt.gtimg.cn/q={}".format(code)
            response = requests.get(url, timeout=5)
            content = response.text
            
            if "=" in content:
                quote = parse_tencent_stock(code, content)
                if quote:
                    result[name] = {
                        "price": quote.price,
                        "change": quote.change,
                        "changePercent": quote.changePercent
                    }
        except:
            pass
    
    return result

@app.get("/stock/search")
def search_stocks(keyword: str = None):
    """搜索股票"""
    if not keyword:
        return POPULAR_STOCKS[:20]
    
    try:
        keyword_str = str(keyword).strip().lower()
        matches = [
            s for s in POPULAR_STOCKS 
            if keyword_str in s['code'] or keyword_str in s['name'].lower()
        ][:20]
        
        return matches if matches else POPULAR_STOCKS[:20]
    except:
        return POPULAR_STOCKS[:20]

@app.get("/stocks/popular")
def get_popular_stocks():
    """获取热门股票列表"""
    return POPULAR_STOCKS

@app.get("/stocks/list")
def list_stocks(limit: int = 50):
    """获取股票列表"""
    return POPULAR_STOCKS[:limit]

if __name__ == "__main__":
    import uvicorn
    print("starLog Finance API starting...")
    print("Data source: Tencent Finance")
    print("API docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
