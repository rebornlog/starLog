#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基金数据后台刷新脚本
定时刷新 Redis 缓存，确保数据新鲜度
"""

import sys
import os
import requests
import redis
import json
import time
from datetime import datetime

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Redis 配置
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_DB = 0

# API 配置
FUND_API_URL = 'http://localhost:8082/api/funds/list'
CACHE_TTL = 600  # 10 分钟

# 热门基金代码列表（用于预刷新）
POPULAR_FUND_CODES = [
    '005827', '003096', '260108', '161725', '007119',
    '000083', '001938', '001763', '166002', '000041',
    '000171', '000055', '510300', '510500', '159915',
    '513050', '512880'
]

def get_redis():
    """获取 Redis 连接"""
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)

def refresh_fund_list():
    """刷新基金列表缓存"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 开始刷新基金列表...")
    
    try:
        # 调用 API 获取最新数据
        response = requests.get(f"{FUND_API_URL}?fund_type=all&limit=100", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            # 写入 Redis
            r = get_redis()
            cache_key = "funds:list:all:100"
            r.setex(cache_key, CACHE_TTL, json.dumps(data, ensure_ascii=False))
            
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ 基金列表刷新成功，缓存 {len(data.get('funds', []))} 只基金")
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

def refresh_fund_details():
    """刷新热门基金详情缓存"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] 开始刷新基金详情...")
    
    r = get_redis()
    success_count = 0
    
    for code in POPULAR_FUND_CODES:
        try:
            # 调用详情 API
            url = f"http://localhost:8082/api/funds/{code}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                cache_key = f"fund:detail:{code}"
                r.setex(cache_key, 3600, json.dumps(data, ensure_ascii=False))
                success_count += 1
                
        except Exception as e:
            print(f"  刷新 {code} 失败：{e}")
            continue
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ 基金详情刷新成功 {success_count}/{len(POPULAR_FUND_CODES)}")
    return success_count

def main():
    """主循环"""
    print("=" * 50)
    print("🔄 基金数据后台刷新服务启动")
    print(f"   Redis: {REDIS_HOST}:{REDIS_PORT}")
    print(f"   API: {FUND_API_URL}")
    print(f"   缓存 TTL: {CACHE_TTL}秒")
    print("=" * 50)
    
    # 首次立即刷新
    refresh_fund_list()
    refresh_fund_details()
    
    # 定时刷新（每 5 分钟）
    refresh_interval = 300  # 5 分钟
    
    while True:
        try:
            time.sleep(refresh_interval)
            
            print("\n" + "=" * 50)
            refresh_fund_list()
            refresh_fund_details()
            
        except KeyboardInterrupt:
            print("\n👋 收到退出信号，停止刷新服务")
            break
        except Exception as e:
            print(f"❌ 错误：{e}")
            time.sleep(60)  # 出错后等待 1 分钟

if __name__ == '__main__':
    main()
