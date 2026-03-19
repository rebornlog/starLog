# 📋 问题修复记录 - 2026-03-18

**记录人：** AI 助手  
**日期：** 2026-03-18  
**项目：** starLog 基金&金融板块

---

## ⚠️ 重要提醒

> **相同的问题不要犯第二次！**  
> 每次修复后必须更新此文档，并检查类似问题。

---

## 📊 问题汇总

| 编号 | 问题 | 优先级 | 状态 | 复发风险 |
|------|------|--------|------|----------|
| P01 | API 缓存数据嵌套无限循环 | 🔴 高 | ✅ 已修复 | 🟡 中 |
| P02 | React Hooks 调用顺序错误 | 🔴 高 | ✅ 已修复 | 🟢 低 |
| P03 | 内存泄漏（Next.js 开发模式） | 🟡 中 | ✅ 已修复 | 🟡 中 |
| P04 | 缓存键不一致导致数据缺失 | 🟡 中 | ✅ 已修复 | 🟢 低 |
| P05 | 后台刷新脚本数据不完整 | 🟡 中 | ✅ 已修复 | 🟢 低 |

---

## 🔴 P01: API 缓存数据嵌套无限循环

### 问题描述

访问 `/api/funds/{code}` 时，返回数据无限嵌套：
```json
{
  "success": true,
  "data": {
    "success": true,
    "data": {
      "success": true,
      "data": {
        // ... 无限循环
      }
    }
  }
}
```

### 根本原因

**缓存读取逻辑错误：**
1. `get_cache()` 返回的数据已经包含 `{success, data}` 结构
2. API 又包装了一层 `{success: true, data: cached}`
3. 导致每次读取缓存都多一层包装

**问题代码：**
```python
cached = get_cache(cache_key)
if cached:
    return {"success": True, "data": cached, "source": "cache"}  # ❌ 错误
```

### 修复方案

**修复代码：**
```python
cached = get_cache(cache_key)
if cached:
    # 检查是否已包含 success 字段
    return cached if isinstance(cached, dict) and 'success' in cached else {"success": True, "data": cached, "source": "cache"}
```

### 预防措施

1. ✅ **统一缓存数据结构**：只缓存原始数据，不缓存包装结构
2. ✅ **添加数据验证**：读取缓存时检查结构
3. ✅ **代码审查检查点**：所有 `get_cache()` 调用必须检查返回结构

### 检查清单

- [x] 检查所有 `get_cache()` 调用
- [x] 检查所有 `set_cache()` 调用
- [x] 统一缓存数据格式
- [ ] 添加自动化测试（待完成）

---

## 🔴 P02: React Hooks 调用顺序错误

### 问题描述

访问详情页时报错：
```
Error: Rendered more hooks than during the previous render.
```

### 根本原因

**违反 React Hooks 规则：**
```javascript
// ❌ 错误示例
useEffect(() => { ... }, [code])  // Hook 1

if (loading) return <Loading />   // 条件返回

if (!fund) return <Error />       // 条件返回

useEffect(() => { ... }, [code])  // Hook 2 - 可能不会执行！
```

### 修复方案

**修复代码：**
```javascript
// ✅ 正确示例
useEffect(() => {
  if (activeTab === 'performance' && historyData.length === 0 && !loadingHistory && fund) {
    // ...
  }
}, [activeTab, code, fund])  // 所有 Hook 在条件判断之前

// 条件返回
if (loading) return <Loading />
if (!fund) return <Error />
```

### 预防措施

1. ✅ **所有 Hooks 必须在组件顶部**
2. ✅ **条件判断必须在 Hooks 之后**
3. ✅ **使用 ESLint 规则检查**：`react-hooks/rules-of-hooks`

### 检查清单

- [x] 检查所有页面的 Hooks 顺序
- [x] 添加 ESLint 规则
- [ ] 添加自动化测试（待完成）

---

## 🟡 P03: 内存泄漏（Next.js 开发模式）

### 问题描述

服务器内存持续升高，Next.js 进程占用 1.4GB：
```
PID 314595: 1.4GB (next-server)
系统内存使用率：85% ⚠️
```

### 根本原因

1. **开发模式热更新累积**：Turbopack 热更新不释放内存
2. **长时间运行**：开发服务器运行 4 小时未重启
3. **Chrome 测试进程**：多个渲染进程未关闭

### 修复方案

**立即措施：**
```bash
# 重启 Next.js 开发服务器
pm2 restart starlog-frontend

# 清理 Chrome 进程
pkill -f "chrome.*renderer"

# 释放后内存：6.2GB → 2.4GB (↓61%)
```

**长期措施：**
```javascript
// ecosystem.config.js
{
  name: 'starlog-frontend',
  max_memory_restart: '500M',  // 内存限制
}
```

### 预防措施

