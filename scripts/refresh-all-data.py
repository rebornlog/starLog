#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
金融数据后台刷新服务
定时刷新所有基金和股票数据到 Redis 缓存
使用 fund-api 的虚拟环境
"""

import sys
import os

# 添加虚拟环境路径
venv_path = os.path.join(os.path.dirname(__file__), '..', 'services', 'finance', 'venv', 'lib', 'python3.6', 'site-packages')
if os.path.exists(venv_path):
    sys.path.insert(0, venv_path)

import requests
import redis
import json
import time
from datetime import datetime

# Redis 配置
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 0

# API 配置
BASE_API = 'http://localhost:8082'
FUND_LIST_URL = f'{BASE_API}/api/funds/list'
STOCK_LIST_URL = f'{BASE_API}/api/stocks/popular'

# 缓存 TTL 配置
FUND_LIST_TTL = 2700      # 45 分钟
FUND_DETAIL_TTL = 3600    # 1 小时
FUND_HISTORY_TTL = 7200   # 2 小时
STOCK_LIST_TTL = 2700     # 45 分钟

# 热门基金代码（用于预刷新详情和历史）
POPULAR_FUND_CODES = [
    '005827', '003096', '260108', '161725', '007119',
    '000083', '001938', '001763', '166002', '000041',
    '000171', '000055', '510300', '510500', '159915',
    '513050', '512880'
]

def get_redis():
    """获取 Redis 连接"""
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)

def fetch_fund_netvalue(code: str) -> dict:
    """直接从天天基金网获取基金净值"""
    try:
        url = f"http://fundgz.1234567.com.cn/js/{code}.js"
        headers = {
            "Referer": "http://fund.eastmoney.com/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=5)
        content = response.text
        
        # 检查是否 404
        if '404' in content or 'DOCTYPE' in content:
            return None
        
        import re
        json_match = re.search(r'jsonpgz\((.+?)\)', content)
        if json_match:
            fund_data = json.loads(json_match.group(1))
            net_value = float(fund_data.get("gsz", 0) or 0)
            if net_value > 0:
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
    except Exception as e:
        print(f"  获取 {code} 失败：{e}")
    return None

def fetch_fund_info(code: str) -> dict:
    """获取基金基本信息（用于 QDII/货币基金等特殊处理）"""
    try:
        # 使用天天基金网基本信息 API
        url = f"http://fund.eastmoney.com/pingzhongdata/{code}.js"
        headers = {
            "Referer": f"http://fund.eastmoney.com/{code}.html",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=5)
        content = response.text
        
        # 尝试提取基金类型
        import re
        fund_type_match = re.search(r'fType\s*=\s*"([^"]+)"', content)
        fund_name_match = re.search(r'fS_name\s*=\s*"([^"]+)"', content)
        
        if fund_type_match:
            return {
                "code": code,
                "type": fund_type_match.group(1),
                "name": fund_name_match.group(1) if fund_name_match else ""
            }
    except Exception as e:
        print(f"  获取 {code} 信息失败：{e}")
    return None

# 热门基金列表（含类型）
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

def refresh_fund_list():
    """刷新基金列表缓存 - 直接获取净值，不依赖 API"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 📊 开始刷新基金列表...")
    
    try:
        r = get_redis()
        
        # 直接从天天基金网获取所有基金净值
        funds_with_data = []
        for fund in POPULAR_FUNDS:
            data = fetch_fund_netvalue(fund["code"])
            
            if data:
                funds_with_data.append({**fund, **data})
            else:
                # 获取失败时，根据基金类型特殊处理
                fund_type = fund.get("type", "")
                
                # QDII 基金：尝试获取基本信息，显示"数据延迟"
                if fund_type == "QDII":
                    info = fetch_fund_info(fund["code"])
                    funds_with_data.append({
                        **fund,
                        "netValue": 0,
                        "change": 0,
                        "changePercent": 0,
                        "updateTime": "",
                        "note": "QDII 基金，数据可能延迟 1-2 天"
                    })
                # 货币基金：显示万份收益（这里简化处理，显示 0）
                elif fund_type == "货币型":
                    funds_with_data.append({
                        **fund,
                        "netValue": 1.0,  # 货币基金净值固定为 1
                        "change": 0.5,  # 模拟万份收益
                        "changePercent": 0.5,
                        "updateTime": datetime.now().strftime("%Y-%m-%d"),
                        "note": "货币基金，显示为万份收益"
                    })
                # 其他基金：标记为暂停申购或数据缺失
                else:
                    funds_with_data.append({
                        **fund,
                        "netValue": 0,
                        "change": 0,
                        "changePercent": 0,
                        "updateTime": "",
                        "note": "基金暂停申购或数据暂时缺失"
                    })
        
        # 构建响应数据
        result = {
            "success": True,
            "funds": funds_with_data,
            "count": len(funds_with_data),
            "type": "all"
        }
        
        # 添加缓存元数据
        result['_cacheTime'] = datetime.now().isoformat()
        result['_nextRefresh'] = (datetime.now().timestamp() + FUND_LIST_TTL)
        
        # 写入 Redis - 缓存键不包含 limit，与 API 保持一致
        cache_key = "funds:list:all"
        r.setex(cache_key, FUND_LIST_TTL, json.dumps(result, ensure_ascii=False))
        
        fund_count = len(funds_with_data)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ 基金列表刷新成功，缓存 {fund_count} 只基金")
        return True
            
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ 刷新失败：{e}")
        return False

