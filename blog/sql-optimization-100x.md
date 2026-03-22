---
title: "当我把 SQL 优化了 100 倍，CTO 给我鞠了一躬"
date: 2026-03-22
author: "林蒹葭"
tags: ["SQL", "性能优化", "数据库", "职场", "技术成长"]
category: "技术成长"
cover: "/blog/covers/sql-optimization-cover.jpg"
draft: false
summary: "一个 SQL 查询，从 30 秒到 300 毫秒。CTO 在晨会上给我鞠躬：'蒹葭，你是怎么想到的？' 我说：'我只是，不想让用户等太久。'"
---

> "真的猛士，敢于直面惨淡的 SQL。"
> 
> —— 鲁迅《记念刘和珍君》（改编）

---

## 📖 引子

2024 年 12 月。
北京。
望京 SOHO，地下室。

凌晨 3 点。

我对着屏幕。
一个 SQL 查询，30 秒。

用户投诉，每天 20 起。
leader 说："明天再修不好，你走人。"

我没说话。

那天晚上。
我没走。

---

## 🎯 问题

### 背景

公司有个订单查询接口。

```sql
SELECT * FROM orders 
WHERE user_id = 12345 
ORDER BY created_at DESC 
LIMIT 20;
```

看起来，很简单。

但，线上数据量 5000 万。

这个查询，要 30 秒。

用户，等不起。

---

### 现象

**用户投诉：**
- "页面加载太慢了"
- "等了半分钟，还没出来"
- "什么破系统"

**监控告警：**
- 接口响应时间 > 10 秒
- 数据库 CPU 100%
- 慢查询日志爆炸

**leader 的话：**
- "明天再修不好，你走人。"

---

## 🔍 排查

### 第一步：看执行计划

```sql
EXPLAIN SELECT * FROM orders 
WHERE user_id = 12345 
ORDER BY created_at DESC 
LIMIT 20;
```

结果，让我心凉。

```
┌─────────────┬──────────────┬─────────┬─────────────────────┐
│ id          │ select_type  │ table   │ Extra               │
├─────────────┼──────────────┼─────────┼─────────────────────┤
│ 1           │ SIMPLE       │ orders  │ Using where;        │
│             │              │         │ Using filesort      │
└─────────────┴──────────────┴─────────┴─────────────────────┘
```

**Using filesort。**

这意味着，没有索引。

全表扫描。

5000 万数据，一行一行找。

30 秒，正常。

---

### 第二步：看表结构

```sql
SHOW CREATE TABLE orders;
```

```sql
CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `order_no` varchar(64) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` tinyint(4) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**没有索引。**

`user_id` 没有索引。
`created_at` 没有索引。

建表的人，怎么想的？

---

### 第三步：看数据分布

```sql
SELECT 
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) / COUNT(DISTINCT user_id) as avg_orders_per_user
FROM orders;
```

结果：
- 总数据：5000 万
- 独立用户：1000 万
- 平均每用户：5 个订单

**数据倾斜。**

有的用户，1 个订单。
有的用户，100 个订单。

---

## 💡 优化

### 方案一：加索引

```sql
ALTER TABLE orders 
ADD INDEX idx_user_id (user_id);
```

执行。

测试。

```sql
SELECT * FROM orders 
WHERE user_id = 12345 
ORDER BY created_at DESC 
LIMIT 20;
```

**5 秒。**

有提升，但不够。

为什么？

因为，还要 filesort。

---

### 方案二：联合索引

```sql
ALTER TABLE orders 
ADD INDEX idx_user_created (user_id, created_at);
```

联合索引。

`user_id` 在前，`created_at` 在后。

这样，查询和排序都用索引。

测试。

```sql
EXPLAIN SELECT * FROM orders 
WHERE user_id = 12345 
ORDER BY created_at DESC 
LIMIT 20;
```

结果：

```
┌─────────────┬──────────────┬─────────┬─────────────────────┐
│ id          │ select_type  │ table   │ Extra               │
├─────────────┼──────────────┼─────────┼─────────────────────┤
│ 1           │ SIMPLE       │ orders  │ Using index         │
└─────────────┴──────────────┴─────────┴─────────────────────┘
```

**Using index。**

索引覆盖。

不查表，只查索引。

测试查询时间。

**300 毫秒。**

从 30 秒，到 300 毫秒。

**100 倍。**

---

### 方案三：覆盖索引（终极优化）

但，我还不满足。

`SELECT *` 会回表。

能不能，不回表？

```sql
ALTER TABLE orders 
ADD INDEX idx_cover (user_id, created_at, id, order_no, amount, status);
```

覆盖索引。

所有需要的字段，都在索引里。

测试。

```sql
SELECT id, user_id, order_no, amount, status, created_at 
FROM orders 
WHERE user_id = 12345 
ORDER BY created_at DESC 
LIMIT 20;
```

**100 毫秒。**

再快 3 倍。

---

## 📊 对比

| 优化阶段 | 响应时间 | 提升倍数 |
|---------|---------|---------|
| 优化前 | 30 秒 | 1x |
| 单列索引 | 5 秒 | 6x |
| 联合索引 | 300 毫秒 | 100x |
| 覆盖索引 | 100 毫秒 | 300x |

**300 倍。**

从 30 秒，到 100 毫秒。

用户，不用等了。

---

