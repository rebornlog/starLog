#!/bin/bash

# starLog 监控告警脚本
# 功能：系统资源监控、服务状态检查、异常告警
# 用法：./monitor-alert.sh [check|alert|status]

set -e

# 配置
ALERT_THRESHOLD_CPU=80      # CPU 告警阈值 (%)
ALERT_THRESHOLD_MEMORY=85   # 内存告警阈值 (%)
ALERT_THRESHOLD_DISK=90     # 磁盘告警阈值 (%)
ALERT_THRESHOLD_DB_CONN=80  # 数据库连接池告警阈值 (%)
CHECK_INTERVAL=300          # 检查间隔 (秒)
LOG_FILE=/tmp/starlog-monitor.log
ALERT_LOG=/tmp/starlog-alerts.log

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$ALERT_LOG"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$ALERT_LOG"
}

# 检查 CPU 使用率
check_cpu() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    
    if [ -z "$cpu_usage" ]; then
        # 尝试另一种方法
        cpu_usage=$(vmstat 1 2 | tail -1 | awk '{print 100 - $15}')
    fi
    
    cpu_usage=${cpu_usage%.*}  # 取整数部分
    
    if [ "$cpu_usage" -gt "$ALERT_THRESHOLD_CPU" ]; then
        log_error "CPU 使用率过高：${cpu_usage}% (阈值：${ALERT_THRESHOLD_CPU}%)"
        return 1
    else
        log_success "CPU 使用率：${cpu_usage}%"
        return 0
    fi
}

# 检查内存使用率
check_memory() {
    local mem_info=$(free | grep Mem)
    local total=$(echo $mem_info | awk '{print $2}')
    local used=$(echo $mem_info | awk '{print $3}')
    local usage=$((used * 100 / total))
    
    if [ "$usage" -gt "$ALERT_THRESHOLD_MEMORY" ]; then
        log_error "内存使用率过高：${usage}% (阈值：${ALERT_THRESHOLD_MEMORY}%)"
        return 1
    else
        log_success "内存使用率：${usage}%"
        return 0
    fi
}

# 检查磁盘使用率
check_disk() {
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt "$ALERT_THRESHOLD_DISK" ]; then
        log_error "磁盘使用率过高：${disk_usage}% (阈值：${ALERT_THRESHOLD_DISK}%)"
        return 1
    else
        log_success "磁盘使用率：${disk_usage}%"
        return 0
    fi
}

# 检查 Docker 容器状态
check_containers() {
    local failed=0
    
    # 检查 PostgreSQL
    if docker ps | grep -q starlog-db; then
        log_success "PostgreSQL 容器运行中"
    else
        log_error "PostgreSQL 容器未运行"
        failed=1
    fi
    
    # 检查 SearXNG
    if docker ps | grep -q searxng; then
        log_success "SearXNG 容器运行中"
    else
        log_warning "SearXNG 容器未运行"
    fi
    
    return $failed
}

# 检查 Next.js 服务
check_nextjs() {
    if pgrep -f "next-server" > /dev/null; then
        local pid=$(pgrep -f "next-server")
        log_success "Next.js 服务运行中 (PID: $pid)"
        return 0
    else
        log_error "Next.js 服务未运行"
        return 1
    fi
}

# 检查金融 API 服务
check_finance_api() {
    if pgrep -f "uvicorn.*finance.main" > /dev/null; then
        local pid=$(pgrep -f "uvicorn.*finance.main")
        log_success "金融 API 服务运行中 (PID: $pid)"
        return 0
    else
        log_error "金融 API 服务未运行"
        return 1
    fi
}

# 检查 OpenClaw Gateway
check_openclaw() {
    if pgrep -f "openclaw-gateway" > /dev/null; then
        local pid=$(pgrep -f "openclaw-gateway")
        log_success "OpenClaw Gateway 运行中 (PID: $pid)"
        return 0
    else
        log_error "OpenClaw Gateway 未运行"
        return 1
    fi
}

# 检查端口监听
check_ports() {
    local failed=0
    
    # 检查前端端口 3000
    if netstat -tlnp 2>/dev/null | grep -q ":3000" || lsof -i :3000 2>/dev/null | grep -q LISTEN; then
        log_success "端口 3000 (前端) 监听中"
    else
        log_error "端口 3000 (前端) 未监听"
        failed=1
    fi
    
    # 检查金融 API 端口 8081
    if netstat -tlnp 2>/dev/null | grep -q ":8081" || lsof -i :8081 2>/dev/null | grep -q LISTEN; then
        log_success "端口 8081 (金融 API) 监听中"
    else
        log_error "端口 8081 (金融 API) 未监听"
        failed=1
    fi
    
    # 检查数据库端口 5432
    if netstat -tlnp 2>/dev/null | grep -q ":5432" || lsof -i :5432 2>/dev/null | grep -q LISTEN; then
        log_success "端口 5432 (PostgreSQL) 监听中"
    else
        log_warning "端口 5432 (PostgreSQL) 未监听"
    fi
    
    return $failed
}

# 检查 Redis 连接
check_redis() {
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping &> /dev/null; then
            log_success "Redis 连接正常"
            return 0
        else
            log_warning "Redis 连接失败"
            return 1
        fi
    else
        log_info "Redis CLI 未安装，跳过检查"
        return 0
    fi
}

