#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
开盘前数据预取脚本
在交易日 9:25 自动刷新基金数据，确保开盘时数据最新

使用方法：
1. 添加到 crontab:
   25 9 * * 1-5 cd /path/to/starLog && ./scripts/pre-market-refresh.py

2. 或手动执行:
   python scripts/pre-market-refresh.py
"""

import sys
import os
from datetime import datetime, time, timedelta
import requests
import json

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 配置
API_BASE = "http://localhost:8081"
LOG_FILE = "/tmp/pre-market-refresh.log"
POPULAR_FUNDS = [
    "005827", "003096", "260108", "161725", "110011",
    "007119", "000083", "001938", "001763", "166002",
    "000041", "000171", "000198", "000055", "510300"
]

def log(message: str):
    """记录日志"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_msg = f"[{timestamp}] {message}"
    print(log_msg)
    
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(log_msg + "\n")
    except Exception as e:
        print(f"写入日志失败：{e}")

def is_trading_day() -> bool:
    """
    判断是否为交易日
    简化版：排除周末和中国主要节假日
    """
    today = datetime.now()
    
    # 排除周末
    if today.weekday() >= 5:  # 5=周六，6=周日
        return False
    
    # 中国主要节假日（2026 年）
    holidays = [
        "2026-01-01",  # 元旦
        "2026-02-17", "2026-02-18", "2026-02-19", "2026-02-20", "2026-02-21", "2026-02-22", "2026-02-23",  # 春节
        "2026-04-04", "2026-04-05", "2026-04-06",  # 清明
        "2026-05-01", "2026-05-02", "2026-05-03",  # 劳动节
        "2026-06-19", "2026-06-20", "2026-06-21",  # 端午
        "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08",  # 国庆
    ]
    
    today_str = today.strftime("%Y-%m-%d")
    if today_str in holidays:
        return False
    
    return True

def refresh_fund_data():
    """刷新基金数据"""
    log("🚀 开始开盘前数据预取...")
    
    success_count = 0
    fail_count = 0
    
    # 1. 刷新基金列表缓存
    try:
        log("📊 刷新基金列表缓存...")
        response = requests.get(
            f"{API_BASE}/api/funds/list?fund_type=all&limit=100&refresh=true",
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            count = data.get("count", 0)
            log(f"✅ 基金列表刷新成功，共 {count} 只")
            success_count += 1
        else:
            log(f"❌ 基金列表刷新失败：{response.status_code}")
            fail_count += 1
    except Exception as e:
        log(f"❌ 基金列表刷新异常：{e}")
        fail_count += 1
    
    # 2. 预取热门基金详情
    log(f"📈 预取 {len(POPULAR_FUNDS)} 只热门基金详情...")
    for code in POPULAR_FUNDS:
        try:
            response = requests.get(
                f"{API_BASE}/api/funds/{code}",
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    net_value = data.get("data", {}).get("unitNetValue", 0)
                    log(f"  ✅ {code} - {data.get('data', {}).get('name', '')}: ¥{net_value}")
                    success_count += 1
                else:
                    log(f"  ❌ {code}: API 返回错误")
                    fail_count += 1
            else:
                log(f"  ❌ {code}: HTTP {response.status_code}")
                fail_count += 1
        except Exception as e:
            log(f"  ❌ {code}: {e}")
            fail_count += 1
    
    # 3. 刷新后台数据
    try:
        log("🔄 触发后台数据刷新...")
        response = requests.get(
            f"{API_BASE}/api/funds/list?fund_type=all&limit=100",
            timeout=5
        )
        if response.status_code == 200:
            log("✅ 后台数据刷新触发成功")
        else:
            log(f"⚠️ 后台数据刷新触发失败：{response.status_code}")
    except Exception as e:
        log(f"⚠️ 后台数据刷新触发异常：{e}")
    
    # 汇总
    log("=" * 50)
    log(f"📊 刷新结果汇总:")
    log(f"  ✅ 成功：{success_count}")
    log(f"  ❌ 失败：{fail_count}")
    log(f"  📈 成功率：{success_count / (success_count + fail_count) * 100:.1f}%")
    log("=" * 50)
    
    return fail_count == 0

def main():
    """主函数"""
    log("=" * 50)
    log("🌅 开盘前数据预取脚本")
    log(f"📅 日期：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log("=" * 50)
    
    # 检查是否为交易日
    if not is_trading_day():
        log("⏸️  今天不是交易日，跳过刷新")
        return 0
    
    # 检查时间（可选：确保在 9:00-9:30 之间执行）
    now = datetime.now().time()
    market_open_prep = time(9, 0)  # 9:00
    market_open = time(9, 30)  # 9:30
    
    # 如果不在准备时间段，也执行（可能是手动触发）
    if now < market_open_prep or now > market_open:
        log(f"⚠️  当前时间 {now} 不在准备时间段 (9:00-9:30)，但仍执行刷新")
    
    # 执行刷新
    success = refresh_fund_data()
    
    # 返回状态码
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