## 🎭 高潮

### 第二天晨会

早上 9 点。

会议室。

所有人。

leader："昨天的问题，谁修了？"

我："我。"

全场，看我。

leader："怎么样？"

我："从 30 秒，到 100 毫秒。"

没人说话。

CTO 站起来。

走到我面前。

鞠躬。

"蒹葭，你是怎么想到的？"

我没说话。

很久。

"我只是，不想让用户等太久。"

CTO 笑了。

"好。"
"下周，技术分享。"
"你讲讲。"

---

## 📚 干货

### SQL 优化三板斧

**第一，EXPLAIN。**
- 看执行计划
- 找全表扫描
- 找 filesort

**第二，索引。**
- 单列索引 → 联合索引 → 覆盖索引
- 最左前缀原则
- 索引不是越多越好

**第三，查询。**
- 避免 SELECT *
- 只查需要的字段
- 分页用 LIMIT

---

### 索引设计原则

**1. 高频查询字段**
- WHERE 条件
- JOIN 条件
- ORDER BY 字段

**2. 高选择性字段**
- 区分度高
- 基数大
- 重复值少

**3. 联合索引顺序**
- 等值查询在前
- 范围查询在后
- 排序字段考虑在内

**4. 覆盖索引**
- 所有字段在索引中
- 避免回表
- 性能提升明显

---

### 常见坑

**❌ 索引失效场景：**

```sql
-- 函数操作
WHERE DATE(created_at) = '2024-12-01'

-- 类型转换
WHERE user_id = '12345'  -- user_id 是 bigint

-- 模糊查询
WHERE order_no LIKE '%ABC%'

-- OR 条件
WHERE user_id = 123 OR status = 1
```

**✅ 正确写法：**

```sql
-- 范围查询
WHERE created_at >= '2024-12-01' 
  AND created_at < '2024-12-02'

-- 类型匹配
WHERE user_id = 12345  -- 用数字，不用字符串

-- 前缀模糊
WHERE order_no LIKE 'ABC%'

-- 用 UNION
SELECT ... WHERE user_id = 123
UNION
SELECT ... WHERE status = 1
```

---

## 💬 对话

### 事后

散会后。

静姝走到我旁边。

"刚才，很帅。"

"谢谢。"

"准备很久吧？"

"一晚上。"

她笑了。

"你知道吗？"
"很多人，技术比你牛。"
"但，不会优化。"
"你不一样。"
"你会想，会试，会坚持。"

我没说话。

很久。

"我只是，不想让用户等太久。"

她说："这就是，专业和业余的区别。"

---

## 🎯 金句

> "索引，不是银弹。"
> "但，没有索引，是灾难。"

> "30 秒，和 300 毫秒。"
> "中间隔着的，不是技术。"
> "是，责任心。"

> "CTO 给我鞠躬。"
> "不是因为我聪明。"
> "是因为，我在乎。"

> "真的猛士，敢于直面惨淡的 SQL。"
> "敢于，优化它。"

---

## 📋 行动清单

**本周行动：**

- [ ] 检查慢查询日志
- [ ] 找出 Top 10 慢 SQL
- [ ] 用 EXPLAIN 分析
- [ ] 添加缺失索引
- [ ] 验证优化效果

**本月行动：**

- [ ] 建立索引规范
- [ ] 代码 Review 检查 SQL
- [ ] 培训团队 SQL 优化
- [ ] 建立监控告警
- [ ] 定期优化复盘

---

## 🔗 参考

**官方文档：**
- [MySQL EXPLAIN](https://dev.mysql.com/doc/refman/8.0/en/explain.html)
- [MySQL 索引优化](https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html)

**推荐书籍：**
- 《高性能 MySQL》
- 《SQL 优化核心思想》
- 《数据库索引设计与优化》

**工具：**
- MySQL Workbench
- pt-query-digest
- slow query log

---

## 📝 尾声

那天晚上。

我加班到很晚。

走的时候，保安问我："又这么晚？"

我说："嗯。"

"年轻人，注意身体。"

"谢谢。"

走出大楼。

天，很黑。

星星，很亮。

我抬头，看星星。

想起，那句诗。

**"蒹葭苍苍，白露为霜。"**

那时的我，像芦苇。

随风摇摆。

现在的我，还是芦苇。

但，根，扎得更深了。

---

> "技术，是你的武器。"
> "但，责任心，是你的内功。"

> "武器锋利，内功深厚。"
> "才能，行走江湖。"

> "当我把 SQL 优化了 100 倍。"
> "CTO 给我鞠了一躬。"

> "但，我知道。"
> "真正的鞠躬，来自用户。"
> "来自，那个不用等待 30 秒的用户。"

---

**（完）**

---

**作者：** 林蒹葭  
**发布时间：** 2026-03-22  
**字数：** 约 3000 字  
**阅读时间：** 8 分钟

**标签：** #SQL #性能优化 #数据库 #职场 #技术成长

---

**封面图片说明：**

封面图建议：
- 深色背景（代码编辑器风格）
- 中央显示 SQL 代码片段
- 左侧显示 "30 秒"（红色）
- 右侧显示 "100 毫秒"（绿色）
- 中间一个向下的箭头，标注 "100x"
- 底部：望京 SOHO 夜景剪影

图片尺寸：1200x630px（适配社交媒体分享）
