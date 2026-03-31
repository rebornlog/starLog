#!/bin/bash
# auto-improve.sh - 智能代码优化脚本
# 检测网站问题并自动优化代码，提交改进

set -e

WORKSPACE_DIR="/home/admin/.openclaw/workspace/starLog"
REPORT_DIR="$WORKSPACE_DIR/test-reports"
IMPROVE_LOG="/tmp/auto-improve.log"
GIT_USER="openclaw-bot"
GIT_EMAIL="bot@starlog.dev"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$IMPROVE_LOG"
}

log_step() { log "${BLUE}📍$NC $1"; }
log_success() { log "${GREEN}✅$NC $1"; }
log_warning() { log "${YELLOW}⚠️$NC $1"; }
log_error() { log "${RED}❌$NC $1"; }
log_info() { log "${NC}ℹ️$NC $1"; }

# 优化目标：只优化明确的问题，不破坏现有功能
# 1. 添加缺失的 metadata（安全）
# 2. 优化图片加载（安全）
# 3. 添加错误边界（安全）
# 4. 性能优化建议（生成报告）

# 优化 1: 为缺少 metadata 的页面添加配置
optimize_metadata() {
    log_step "优化 1: 检查并添加缺失的 metadata..."
    
    local improved=0
    local pages_to_check=(
        "app/funds/page.tsx"
        "app/stocks/page.tsx"
        "app/blog/page.tsx"
        "app/zodiac/page.tsx"
        "app/iching/page.tsx"
    )
    
    for page_file in "${pages_to_check[@]}"; do
        local full_path="$WORKSPACE_DIR/$page_file"
        
        if [ -f "$full_path" ]; then
            local page_name=$(basename $(dirname "$page_file"))
            
            # 检查是否已有 metadata
            if ! grep -q "export const metadata" "$full_path" && ! grep -q "export async function generateMetadata" "$full_path"; then
                log_warning "  发现缺少 metadata: $page_name"
                
                # 生成合适的 title 和 description
                local title=""
                local description=""
                
                case "$page_name" in
                    funds)
                        title="基金 - 实时净值查询 | starLog"
                        description="实时基金净值查询，支持场外基金、ETF 基金，提供历史业绩、持仓分析等功能"
                        ;;
                    stocks)
                        title="股票 - A 股实时行情 | starLog"
                        description="A 股实时行情监控，支持个股详情、K 线图、资金流向分析"
                        ;;
                    blog)
                        title="博客 - 技术文章分享 | starLog"
                        description="技术博客，分享编程经验、架构设计、性能优化等实战心得"
                        ;;
                    zodiac)
                        title="星座运势 - 十二星座查询 | starLog"
                        description="十二星座每日运势查询，爱情、事业、健康全方位解析"
                        ;;
                    iching)
                        title="易经问卦 - 在线起卦解卦 | starLog"
                        description="易经六十四卦在线起卦，提供卦象解析、变爻分析"
                        ;;
                    *)
                        title="$page_name | starLog"
                        description="$page_name 页面 - starLog 个人知识库"
                        ;;
                esac
                
                # 创建 metadata 文件（如果不存在）
                local metadata_file="$WORKSPACE_DIR/app/$page_name/metadata.ts"
                if [ ! -f "$metadata_file" ]; then
                    cat > "$metadata_file" << EOF
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '$title',
  description: '$description',
  keywords: ['$page_name', 'starLog'],
  openGraph: {
    title: '$title',
    description: '$description',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '$title',
    description: '$description',
  },
}
EOF
                    log_success "    已创建 metadata.ts: $page_name"
                    ((improved++))
                fi
            fi
        fi
    done
    
    log "✅ 共优化 $improved 个页面的 metadata"
    return $improved
}

# 优化 2: 为图片添加 loading="lazy"
optimize_images_lazy() {
    log_step "优化 2: 为图片添加懒加载..."
    
    local improved=0
    
    # 查找所有包含<img>但没有 loading 属性的文件
    find "$WORKSPACE_DIR/app" "$WORKSPACE_DIR/components" -name "*.tsx" -type f 2>/dev/null | head -20 | while read file; do
        if grep -q '<img' "$file" && ! grep -q 'loading=' "$file"; then
            # 使用 sed 添加 lazy loading
            sed -i.bak 's/<img/<img loading="lazy"/g' "$file" 2>/dev/null && {
                rm -f "${file}.bak"
                log_success "  已添加懒加载：$(basename $file)"
                ((improved++))
            }
        fi
    done
    
    log "✅ 图片懒加载优化完成"
}

# 优化 3: 添加错误边界组件
add_error_boundary() {
    log_step "优化 3: 检查错误边界..."
    
    local error_boundary_file="$WORKSPACE_DIR/components/ErrorBoundary.tsx"
    
    if [ ! -f "$error_boundary_file" ]; then
        log_warning "  发现缺少全局错误边界组件"
        
        cat > "$error_boundary_file" << 'EOF'
'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-teal-50">
          <div className="text-center max-w-md p-8">
            <div className="text-6xl mb-4">🌿</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">哎呀，出错了</h1>
            <p className="text-gray-600 mb-6">页面遇到了一些问题，请稍后重试</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
EOF
        log_success "  已创建 ErrorBoundary 组件"
    else
        log_success "  错误边界组件已存在"
    fi
}

