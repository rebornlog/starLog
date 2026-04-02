#!/bin/bash
# security-monitor.sh - 系统安全监控脚本
# 检测异常进程、可疑文件、入侵痕迹

set -e

WORKSPACE_DIR="/home/admin/.openclaw/workspace/starLog"
LOG_FILE="/tmp/security-monitor.log"
ALERT_FILE="/tmp/security-alerts.log"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() { log "${GREEN}✅$NC $1"; }
log_warning() { log "${YELLOW}⚠️$NC  $1"; }
log_error() { log "${RED}❌$NC $1"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] ALERT: $1" >> "$ALERT_FILE"; }

# ==================== 1. 检测 /dev/shm/ 可疑文件 ====================
check_shm_directory() {
    log "🔍 检查 /dev/shm/ 目录..."
    
    local suspicious=0
    
    # /dev/shm/ 应该是空的或只有系统文件
    local files=$(ls -la /dev/shm/ 2>/dev/null | grep -v "^d" | grep -v "^total" | grep -v "aliyun-assist" | wc -l)
    
    if [ "$files" -gt 0 ]; then
        log_error "发现 /dev/shm/ 有 $files 个可疑文件："
        ls -la /dev/shm/ 2>/dev/null | grep -v "^d" | grep -v "^total" | grep -v "aliyun-assist" | while read line; do
            log "  $line"
        done
        suspicious=1
        
        # 检查是否有可执行文件
        local executables=$(find /dev/shm/ -type f -executable 2>/dev/null | wc -l)
        if [ "$executables" -gt 0 ]; then
            log_error "发现 $executables 个可执行文件（可能是恶意软件）："
            find /dev/shm/ -type f -executable 2>/dev/null | while read file; do
                log "  ❌ $file"
            done
        fi
    else
        log_success "/dev/shm/ 目录正常"
    fi
    
    return $suspicious
}

# ==================== 2. 检测异常进程 ====================
check_suspicious_processes() {
    log "🔍 检测异常进程..."
    
    local suspicious=0
    
    # 检查高 CPU 使用率进程（>50%）
    local high_cpu=$(ps aux --sort=-%cpu | awk 'NR>1 && $3>50 {print $0}' | wc -l)
    if [ "$high_cpu" -gt 0 ]; then
        log_warning "发现 $high_cpu 个高 CPU 使用率进程："
        ps aux --sort=-%cpu | awk 'NR>1 && $3>50 {print "  CPU:"$3"% MEM:"$4"% CMD:"$11}' | head -5
    fi
    
    # 检查高内存使用率进程（>20%）
    local high_mem=$(ps aux --sort=-%mem | awk 'NR>1 && $4>20 {print $0}' | wc -l)
    if [ "$high_mem" -gt 0 ]; then
        log_warning "发现 $high_mem 个高内存使用率进程："
        ps aux --sort=-%mem | awk 'NR>1 && $4>20 {print "  MEM:"$4"% CPU:"$3"% CMD:"$11}' | head -5
    fi
    
    # 检查可疑进程名
    local suspicious_patterns="minerd|cpuminer|xmrig|kdevtmpfsi|kinsing|UDh3vaAa|FxM23"
    local suspicious_procs=$(ps aux | grep -E "$suspicious_patterns" | grep -v grep | wc -l)
    if [ "$suspicious_procs" -gt 0 ]; then
        log_error "发现 $suspicious_procs 个可疑进程（可能是挖矿病毒）："
        ps aux | grep -E "$suspicious_patterns" | grep -v grep | while read line; do
            log "  ❌ $line"
        done
        suspicious=1
    fi
    
    # 检查 /dev/shm/ 运行的进程
    local shm_procs=$(ps aux | grep "/dev/shm/" | grep -v grep | wc -l)
    if [ "$shm_procs" -gt 0 ]; then
        log_error "发现 $shm_procs 个从 /dev/shm/ 运行的进程（高度可疑）："
        ps aux | grep "/dev/shm/" | grep -v grep | while read line; do
            log "  ❌ $line"
        done
        suspicious=1
    fi
    
    if [ "$suspicious" -eq 0 ]; then
        log_success "未发现异常进程"
    fi
    
    return $suspicious
}

