# -*- coding: utf-8 -*-
"""
基金静态数据
从 data/funds.ts 转换而来
"""

funds = [
    # 股票型基金
    {
        'code': '005827',
        'name': '易方达蓝筹精选混合',
        'type': '股票型',
        'company': '易方达基金',
        'manager': '张坤',
        'netValue': 1.234,
        'change': 0.012,
        'changePercent': 0.98,
        'scale': 100,
        'riskLevel': '中高',
        'tags': ['消费', '蓝筹', '热门']
    },
    {
        'code': '003096',
        'name': '中欧医疗健康混合 A',
        'type': '股票型',
        'company': '中欧基金',
        'manager': '葛兰',
        'netValue': 2.156,
        'change': -0.023,
        'changePercent': -1.06,
        'scale': 300,
        'riskLevel': '高',
        'tags': ['医疗', '热门']
    },
    {
        'code': '260108',
        'name': '景顺长城新兴成长混合',
        'type': '股票型',
        'company': '景顺长城基金',
        'manager': '刘彦春',
        'netValue': 3.421,
        'change': 0.034,
        'changePercent': 1.00,
        'scale': 400,
        'riskLevel': '中高',
        'tags': ['成长', '蓝筹']
    },
    {
        'code': '161725',
        'name': '招商中证白酒指数',
        'type': '指数型',
        'company': '招商基金',
        'manager': None,
        'netValue': 1.089,
        'change': 0.015,
        'changePercent': 1.39,
        'scale': 500,
        'riskLevel': '高',
        'tags': ['白酒', '指数', '热门']
    },
    {
        'code': '007840',
        'name': '汇添富中证新能源汽车产业指数',
        'type': '指数型',
        'company': '汇添富基金',
        'manager': None,
        'netValue': 1.567,
        'change': -0.018,
        'changePercent': -1.14,
        'scale': 200,
        'riskLevel': '高',
        'tags': ['新能源', '汽车', '指数']
    },
    # 混合型基金
    {
        'code': '001938',
        'name': '中欧时代先锋股票 A',
        'type': '混合型',
        'company': '中欧基金',
        'manager': '周应波',
        'netValue': 2.891,
        'change': 0.045,
        'changePercent': 1.58,
        'scale': 350,
        'riskLevel': '中高',
        'tags': ['科技', '成长']
    },
    {
        'code': '005004',
        'name': '交银施罗德新生活力灵活配置混合',
        'type': '混合型',
        'company': '交银施罗德基金',
        'manager': '杨浩',
        'netValue': 2.234,
        'change': 0.021,
        'changePercent': 0.95,
        'scale': 180,
        'riskLevel': '中',
        'tags': ['消费', '科技']
    },
    # 债券型基金
    {
        'code': '000171',
        'name': '易方达裕丰回报债券',
        'type': '债券型',
        'company': '易方达基金',
        'manager': '张清华',
        'netValue': 1.456,
        'change': 0.002,
        'changePercent': 0.14,
        'scale': 600,
        'riskLevel': '低',
        'tags': ['债券', '稳健']
    },
    {
        'code': '002146',
        'name': '长安鑫益增强混合 A',
        'type': '债券型',
        'company': '长安基金',
        'manager': '刘兴旺',
        'netValue': 1.289,
        'change': 0.001,
        'changePercent': 0.08,
        'scale': 150,
        'riskLevel': '低',
        'tags': ['债券', '稳健']
    },
    # QDII 基金
    {
        'code': '000055',
        'name': '广发纳斯达克 100ETF 联接',
        'type': 'QDII',
        'company': '广发基金',
        'manager': None,
        'netValue': 3.567,
        'change': 0.089,
        'changePercent': 2.56,
        'scale': 280,
        'riskLevel': '高',
        'tags': ['美股', '科技', 'QDII']
    },
    {
        'code': '006479',
        'name': '广发纳斯达克 100ETF 联接 C',
        'type': 'QDII',
        'company': '广发基金',
        'manager': None,
        'netValue': 3.512,
        'change': 0.087,
        'changePercent': 2.54,
        'scale': 120,
        'riskLevel': '高',
        'tags': ['美股', '科技', 'QDII']
    },
]