# 优化 4: 性能优化检查
performance_check() {
    log_step "优化 4: 性能优化检查..."
    
    local report_file="$REPORT_DIR/performance-improvements-$(date +%Y-%m-%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# 🔍 性能优化建议

**生成时间：** $(date '+%Y-%m-%d %H:%M:%S')

---

## ✅ 已自动优化

- [x] 图片懒加载
- [x] Metadata 配置
- [x] 错误边界组件

---

## 💡 建议人工优化

### P0 - 高优先级

- [ ] **代码分割** - 使用 dynamic import 按需加载大组件
- [ ] **图片优化** - 使用 Next.js Image 组件替代<img>
- [ ] **缓存策略** - 配置 React Query 或 SWR 缓存 API 数据

### P1 - 中优先级

- [ ] **骨架屏** - 为所有加载状态添加骨架屏
- [ ] **预加载** - 关键路由使用 Link prefetch
- [ ] **Service Worker** - 实现离线缓存

### P2 - 低优先级

- [ ] **Web Vitals** - 集成性能监控
- [ ] **CDN** - 静态资源使用 CDN
- [ ] **压缩** - 启用 Brotli 压缩

---

## 📊 当前性能指标

待 Lighthouse 测试完成后更新

---

**下次检查：** 25 分钟后
EOF

    log_success "  性能优化建议已生成：$report_file"
}

# 验证优化
verify_improvements() {
    log_step "【验证阶段】测试优化是否成功..."
    
    local test_passed=true
    
    # 1. 检查服务状态
    log "  检查服务状态..."
    if curl -s http://localhost:3000 > /dev/null; then
        log_success "  ✅ 前端服务正常"
    else
        log_error "  ❌ 前端服务无响应！"
        test_passed=false
    fi
    
    # 2. 检查关键页面
    log "  检查关键页面..."
    for page in "/" "/funds" "/stocks"; do
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$page" --connect-timeout 5)
        if [ "$http_code" = "200" ] || [ "$http_code" = "308" ]; then
            log_success "    ✅ $page (HTTP $http_code)"
        else
            log_error "    ❌ $page (HTTP $http_code)"
            test_passed=false
        fi
    done
    
    # 3. Playwright 快速测试
    log "  执行浏览器测试..."
    if [ -x "$WORKSPACE_DIR/node_modules/.bin/playwright" ]; then
        local pw_test="$WORKSPACE_DIR/.verify-improve.js"
        cat > "$pw_test" << 'PWTEST'
const { chromium } = require('playwright');
(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
        
        const hasContent = await page.$('main');
        const hasError = await page.$('.error, [role="alert"]');
        const buttons = await page.$$('button');
        
        await browser.close();
        
        if (hasContent && !hasError && buttons.length > 0) {
            console.log(JSON.stringify({ success: true }));
        } else {
            console.log(JSON.stringify({ success: false, error: 'Page issue' }));
            process.exit(1);
        }
    } catch (e) {
        console.log(JSON.stringify({ success: false, error: e.message }));
        process.exit(1);
    }
})();
PWTEST
        
        if node "$pw_test" 2>&1 | grep -q '"success":true'; then
            log_success "  ✅ 浏览器测试通过"
            rm -f "$pw_test"
        else
            log_error "  ❌ 浏览器测试失败！"
            rm -f "$pw_test"
            test_passed=false
        fi
    fi
    
    if [ "$test_passed" = true ]; then
        log_success "✅ 所有验证通过！"
        return 0
    else
        log_error "❌ 验证失败！需要回滚"
        return 1
    fi
}

# 回滚优化
rollback_improvements() {
    log_step "【回滚阶段】验证失败，回滚更改..."
    
    cd "$WORKSPACE_DIR"
    
    # Git 回滚
    if git status --porcelain | grep -q "."; then
        git checkout -- app/ components/ 2>/dev/null && {
            log_success "✅ 已回滚代码更改"
        } || log_warning "⚠️  回滚失败"
    fi
    
    # 重启服务
    pm2 restart starlog-frontend >/dev/null 2>&1 && {
        log_success "✅ 服务已重启"
    }
    
    log_error "🚨 自动优化失败，已回滚" >> /home/admin/.openclaw/workspace/ERROR_LOG.md
}

# 提交到 GitHub
commit_and_push() {
    log_step "【提交优化代码】..."
    
    # 先验证
    if ! verify_improvements; then
        rollback_improvements
        log_error "❌ 验证失败，已回滚，不提交"
        return 1
    fi
    
    cd "$WORKSPACE_DIR"
    
    git config user.name "$GIT_USER"
    git config user.email "$GIT_EMAIL"
    
    if git status --porcelain | grep -q "."; then
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        local commit_msg="✨ Auto-Improve: 网站功能优化 ($timestamp)"
        
        git add -A
        git commit -m "$commit_msg" && {
            log_success "✅ 已提交：$commit_msg"
            
            if git push origin master 2>/dev/null || git push origin main 2>/dev/null; then
                log_success "✅ 已推送到 GitHub"
            else
                log_warning "⚠️  Push 失败，但 commit 已保存"
            fi
        } || log_warning "⚠️  提交失败"
    else
        log "ℹ️  没有代码优化，无需提交"
    fi
}

# 主函数
main() {
    mkdir -p "$REPORT_DIR"
    
    log "=========================================="
    log "✨ 开始智能代码优化"
    log "=========================================="
    
    # 1. Metadata 优化
    optimize_metadata
    echo ""
    
    # 2. 图片懒加载
    optimize_images_lazy
    echo ""
    
    # 3. 错误边界
    add_error_boundary
    echo ""
    
    # 4. 性能检查
    performance_check
    echo ""
    
    # 5. 提交优化代码
    commit_and_push
    echo ""
    
    log "=========================================="
    log "✅ 智能代码优化完成"
    log "=========================================="
}

main "$@"
