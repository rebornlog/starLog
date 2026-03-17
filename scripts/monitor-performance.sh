#!/bin/bash
# 性能监控脚本
# 用法：./monitor-performance.sh

echo "=== starLog 性能监控 ==="
echo "时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 服务状态
echo "【服务状态】"
pm2 list --mini 2>/dev/null || pm2 list | grep -E "online|errored"
echo ""

# API 响应时间
echo "【API 响应时间】"
fund_time=$(curl -w "%{time_total}" -o /dev/null -s "http://localhost:8082/api/funds/list" 2>/dev/null || echo "N/A")
stock_time=$(curl -w "%{time_total}" -o /dev/null -s "http://localhost:8081/api/stocks/popular" 2>/dev/null || echo "N/A")
echo "  基金列表 API: ${fund_time}s"
echo "  股票列表 API: ${stock_time}s"
echo ""

# Redis 缓存
echo "【Redis 缓存】"
hits=$(redis-cli INFO stats 2>/dev/null | grep keyspace_hits | cut -d: -f2 | tr -d '\r')
misses=$(redis-cli INFO stats 2>/dev/null | grep keyspace_misses | cut -d: -f2 | tr -d '\r')
if [ -n "$hits" ] && [ -n "$misses" ]; then
    total=$((hits + misses))
    if [ $total -gt 0 ]; then
        rate=$(echo "scale=2; $hits * 100 / $total" | bc)
        echo "  命中数：$hits"
        echo "  未命中：$misses"
        echo "  命中率：${rate}%"
    fi
fi
echo ""

# 内存使用
echo "【内存使用】"
pm2 list 2>/dev/null | grep -E "starlog|finance|fund|api-proxy" | awk '{printf "  %-20s %s\n", $2, $9}'
echo ""

echo "=== 监控完成 ==="