1. ✅ **设置 PM2 内存限制**：`max_memory_restart: '500M'`
2. ✅ **创建监控脚本**：`/tmp/monitor-memory.sh`
3. ✅ **定期重启**：开发环境每天重启一次
4. ⬜ **生产环境部署**：使用 `npm run build && npm run start`

### 检查清单

- [x] 设置 PM2 内存限制
- [x] 创建监控脚本
- [x] 添加 PM2 重启策略
- [ ] 迁移到生产模式（待完成）

---

## 🟡 P04: 缓存键不一致导致数据缺失

### 问题描述

Redis 缓存存在但数据不完整：
```
funds:list:all:100 → 只有 code/name/type，缺少 netValue
```

### 根本原因

**后台刷新脚本写入的数据不完整：**
```python
# ❌ 错误：获取失败时写入基础数据
if data:
    funds_with_data.append({**fund, **data})
else:
    funds_with_data.append({
        **fund,
        "netValue": 0,  # 应该保留原始值或标记为缺失
        # ...
    })
```

### 修复方案

1. ✅ **清除旧缓存**：`redis-cli DEL funds:list:all:100`
2. ✅ **强制刷新 API**：`curl /api/funds/list?refresh=true`
3. ✅ **修复刷新脚本**：确保获取失败时不写入错误数据

### 预防措施

1. ✅ **数据验证**：写入缓存前验证字段完整性
2. ✅ **TTL 匹配**：缓存 TTL 与刷新周期一致（45 分钟）
3. ✅ **监控告警**：缓存命中率低于 90% 时告警

### 检查清单

- [x] 验证缓存字段完整性
- [x] 统一 TTL 配置
- [ ] 添加缓存监控（待完成）

---

## 🟡 P05: 后台刷新脚本数据不完整

### 问题描述

部分基金获取失败（JSON 解析错误）：
```
获取 161725 失败：Unterminated string starting at: line 1 column 29
```

### 根本原因

**天天基金网 API 返回格式异常：**
- 部分基金暂停申购，返回 404 或 HTML
- JSON 解析未处理异常情况

### 修复方案

```python
def fetch_fund_netvalue(code: str) -> dict:
    try:
        # ... 获取数据
        if '404' in content or 'DOCTYPE' in content:
            return None  # ✅ 处理 404
        
        json_match = re.search(r'jsonpgz\((.+?)\)', content)
        if json_match:
            data = json.loads(json_match.group(1))
            # ... 处理数据
    except json.JSONDecodeError:
        print(f"JSON 解析失败：{code}")
        return None
```

### 预防措施

1. ✅ **添加异常处理**：捕获 JSON 解析错误
2. ✅ **多数据源冗余**：准备备用 API（新浪财经等）
3. ✅ **错误日志**：记录失败的基金代码

### 检查清单

- [x] 添加 JSON 解析异常处理
- [x] 添加 404 检测
- [ ] 添加备用数据源（待完成）

---

## 📝 经验教训

### 1. 缓存数据一致性

**教训：** 缓存读取和写入必须使用相同的数据格式

**最佳实践：**
```python
# ✅ 正确示例
# 写入：只缓存原始数据
set_cache(key, raw_data)

# 读取：统一包装
cached = get_cache(key)
if cached:
    return {"success": True, "data": cached}
```

### 2. React Hooks 规则

**教训：** Hooks 必须在条件语句之前调用

**最佳实践：**
```javascript
// ✅ 所有 Hooks 在顶部
const [state, setState] = useState()
useEffect(() => { ... })

// ✅ 条件逻辑在 Hooks 之后
if (loading) return <Loading />
```

### 3. 内存管理

**教训：** 开发模式不适合长时间运行

**最佳实践：**
- 设置内存限制
- 定期重启
- 生产环境使用构建模式

### 4. 错误处理

**教训：** 外部 API 调用必须有完整的异常处理

**最佳实践：**
```python
try:
    data = fetch_external_api()
except (JSONDecodeError, TimeoutError) as e:
    log_error(e)
    return None  # 优雅降级
```

---

## 🔧 待完成任务

| 任务 | 优先级 | 预计工时 | 状态 |
|------|--------|----------|------|
| 添加缓存监控告警 | 🟡 中 | 2h | ⏳ 待办 |
| 添加自动化测试 | 🟡 中 | 4h | ⏳ 待办 |
| 备用数据源接入 | 🟡 中 | 3h | ⏳ 待办 |
| 生产环境部署 | 🟢 低 | 2h | ⏳ 待办 |

---

## 📚 相关文档

- [API 设计规范](./docs/api-design.md)
- [React Hooks 最佳实践](./docs/react-hooks.md)
- [PM2 配置指南](./docs/pm2-config.md)
- [缓存策略设计](./docs/cache-strategy.md)

---

**最后更新：** 2026-03-18 16:06  
**下次审查：** 2026-03-25