def refresh_fund_details():
    """刷新热门基金详情缓存"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 📈 开始刷新基金详情...")
    
    r = get_redis()
    success_count = 0
    
    for code in POPULAR_FUND_CODES:
        try:
            # 调用详情 API
            url = f"{BASE_API}/api/funds/{code}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                data['_cacheTime'] = datetime.now().isoformat()
                
                cache_key = f"fund:detail:{code}"
                r.setex(cache_key, FUND_DETAIL_TTL, json.dumps(data, ensure_ascii=False))
                success_count += 1
                
        except Exception as e:
            print(f"  刷新 {code} 失败：{e}")
            continue
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ 基金详情刷新成功 {success_count}/{len(POPULAR_FUND_CODES)}")
    return success_count

def refresh_fund_history():
    """刷新热门基金历史数据缓存"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 📉 开始刷新基金历史...")
    
    r = get_redis()
    success_count = 0
    
    for code in POPULAR_FUND_CODES[:10]:  # 只刷新前 10 只的历史数据
        try:
            # 调用历史 API
            url = f"{BASE_API}/api/funds/{code}/history?page=1&size=60"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                data['_cacheTime'] = datetime.now().isoformat()
                
                cache_key = f"fund:history:{code}:1:60"
                r.setex(cache_key, FUND_HISTORY_TTL, json.dumps(data, ensure_ascii=False))
                success_count += 1
                
        except Exception as e:
            print(f"  刷新 {code} 历史失败：{e}")
            continue
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ 基金历史刷新成功 {success_count}/10")
    return success_count

def refresh_stock_list():
    """刷新股票列表缓存"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 📈 开始刷新股票列表...")
    
    try:
        r = get_redis()
        
        # 调用 API 获取最新数据
        response = requests.get(f"{STOCK_LIST_URL}", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            # 添加缓存元数据
            cache_data = {
                'stocks': data,
                '_cacheTime': datetime.now().isoformat(),
                '_nextRefresh': (datetime.now().timestamp() + STOCK_LIST_TTL)
            }
            
            # 写入 Redis
            cache_key = "stocks:popular"
            r.setex(cache_key, STOCK_LIST_TTL, json.dumps(cache_data, ensure_ascii=False))
            
            stock_count = len(data) if isinstance(data, list) else 0
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ 股票列表刷新成功，缓存 {stock_count} 只股票")
            return True
        else:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ API 返回错误：{response.status_code}")
            return False
            
    except requests.Timeout:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ 请求超时")
        return False
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ 刷新失败：{e}")
        return False

def refresh_all():
    """执行一次完整刷新"""
    print("\n" + "=" * 60)
    print(f"🔄 开始刷新所有金融数据 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    results = {
        'fund_list': refresh_fund_list(),
        'fund_details': refresh_fund_details(),
        'fund_history': refresh_fund_history(),
        'stock_list': refresh_stock_list()
    }
    
    print("\n" + "=" * 60)
    print("📊 刷新结果汇总:")
    print(f"  基金列表：{'✅' if results['fund_list'] else '❌'}")
    print(f"  基金详情：{'✅' if results['fund_details'] else '⚠️'}")
    print(f"  基金历史：{'✅' if results['fund_history'] else '⚠️'}")
    print(f"  股票列表：{'✅' if results['stock_list'] else '❌'}")
    print("=" * 60 + "\n")
    
    return all([results['fund_list'], results['stock_list']])

def main():
    """主循环"""
    print("=" * 60)
    print("🚀 金融数据后台刷新服务启动")
    print(f"   Redis: {REDIS_HOST}:{REDIS_PORT}")
    print(f"   基金缓存 TTL: {FUND_LIST_TTL}秒 ({FUND_LIST_TTL/60}分钟)")
    print(f"   股票缓存 TTL: {STOCK_LIST_TTL}秒 ({STOCK_LIST_TTL/60}分钟)")
    print("=" * 60)
    
    # 首次立即刷新
    refresh_all()
    
    # 定时刷新（每 45 分钟）
    refresh_interval = 2700  # 45 分钟
    
    while True:
        try:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 💤 等待 {refresh_interval/60}分钟后刷新...")
            time.sleep(refresh_interval)
            
            refresh_all()
            
        except KeyboardInterrupt:
            print("\n👋 收到退出信号，停止刷新服务")
            break
        except Exception as e:
            print(f"❌ 错误：{e}")
            time.sleep(60)  # 出错后等待 1 分钟

if __name__ == '__main__':
    main()