# ==================== 3. 检测异常网络连接 ====================
check_suspicious_connections() {
    log "🔍 检测异常网络连接..."
    
    # 检查大量外连
    local connections=$(netstat -ant 2>/dev/null | grep ESTABLISHED | wc -l)
    if [ "$connections" -gt 100 ]; then
        log_warning "发现 $connections 个活跃连接（可能异常）"
    else
        log_success "网络连接正常：$connections 个活跃连接"
    fi
    
    # 检查可疑端口
    local suspicious_ports="4444|5555|6666|7777|8888|9999"
    local suspicious_conns=$(netstat -ant 2>/dev/null | grep -E "$suspicious_ports" | wc -l)
    if [ "$suspicious_conns" -gt 0 ]; then
        log_warning "发现 $suspicious_conns 个可疑端口连接："
        netstat -ant 2>/dev/null | grep -E "$suspicious_ports" | head -5
    fi
    
    return 0
}

# ==================== 4. 检测定时任务篡改 ====================
check_crontab() {
    log "🔍 检查定时任务..."
    
    # 检查 crontab 中是否有可疑命令
    local suspicious_cron=$(crontab -l 2>/dev/null | grep -E "curl.*sh|wget.*sh|/dev/shm/" | wc -l)
    if [ "$suspicious_cron" -gt 0 ]; then
        log_error "发现可疑定时任务："
        crontab -l 2>/dev/null | grep -E "curl.*sh|wget.*sh|/dev/shm/"
        return 1
    else
        log_success "定时任务正常"
        return 0
    fi
}

# ==================== 5. 检测系统文件篡改 ====================
check_system_files() {
    log "🔍 检查系统文件..."
    
    # 检查 /etc/passwd 是否有异常用户
    local unusual_users=$(cat /etc/passwd | grep -v "nologin\|false" | grep -v "root\|admin\|ubuntu" | wc -l)
    if [ "$unusual_users" -gt 0 ]; then
        log_warning "发现不寻常的登录用户："
        cat /etc/passwd | grep -v "nologin\|false" | grep -v "root\|admin\|ubuntu"
    fi
    
    # 检查 SSH 密钥
    if [ -f /home/admin/.ssh/authorized_keys ]; then
        local key_count=$(cat /home/admin/.ssh/authorized_keys | wc -l)
        log "SSH 授权密钥数：$key_count"
        if [ "$key_count" -gt 3 ]; then
            log_warning "SSH 密钥数量异常（$key_count 个）"
        fi
    fi
    
    log_success "系统文件检查完成"
    return 0
}

# ==================== 6. 检测 PM2 进程异常 ====================
check_pm2_processes() {
    log "🔍 检查 PM2 进程..."
    
    if ! command -v pm2 &> /dev/null; then
        log_warning "PM2 未安装，跳过检查"
        return 0
    fi
    
    # 检查 PM2 进程状态
    local waiting=$(pm2 list 2>/dev/null | grep "waiting" | wc -l)
    if [ "$waiting" -gt 0 ]; then
        log_warning "发现 $waiting 个 PM2 进程处于 waiting 状态（可能内存不足）"
        pm2 list 2>/dev/null | grep "waiting"
    fi
    
    # 检查重启次数
    local high_restart=$(pm2 list 2>/dev/null | awk '$8 > 50 {print $0}' | wc -l)
    if [ "$high_restart" -gt 0 ]; then
        log_warning "发现 $high_restart 个 PM2 进程重启次数过多（>50 次）"
        pm2 list 2>/dev/null | awk '$8 > 50 {print "  "$2" 重启 "$8" 次"}'
    fi
    
    log_success "PM2 进程检查完成"
    return 0
}

# ==================== 主流程 ====================
main() {
    mkdir -p "$(dirname $LOG_FILE)" "$(dirname $ALERT_FILE)"
    
    log "=========================================="
    log "🛡️  系统安全检查开始"
    log "=========================================="
    
    local total_issues=0
    
    check_shm_directory || ((total_issues++))
    check_suspicious_processes || ((total_issues++))
    check_suspicious_connections || ((total_issues++))
    check_crontab || ((total_issues++))
    check_system_files || true  # 不中断
    check_pm2_processes || true  # 不中断
    
    log "=========================================="
    if [ "$total_issues" -gt 0 ]; then
        log_error "安全检查发现 $total_issues 个问题！"
        log "告警日志：$ALERT_FILE"
        exit 1
    else
        log_success "安全检查通过，无异常"
        exit 0
    fi
}

main "$@"
