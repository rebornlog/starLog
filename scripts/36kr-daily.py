#!/usr/bin/env python3
"""
36kr 热榜日报 - 自动抓取 + AI 总结 + 飞书推送
每天 9 点执行，推送 Top5 热点到飞书群
"""

import subprocess
import json
import sys
from datetime import datetime

# 配置
OUTPUT_FILE = "/tmp/36kr-daily-report.json"
FEISHU_GROUP_ID = "oc_243b4984ac32e0d58d6a2a9089f40908"

def run_openclaw_command():
    """使用 OpenClaw 工具抓取 36kr 并生成报告"""
    
    # 这里调用 OpenClaw 的 browser 和 sessions_send 工具
    # 实际执行时通过 openclaw CLI 或 API 调用
    script = '''
# 1. 打开 36kr 首页
browser action=open targetUrl=https://36kr.com/ profile=openclaw target=host

# 2. 获取页面快照
browser action=snapshot refs=aria

# 3. 提取热榜文章（从 snapshot 结果中解析）
# 4. 对 Top5 文章调用 web_fetch 获取详情
# 5. 调用 AI 生成摘要
# 6. 使用 sessions_send 发送到飞书群
'''
    return script

def generate_report(articles):
    """生成日报格式"""
    today = datetime.now().strftime("%Y/%m/%d")
    
    report = f"""## 📰 36kr 热榜日报 - {today}

### 🔥 Top5 热点

"""
    
    for i, article in enumerate(articles[:5], 1):
        report += f"""{i}. **{article.get('title', '无标题')}**
   - 摘要：{article.get('summary', '暂无摘要')}
   - 链接：{article.get('url', '#')}

"""
    
    report += """---
💡 日报由 AI 自动生成，如需调整格式或内容，请联系 @老柱子
"""
    
    return report

def send_to_feishu(content):
    """发送到飞书群"""
    # 使用 OpenClaw message 工具
    cmd = f'''
    openclaw message send --channel=feishu --target="{FEISHU_GROUP_ID}" --message='{content}'
    '''
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        return result.returncode == 0
    except Exception as e:
        print(f"发送失败：{e}")
        return False

def main():
    print(f"🚀 开始执行 36kr 日报任务 - {datetime.now()}")
    
    # 示例数据（实际执行时从 36kr 抓取）
    sample_articles = [
        {
            "title": "全球首款手机龙虾 app，来了",
            "summary": "大厂们开始卷龙虾了，这是新的流量密码还是昙花一现？",
            "url": "https://36kr.com/p/3719423884211841"
        },
        {
            "title": "微信「绝密 AI」浮出水面：不拼大模型，14 亿月活的小程序才是王牌？",
            "summary": "微信的 AI 战略可能和你想的不一样，小程序生态或是关键。",
            "url": "https://36kr.com/p/3719414899241728"
        },
        {
            "title": "苹果折叠屏：打开像 iPad，合上是 iPhone，但...",
            "summary": "苹果的折叠屏手机终于要来了？价格可能超出预期。",
            "url": "https://36kr.com/p/3719593566090629"
        },
        {
            "title": "马斯克的新"龙虾"曝光："数字擎天柱"来了",
            "summary": "马斯克又搞新花样，这次是数字版的擎天柱。",
            "url": "https://36kr.com/p/3719341173028224"
        },
        {
            "title": "8 点 1 氪丨微信新功能可"忽略"语音/视频来电；多所高校紧急禁用 AI 龙虾；苹果折叠屏顶配或超 2 万元",
            "summary": "早间新闻汇总，微信更新、高校禁用 AI、苹果折叠屏价格曝光。",
            "url": "https://36kr.com/p/3720613899958912"
        }
    ]
    
    # 生成报告
    report = generate_report(sample_articles)
    print(f"📋 生成报告:\n{report}")
    
    # 发送到飞书
    # success = send_to_feishu(report)
    # if success:
    #     print("✅ 推送成功！")
    # else:
    #     print("❌ 推送失败")
    
    print("\n⚠️  当前为测试模式，实际推送需配置 OpenClaw message 工具")
    return 0

if __name__ == "__main__":
    sys.exit(main())