# 检查进程数
check_process_count() {
    local nextjs_count=$(pgrep -f "next-server" | wc -l)
    local node_count=$(pgrep -f "node" | wc -l)
    
    if [ "$nextjs_count" -gt 5 ]; then
        log_warning "Next.js 进程数过多：$nextjs_count (可能内存泄漏)"
        return 1
    else
        log_success "Next.js 进程数：$nextjs_count"
        return 0
    fi
}

# 生成状态报告
generate_report() {
    echo ""
    echo "========================================"
    echo "📊 starLog 系统状态报告"
    echo "========================================"
    echo "时间：$(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # 系统资源
    echo "💻 系统资源"
    echo "--------"
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')"
    free -h | grep Mem
    df -h / | awk 'NR==2 {print "磁盘："$3"/"$2" ("$5" 已用)"}'
    echo ""
    
    # 服务状态
    echo "🚀 服务状态"
    echo "--------"
    echo "Next.js: $(pgrep -f next-server > /dev/null && echo '✅ 运行中' || echo '❌ 未运行')"
    echo "金融 API: $(pgrep -f uvicorn.*finance.main > /dev/null && echo '✅ 运行中' || echo '❌ 未运行')"
    echo "OpenClaw: $(pgrep -f openclaw-gateway > /dev/null && echo '✅ 运行中' || echo '❌ 未运行')"
    echo "PostgreSQL: $(docker ps | grep -q starlog-db && echo '✅ 运行中' || echo '❌ 未运行')"
    echo ""
    
    # 端口状态
    echo "🔌 端口状态"
    echo "--------"
    echo "3000 (前端): $(ss -tlnp | grep -q ':3000' && echo '✅ 监听中' || echo '❌ 未监听')"
    echo "8081 (API): $(ss -tlnp | grep -q ':8081' && echo '✅ 监听中' || echo '❌ 未监听')"
    echo "5432 (DB): $(ss -tlnp | grep -q ':5432' && echo '✅ 监听中' || echo '❌ 未监听')"
    echo ""
    
    # 最近告警
    echo "⚠️  最近告警"
    echo "--------"
    if [ -f "$ALERT_LOG" ]; then
        tail -5 "$ALERT_LOG"
    else
        echo "无告警记录"
    fi
    echo ""
    echo "========================================"
}

# 发送告警（可扩展为邮件、钉钉、飞书等）
send_alert() {
    local message="$1"
    
    # 这里可以集成各种告警方式
    # 例如：飞书 webhook、钉钉机器人、邮件等
    
    log_error "告警：$message"
    
    # 示例：飞书 webhook（需要配置）
    # curl -X POST "https://open.feishu.cn/open-apis/bot/v2/hook/XXX" \
    #   -H "Content-Type: application/json" \
    #   -d "{\"msg_type\":\"text\",\"content\":{\"text\":\"starLog 告警：$message\"}}"
}

# 主检查流程
run_checks() {
    local failed=0
    
    log_info "开始系统检查..."
    echo ""
    
    # 系统资源检查
    check_cpu || failed=1
    check_memory || failed=1
    check_disk || failed=1
    
    echo ""
    
    # 服务状态检查
    check_containers || failed=1
    check_nextjs || failed=1
    check_finance_api || failed=1
    check_openclaw || failed=1
    
    echo ""
    
    # 端口检查
    check_ports || failed=1
    
    # 其他检查
    check_redis || true  # 非关键
    check_process_count || failed=1
    
    echo ""
    
    if [ $failed -eq 0 ]; then
        log_success "所有检查通过！"
    else
        log_error "发现 $failed 项问题，请检查上述日志"
        send_alert "系统检查发现 $failed 项问题"
    fi
    
    return $failed
}

# 持续监控模式
monitor_loop() {
    log_info "启动持续监控（间隔：${CHECK_INTERVAL}秒）"
    log_info "按 Ctrl+C 停止"
    
    while true; do
        run_checks
        sleep $CHECK_INTERVAL
    done
}

# 显示帮助
show_help() {
    echo ""
    echo "🔍 starLog 监控告警脚本"
    echo "======================"
    echo ""
    echo "用法：$0 <command>"
    echo ""
    echo "命令:"
    echo "  check    执行一次完整检查"
    echo "  status   生成状态报告"
    echo "  monitor  持续监控模式"
    echo "  alerts   查看历史告警"
    echo "  help     显示帮助"
    echo ""
    echo "示例:"
    echo "  $0 check     # 执行一次检查"
    echo "  $0 status    # 查看系统状态"
    echo "  $0 monitor   # 持续监控"
    echo ""
    echo "配置:"
    echo "  CPU 告警阈值：   ${ALERT_THRESHOLD_CPU}%"
    echo "  内存告警阈值：   ${ALERT_THRESHOLD_MEMORY}%"
    echo "  磁盘告警阈值：   ${ALERT_THRESHOLD_DISK}%"
    echo "  检查间隔：       ${CHECK_INTERVAL}秒"
    echo ""
}

# 主程序
case "$1" in
    check)
        run_checks
        ;;
    status)
        generate_report
        ;;
    monitor)
        monitor_loop
        ;;
    alerts)
        if [ -f "$ALERT_LOG" ]; then
            echo "📋 历史告警记录"
            echo "=============="
            cat "$ALERT_LOG"
        else
            echo "无告警记录"
        fi
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        # 默认执行检查
        run_checks
        ;;
esac
