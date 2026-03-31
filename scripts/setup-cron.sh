#!/bin/bash
# setup-cron.sh - 配置定时任务
# 用法：./setup-cron.sh [--install|--list|--remove]

CRON_FILE="/tmp/starlog-crontab"
SCRIPTS_DIR="/home/admin/.openclaw/workspace/starLog/scripts"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 生成 cron 配置
generate_cron() {
    cat << 'EOF'
# starLog 定时任务配置
# 时区：Asia/Shanghai

# 每 5 分钟检查系统状态
*/5 * * * * /home/admin/.openclaw/workspace/starLog/scripts/smart-monitor.sh --check >> /tmp/cron-monitor.log 2>&1

# 每小时生成性能报告
0 * * * * /home/admin/.openclaw/workspace/starLog/scripts/performance-check.sh --report >> /tmp/cron-performance.log 2>&1

# 每天早上 9 点生成日志日报
0 9 * * * /home/admin/.openclaw/workspace/starLog/scripts/analyze-logs.sh --daily >> /tmp/cron-logs.log 2>&1

# 每周日凌晨 2 点清理旧日志
0 2 * * 0 /home/admin/.openclaw/workspace/starLog/scripts/analyze-logs.sh --clean >> /tmp/cron-cleanup.log 2>&1

# 每周一早上 9 点生成周报
0 9 * * 1 /home/admin/.openclaw/workspace/starLog/scripts/analyze-logs.sh --report >> /tmp/cron-weekly.log 2>&1
EOF
}

# 安装 cron 配置
install_cron() {
    log "📋 生成 cron 配置..."
    generate_cron > $CRON_FILE
    
    log "📝 当前 cron 配置预览:"
    cat $CRON_FILE
    echo ""
    
    log "⏳ 准备安装到 crontab..."
    
    # 备份现有 crontab
    crontab -l > /tmp/crontab.backup.$(date +%Y%m%d%H%M%S) 2>/dev/null
    
    # 安装新配置
    crontab $CRON_FILE
    
    if [ $? -eq 0 ]; then
        log "${GREEN}✅ cron 配置已安装${NC}"
        log "📄 备份位置：/tmp/crontab.backup.*"
        
        # 验证
        log "📋 当前 crontab:"
        crontab -l
    else
        log "${RED}❌ cron 配置安装失败${NC}"
        return 1
    fi
}

# 列出当前 cron
list_cron() {
    log "📋 当前 crontab 配置:"
    crontab -l 2>/dev/null || echo "未配置 crontab"
}

# 移除 starLog cron
remove_cron() {
    log "🗑️  移除 starLog cron 配置..."
    
    # 备份
    crontab -l > /tmp/crontab.backup.remove.$(date +%Y%m%d%H%M%S) 2>/dev/null
    
    # 清空 crontab
    crontab -r
    
    log "${GREEN}✅ 已移除所有 cron 配置${NC}"
    log "📄 备份位置：/tmp/crontab.backup.remove.*"
}

# 测试 cron 脚本
test_scripts() {
    log "🧪 测试脚本可执行性..."
    
    scripts=(
        "smart-monitor.sh"
        "performance-check.sh"
        "analyze-logs.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ -x "$SCRIPTS_DIR/$script" ]; then
            log "${GREEN}✅ $script 可执行${NC}"
        else
            log "${YELLOW}⚠️  $script 不可执行，正在修复...${NC}"
            chmod +x "$SCRIPTS_DIR/$script"
        fi
    done
}

# 主函数
main() {
    case ${1:---install} in
        --install)
            test_scripts
            install_cron
            ;;
        --list)
            list_cron
            ;;
        --remove)
            remove_cron
            ;;
        --test)
            test_scripts
            ;;
        *)
            echo "用法：$0 [--install|--list|--remove|--test]"
            echo "  --install  安装 cron 配置"
            echo "  --list     列出当前 cron"
            echo "  --remove   移除 cron 配置"
            echo "  --test     测试脚本可执行性"
            exit 1
            ;;
    esac
}

main "$@"
