"""
金融数据服务 - A 股数据 (Python 3.6 兼容版)
数据源：新浪财经 (无需 API Key)
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import requests
import json
from datetime import datetime

app = FastAPI(title="starLog Finance API", description="A 股数据服务 (新浪财经)")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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
    turnover: float
    timestamp: str

class StockDetail(BaseModel):
    symbol: str
    name: str
    quote: StockQuote

# ============ 工具函数 ============

def parse_sina_stock(code: str, data: str) -> Optional[StockQuote]:
    """解析新浪财经数据"""
    try:
        # 格式：var hq_str_sz000001="平安银行，10.5,10.4,10.6,10.7,10.3,..."
        parts = data.split('"')[1].split(',')
        if len(parts) < 32:
            return None
        
        name = parts[0]
        current = float(parts[3]) if parts[3] else 0
        open_price = float(parts[1]) if parts[1] else 0
        high = float(parts[4]) if parts[4] else 0
        low = float(parts[5]) if parts[5] else 0
        previous_close = float(parts[2]) if parts[2] else 0
        volume = float(parts[8]) if parts[8] else 0
        turnover = float(parts[9]) if parts[9] else 0
        
        change = current - previous_close
        change_percent = (change / previous_close) * 100 if previous_close else 0
        
        return StockQuote(
            symbol=code,
            name=name,
            price=current,
            open=open_price,
            high=high,
            low=low,
            previousClose=previous_close,
            change=round(change, 2),
            changePercent=round(change_percent, 2),
            volume=volume,
            turnover=turnover,
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
    except Exception as e:
        print("解析失败 {}: {}".format(code, e))
        return None

def get_sina_code(symbol: str) -> str:
    """转换股票代码格式"""
    symbol = str(symbol).strip()
    if symbol.startswith(('sh', 'sz')):
        return symbol.lower()
    elif symbol.startswith('6'):
        return "sh{}".format(symbol)
    else:
        return "sz{}".format(symbol)

# ============ API 接口 ============

@app.get("/")
def root():
    return {"status": "ok", "service": "starLog Finance API", "source": "新浪财经"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/stock/{symbol}", response_model=StockQuote)
def get_stock_quote(symbol: str):
    """
    获取单个股票实时行情
    - symbol: 股票代码 (如 000001 或 sz000001)
    """
    sina_code = get_sina_code(symbol)
    url = "http://hq.sinajs.cn/list={}".format(sina_code)
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        content = response.text
        if "=" not in content:
            raise HTTPException(status_code=404, detail="股票不存在")
        
        quote = parse_sina_stock(symbol, content)
        if not quote:
            raise HTTPException(status_code=404, detail="数据解析失败")
        
        return quote
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail="数据获取失败：{}".format(str(e)))

@app.get("/stock/{symbol}/detail", response_model=StockDetail)
def get_stock_detail(symbol: str):
    """
    获取股票详细信息
    """
    sina_code = get_sina_code(symbol)
    url = "http://hq.sinajs.cn/list={}".format(sina_code)
    
    try:
        response = requests.get(url, timeout=5)
        content = response.text
        
        if "=" not in content:
            raise HTTPException(status_code=404, detail="股票不存在")
        
        quote = parse_sina_stock(symbol, content)
        if not quote:
            raise HTTPException(status_code=404, detail="数据解析失败")
        
        return StockDetail(
            symbol=symbol,
            name=quote.name,
            quote=quote
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="数据获取失败：{}".format(str(e)))

@app.get("/market/overview")
def get_market_overview():
    """
    获取市场概览（大盘指数）
    """
    indices = {
        "上证指数": "sh000001",
        "深证成指": "sz399001",
        "创业板指": "sz399006",
        "沪深 300": "sh000300"
    }
    
    result = {}
    for name, code in indices.items():
        try:
            url = "http://hq.sinajs.cn/list={}".format(code)
            response = requests.get(url, timeout=5)
            content = response.text
            
            if "=" in content:
                quote = parse_sina_stock(code, content)
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
def search_stocks(keyword: str = Query(..., min_length=2)):
    """
    搜索股票 (简化版，返回常见股票)
    """
    # 常见股票列表
    stocks = [
        {"code": "000001", "name": "平安银行"},
        {"code": "000002", "name": "万科 A"},
        {"code": "000063", "name": "中兴通讯"},
        {"code": "000100", "name": "TCL 科技"},
        {"code": "000157", "name": "中联重科"},
        {"code": "000333", "name": "美的集团"},
        {"code": "000538", "name": "云南白药"},
        {"code": "000568", "name": "泸州老窖"},
        {"code": "000651", "name": "格力电器"},
        {"code": "000725", "name": "京东方 A"},
        {"code": "000858", "name": "五粮液"},
        {"code": "002001", "name": "新和成"},
        {"code": "002007", "name": "华兰生物"},
        {"code": "002027", "name": "分众传媒"},
        {"code": "002049", "name": "紫光国微"},
        {"code": "002142", "name": "宁波银行"},
        {"code": "002230", "name": "科大讯飞"},
        {"code": "002304", "name": "洋河股份"},
        {"code": "002352", "name": "顺丰控股"},
        {"code": "002415", "name": "海康威视"},
        {"code": "300014", "name": "亿纬锂能"},
        {"code": "300059", "name": "东方财富"},
        {"code": "300122", "name": "智飞生物"},
        {"code": "300124", "name": "汇川技术"},
        {"code": "300274", "name": "阳光电源"},
        {"code": "300347", "name": "泰格医药"},
        {"code": "300413", "name": "芒果超媒"},
        {"code": "300498", "name": "温氏股份"},
        {"code": "300601", "name": "康泰生物"},
        {"code": "300628", "name": "亿联网络"},
        {"code": "600000", "name": "浦发银行"},
        {"code": "600009", "name": "上海机场"},
        {"code": "600016", "name": "民生银行"},
        {"code": "600028", "name": "中国石化"},
        {"code": "600030", "name": "中信证券"},
        {"code": "600031", "name": "三一重工"},
        {"code": "600036", "name": "招商银行"},
        {"code": "600048", "name": "保利地产"},
        {"code": "600050", "name": "中国联通"},
        {"code": "600104", "name": "上汽集团"},
        {"code": "600276", "name": "恒瑞医药"},
        {"code": "600309", "name": "万华化学"},
        {"code": "600346", "name": "恒力石化"},
        {"code": "600436", "name": "片仔癀"},
        {"code": "600519", "name": "贵州茅台"},
        {"code": "600585", "name": "海螺水泥"},
        {"code": "600588", "name": "用友网络"},
        {"code": "600690", "name": "海尔智家"},
        {"code": "600745", "name": "闻泰科技"},
        {"code": "600809", "name": "山西汾酒"},
        {"code": "600887", "name": "伊利股份"},
        {"code": "600900", "name": "长江电力"},
        {"code": "601012", "name": "隆基股份"},
        {"code": "601066", "name": "中信建投"},
        {"code": "601088", "name": "中国神华"},
        {"code": "601166", "name": "兴业银行"},
        {"code": "601211", "name": "国泰君安"},
        {"code": "601288", "name": "农业银行"},
        {"code": "601318", "name": "中国平安"},
        {"code": "601328", "name": "交通银行"},
        {"code": "601336", "name": "新华保险"},
        {"code": "601390", "name": "中国中铁"},
        {"code": "601398", "name": "工商银行"},
        {"code": "601601", "name": "中国太保"},
        {"code": "601628", "name": "中国人寿"},
        {"code": "601633", "name": "长城汽车"},
        {"code": "601668", "name": "中国建筑"},
        {"code": "601688", "name": "华泰证券"},
        {"code": "601728", "name": "中国电信"},
        {"code": "601766", "name": "中国中车"},
        {"code": "601816", "name": "京沪高铁"},
        {"code": "601857", "name": "中国石油"},
        {"code": "601888", "name": "中国中免"},
        {"code": "601899", "name": "紫金矿业"},
        {"code": "601919", "name": "中远海控"},
        {"code": "601939", "name": "建设银行"},
        {"code": "601988", "name": "中国银行"},
        {"code": "601995", "name": "中金公司"},
        {"code": "601998", "name": "中信银行"},
        {"code": "603259", "name": "药明康德"},
        {"code": "603260", "name": "合盛硅业"},
        {"code": "603288", "name": "海天味业"},
        {"code": "603369", "name": "今世缘"},
        {"code": "603501", "name": "韦尔股份"},
        {"code": "603658", "name": "安图生物"},
        {"code": "603799", "name": "华友钴业"},
        {"code": "603806", "name": "福斯特"},
        {"code": "603833", "name": "欧派家居"},
        {"code": "603899", "name": "晨光文具"},
        {"code": "603986", "name": "兆易创新"},
    ]
    
    # 模糊匹配
    keyword_lower = keyword.lower()
    matches = [
        s for s in stocks 
        if keyword_lower in s['name'].lower() or keyword_lower in s['code']
    ][:20]
    
    return matches

if __name__ == "__main__":
    import uvicorn
    print("🚀 starLog Finance API 启动中...")
    print("📊 数据源：新浪财经")
    print("📚 API 文档：http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
